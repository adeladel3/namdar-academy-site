import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  generateId,
  getChapter,
  listLessonsByChapter,
  upsertLesson,
} from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id: chapterId } = await params;
  const chapter = getChapter(chapterId);
  if (!chapter)
    return NextResponse.json({ error: "chapter not found" }, { status: 404 });

  let body: {
    title?: string;
    videoUrl?: string;
    videoDurationSec?: number;
    freePreview?: boolean;
    content?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const title = body.title?.trim();
  if (!title)
    return NextResponse.json({ error: "عنوان درس الزامی است" }, { status: 400 });

  const nextOrder = listLessonsByChapter(chapterId).length;
  const id = generateId(chapter.courseSlug);
  upsertLesson({
    id,
    chapterId,
    courseSlug: chapter.courseSlug,
    title,
    order: nextOrder,
    videoUrl: body.videoUrl?.trim() || undefined,
    videoDurationSec:
      typeof body.videoDurationSec === "number" ? body.videoDurationSec : 0,
    freePreview: body.freePreview === true,
    content: typeof body.content === "string" ? body.content : undefined,
  });
  return NextResponse.json({ success: true, id });
}
