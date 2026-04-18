import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteCourse,
  getCourse,
  logAudit,
  upsertCourse,
  type CourseLevelKey,
  type CourseRecord,
} from "@/lib/db";

const LEVELS: CourseLevelKey[] = ["beginner", "intermediate", "advanced"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { slug } = await params;
  const existing = getCourse(slug);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<CourseRecord> & {
    categoryId?: string | null;
    badge?: string | null;
    discountPrice?: number | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const next: CourseRecord = {
    ...existing,
    title: typeof body.title === "string" ? body.title : existing.title,
    shortDesc:
      typeof body.shortDesc === "string" ? body.shortDesc : existing.shortDesc,
    longDesc:
      typeof body.longDesc === "string" ? body.longDesc : existing.longDesc,
    previewImage:
      typeof body.previewImage === "string"
        ? body.previewImage
        : existing.previewImage,
    previewVideoUrl:
      body.previewVideoUrl === undefined
        ? existing.previewVideoUrl
        : typeof body.previewVideoUrl === "string" && body.previewVideoUrl
        ? body.previewVideoUrl
        : undefined,
    categoryId:
      body.categoryId === undefined
        ? existing.categoryId
        : body.categoryId || undefined,
    tagIds: Array.isArray(body.tagIds) ? body.tagIds : existing.tagIds,
    level:
      body.level && LEVELS.includes(body.level as CourseLevelKey)
        ? (body.level as CourseLevelKey)
        : existing.level,
    price: typeof body.price === "number" ? Math.max(0, body.price) : existing.price,
    discountPrice:
      body.discountPrice === undefined
        ? existing.discountPrice
        : typeof body.discountPrice === "number" && body.discountPrice > 0
        ? body.discountPrice
        : undefined,
    isFree: typeof body.isFree === "boolean" ? body.isFree : existing.isFree,
    allowPurchase:
      typeof body.allowPurchase === "boolean"
        ? body.allowPurchase
        : existing.allowPurchase,
    instructor:
      typeof body.instructor === "string"
        ? body.instructor
        : existing.instructor,
    badge:
      body.badge === undefined
        ? existing.badge
        : typeof body.badge === "string" && body.badge.trim()
        ? body.badge
        : undefined,
  };

  upsertCourse(next);
  logAudit({
    actorId: guard.session.userId,
    action: "course.edit",
    targetType: "course",
    targetId: slug,
  });
  return NextResponse.json({ success: true, course: next });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { slug } = await params;
  if (!getCourse(slug))
    return NextResponse.json({ error: "not found" }, { status: 404 });
  deleteCourse(slug);
  logAudit({
    actorId: guard.session.userId,
    action: "course.delete",
    targetType: "course",
    targetId: slug,
  });
  return NextResponse.json({ success: true });
}
