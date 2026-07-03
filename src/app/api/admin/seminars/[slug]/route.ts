import { NextResponse } from "next/server";
import { requirePerm } from "@/lib/admin-guard";
import {
  deleteSeminar,
  getSeminar,
  grantCourseSupporterPerms,
  logAudit,
  upsertSeminar,
  type SeminarRecord,
} from "@/lib/db";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function resolve(slug: string): SeminarRecord | undefined {
  return getSeminar(slug) ?? getSeminar(safeDecode(slug));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const guard = await requirePerm("seminar.view");
  if (!guard.ok) return guard.response;
  const { slug } = await ctx.params;
  const seminar = resolve(slug);
  if (!seminar) return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });
  return NextResponse.json({ seminar });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const guard = await requirePerm("seminar.edit", req);
  if (!guard.ok) return guard.response;
  const { slug } = await ctx.params;
  const seminar = resolve(slug);
  if (!seminar) return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });

  let body: Partial<SeminarRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // فقط فیلدهایی که از سمت کاربر مجاز است ویرایش شوند را اعمال کنیم.
  // اطلاعات پایه مثل slug، createdAt و بلوک‌ها از مسیرهای جدا تغییر می‌کنند.
  const editable: (keyof SeminarRecord)[] = [
    "title",
    "shortTitle",
    "shortDesc",
    "longDesc",
    "price",
    "discountPrice",
    "allowPurchase",
    "status",
    "eventDate",
    "venueName",
    "venueAddress",
    "venueMapUrl",
    "capacity",
    "showCapacityCounter",
    "heroImage",
    "heroVideoUrl",
    "instructorName",
    "instructorBio",
    "instructorImage",
    "instructorTagline",
    "instructorStats",
    "supportPhone",
    "supportTelegram",
    "heroEyebrow",
    "heroSubtitle",
    "heroPromise",
    "painPointsTitle",
    "painPoints",
    "beforeAfterTitle",
    "beforeAfter",
    "finalCtaTitle",
    "finalCtaDescription",
    "supportAdminIds",
  ];
  const next: SeminarRecord = { ...seminar, updatedAt: Date.now() };
  for (const key of editable) {
    if (key in body) {
      // @ts-expect-error indexed assignment across partial keys
      next[key] = body[key];
    }
  }
  // اگر وضعیت به published تغییر کرد و publishedAt نداریم، الان ست کنیم.
  if (next.status === "published" && !next.publishedAt) {
    next.publishedAt = Date.now();
  }

  upsertSeminar(next);

  // اعطای خودکار مجوز پاسخ به تیکت برای پشتیبان‌های تازه‌اضافه‌شده — معادل
  // همان منطق دوره‌ها در /api/admin/courses/[slug]/route.ts.
  const prevSupport = new Set(seminar.supportAdminIds ?? []);
  const addedSupporters = (next.supportAdminIds ?? []).filter(
    (id) => !prevSupport.has(id)
  );
  if (addedSupporters.length > 0) {
    grantCourseSupporterPerms(addedSupporters);
  }

  logAudit({
    actorId: guard.session.userId,
    action: "seminar.edit",
    targetType: "seminar",
    targetId: seminar.slug,
  });
  return NextResponse.json({ seminar: next });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const guard = await requirePerm("seminar.delete", req);
  if (!guard.ok) return guard.response;
  const { slug } = await ctx.params;
  const seminar = resolve(slug);
  if (!seminar) return NextResponse.json({ error: "سمینار پیدا نشد" }, { status: 404 });
  const ok = deleteSeminar(seminar.slug);
  logAudit({
    actorId: guard.session.userId,
    action: "seminar.delete",
    targetType: "seminar",
    targetId: seminar.slug,
  });
  return NextResponse.json({ ok });
}
