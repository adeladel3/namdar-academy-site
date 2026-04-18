import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  generateId,
  getCourse,
  listChapters,
  listLessonsByChapter,
  logAudit,
  upsertChapter,
  upsertCourse,
  upsertLesson,
} from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const src = getCourse(slug);
  if (!src) return NextResponse.json({ error: "not found" }, { status: 404 });

  let suffix = 1;
  let newSlug = `${slug}-copy`;
  while (getCourse(newSlug)) newSlug = `${slug}-copy-${++suffix}`;

  const now = Date.now();
  upsertCourse({
    ...src,
    slug: newSlug,
    title: `${src.title} (کپی)`,
    status: "draft",
    publishedAt: undefined,
    studentsCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  for (const ch of listChapters(slug)) {
    const newChId = generateId("ch");
    upsertChapter({
      id: newChId,
      courseSlug: newSlug,
      title: ch.title,
      order: ch.order,
    });
    const lessons = listLessonsByChapter(ch.id);
    for (const l of lessons) {
      const newLessonId = generateId(newSlug);
      upsertLesson({
        ...l,
        id: newLessonId,
        chapterId: newChId,
        courseSlug: newSlug,
      });
    }
  }

  logAudit({
    actorId: guard.session.userId,
    action: "course.duplicate",
    targetType: "course",
    targetId: slug,
    metadata: { newSlug },
  });

  return NextResponse.json({ success: true, slug: newSlug });
}
