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

  upsertProgress({
    userId: session.userId,
    lessonId,
    courseSlug: lesson.courseSlug,
    positionSec: position,
    maxPositionSec: Math.max(position, existing?.maxPositionSec ?? 0),
    watchedSec: (existing?.watchedSec ?? 0) + delta,
    watchCount:
      body.event === "play"
        ? (existing?.watchCount ?? 0) + 1
        : existing?.watchCount ?? (existing ? 0 : 1),
    completed:
      typeof body.completed === "boolean"
        ? body.completed
        : existing?.completed ?? false,
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
