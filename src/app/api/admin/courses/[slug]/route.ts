import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteCourse,
  getCourse,
  grantCourseSupporterPerms,
  listCourses,
  logAudit,
  upsertCourse,
  type CourseLevelKey,
  type CourseRecord,
  type SyllabusIconKey,
  type SyllabusSection,
} from "@/lib/db";

const VALID_SYLLABUS_ICONS: SyllabusIconKey[] = [
  "brain",
  "money",
  "chart",
  "graduation",
  "globe",
  "star",
  "shield",
  "book",
  "target",
  "rocket",
  "calendar",
  "check",
];

function sanitizeSyllabusSections(input: unknown): SyllabusSection[] | undefined {
  if (!Array.isArray(input)) return undefined;
  // Cap at 20 sections × 12 bullets × 200 chars to keep one course's
  // syllabus payload bounded (~50KB worst-case). Defense against an
  // accidental loop or a clipboard paste of a giant document.
  return input
    .slice(0, 20)
    .map((raw): SyllabusSection | null => {
      if (!raw || typeof raw !== "object") return null;
      const r = raw as Record<string, unknown>;
      const title = typeof r.title === "string" ? r.title.trim().slice(0, 160) : "";
      if (!title) return null;
      const iconKey =
        typeof r.iconKey === "string" &&
        (VALID_SYLLABUS_ICONS as string[]).includes(r.iconKey)
          ? (r.iconKey as SyllabusIconKey)
          : "star";
      const id =
        typeof r.id === "string" && r.id.trim()
          ? r.id.trim().slice(0, 64)
          : `s_${Math.random().toString(36).slice(2, 10)}`;
      const bullets = Array.isArray(r.bullets)
        ? (r.bullets as unknown[])
            .filter((b): b is string => typeof b === "string")
            .map((b) => b.trim().slice(0, 200))
            .filter(Boolean)
            .slice(0, 12)
        : [];
      return { id, title, iconKey, bullets };
    })
    .filter((s): s is SyllabusSection => s !== null);
}
import { sanitizeRichHtml } from "@/lib/sanitize-html";

const LEVELS: CourseLevelKey[] = ["beginner", "intermediate", "advanced"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff(req);
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
    accentColor?: string | null;
    bannerTitle?: string | null;
    landingSlot?: number | null;
    externalHref?: string | null;
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
      typeof body.longDesc === "string"
        ? sanitizeRichHtml(body.longDesc)
        : existing.longDesc,
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
    accentColor:
      body.accentColor === undefined
        ? existing.accentColor
        : typeof body.accentColor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(body.accentColor.trim())
        ? body.accentColor.trim()
        : undefined,
    bannerTitle:
      body.bannerTitle === undefined
        ? existing.bannerTitle
        : typeof body.bannerTitle === "string" && body.bannerTitle.trim()
        ? body.bannerTitle.trim()
        : undefined,
    landingSlot:
      body.landingSlot === undefined
        ? existing.landingSlot
        : typeof body.landingSlot === "number" &&
          Number.isInteger(body.landingSlot) &&
          body.landingSlot >= 0 &&
          body.landingSlot <= 6
        ? body.landingSlot
        : undefined,
    externalHref:
      body.externalHref === undefined
        ? existing.externalHref
        : typeof body.externalHref === "string" && body.externalHref.trim()
        ? body.externalHref.trim()
        : undefined,
    supportAdminIds: Array.isArray(
      (body as { supportAdminIds?: unknown }).supportAdminIds
    )
      ? (
          (body as { supportAdminIds: unknown[] }).supportAdminIds.filter(
            (id) => typeof id === "string" && id.length > 0
          ) as string[]
        )
      : existing.supportAdminIds,
    agentCommissionPercent:
      body.agentCommissionPercent === undefined
        ? existing.agentCommissionPercent
        : typeof body.agentCommissionPercent === "number" &&
          body.agentCommissionPercent >= 0 &&
          body.agentCommissionPercent <= 100
        ? body.agentCommissionPercent
        : undefined,
    accessDurationDays:
      body.accessDurationDays === undefined
        ? existing.accessDurationDays
        : typeof body.accessDurationDays === "number" &&
          body.accessDurationDays > 0 &&
          body.accessDurationDays <= 36500
        ? Math.round(body.accessDurationDays)
        : undefined,
    spotPlayerCourseId:
      body.spotPlayerCourseId === undefined
        ? existing.spotPlayerCourseId
        : typeof body.spotPlayerCourseId === "string" &&
          body.spotPlayerCourseId.trim()
        ? body.spotPlayerCourseId.trim()
        : undefined,
    hideStudentsCount:
      typeof body.hideStudentsCount === "boolean"
        ? body.hideStudentsCount
        : existing.hideStudentsCount,
    syllabusSections:
      (body as { syllabusSections?: unknown }).syllabusSections === undefined
        ? existing.syllabusSections
        : sanitizeSyllabusSections(
            (body as { syllabusSections?: unknown }).syllabusSections
          ),
  };

  // Enforce slot uniqueness: if this course is claiming a slot someone else
  // already holds, vacate that other course from the slot first.
  if (typeof next.landingSlot === "number") {
    for (const other of listCourses()) {
      if (other.slug !== next.slug && other.landingSlot === next.landingSlot) {
        upsertCourse({ ...other, landingSlot: undefined });
      }
    }
  }

  upsertCourse(next);

  // اعطای خودکار مجوز پاسخ به تیکت برای کاربران تازه‌اضافه‌شده به لیست
  // پشتیبان‌های دوره. بدون این، یک کاربر معمولی که به‌عنوان پشتیبان دوره
  // تعیین می‌شود، حتی نمی‌تواند وارد /admin شود چون isStaff() مجوز نمی‌بیند.
  const prevSupport = new Set(existing.supportAdminIds ?? []);
  const addedSupporters = (next.supportAdminIds ?? []).filter(
    (id) => !prevSupport.has(id)
  );
  if (addedSupporters.length > 0) {
    grantCourseSupporterPerms(addedSupporters);
  }

  logAudit({
    actorId: guard.session.userId,
    action: "course.edit",
    targetType: "course",
    targetId: slug,
  });
  return NextResponse.json({ success: true, course: next });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff(req);
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
