import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getLesson,
  getProgress,
  isEnrolled,
  upsertProgress,
  appendWatchEvent,
} from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: {
    lessonId?: string;
    positionSec?: number;
    completed?: boolean;
    event?: "play" | "pause" | "seek" | "progress" | "end";
    sessionId?: string;
    deltaSec?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { lessonId } = body;
  if (typeof lessonId !== "string") {
    return NextResponse.json({ error: "missing lessonId" }, { status: 400 });
  }
  const lesson = getLesson(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "lesson not found" }, { status: 404 });
  }
  if (
    !isEnrolled(session.userId, lesson.courseSlug) &&
    session.role !== "admin" &&
    !lesson.freePreview
  ) {
    return NextResponse.json({ error: "not enrolled" }, { status: 403 });
  }

  const existing = getProgress(session.userId, lessonId);
  const now = Date.now();
  const position =
    typeof body.positionSec === "number" && body.positionSec >= 0
      ? body.positionSec
      : existing?.positionSec ?? 0;
  const delta = Math.max(0, body.deltaSec ?? 0);

  // Gate "completed" server-side: only accept true on an actual video "end"
  // event where the reported position is within 5s of the known duration, or
  // from admins. Once true, stays true. This stops clients from flipping the
  // flag by POSTing { completed: true } to skip the 100%-watch gate.
  const maxPos = Math.max(position, existing?.maxPositionSec ?? 0);
  const durationSec = lesson.videoDurationSec ?? 0;
  let completed = existing?.completed ?? false;
  if (!completed && body.completed === true) {
    const reachedEnd =
      durationSec > 0 && body.event === "end" && position >= durationSec - 5;
    if (session.role === "admin" || reachedEnd) completed = true;
  }

  upsertProgress({
    userId: session.userId,
    lessonId,
    courseSlug: lesson.courseSlug,
    positionSec: position,
    maxPositionSec: maxPos,
    watchedSec: (existing?.watchedSec ?? 0) + delta,
    watchCount:
      body.event === "play"
        ? (existing?.watchCount ?? 0) + 1
        : existing?.watchCount ?? (existing ? 0 : 1),
    completed,
    firstWatchedAt: existing?.firstWatchedAt ?? now,
    lastWatchedAt: now,
  });

  if (body.event) {
    appendWatchEvent({
      userId: session.userId,
      lessonId,
      sessionId: body.sessionId ?? "n/a",
      type: body.event,
      positionSec: position,
      timestamp: now,
    });
  }

  return NextResponse.json({ success: true });
}
