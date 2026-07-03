import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getStaticPage, logAudit, upsertStaticPage } from "@/lib/db";
import { isValidSlug } from "@/lib/slug";

// Static pages are rendered through <LegacyHtml> which intentionally
// executes embedded <script> and <style> (for the migrated calculator
// page). That means every author of a static page can ship arbitrary
// JavaScript to visitors. We lock CRUD to role==="admin" — support staff
// must not be able to push code onto the public site.
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  let body: {
    slug?: string;
    title?: string;
    summary?: string;
    body?: string;
    published?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const slug = body.slug?.trim();
  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json({ error: "آدرس نامعتبر" }, { status: 400 });
  }
  if (getStaticPage(slug)) {
    return NextResponse.json(
      { error: "صفحه‌ای با این آدرس از قبل وجود دارد" },
      { status: 409 }
    );
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
  }

  const now = Date.now();
  upsertStaticPage({
    slug,
    title: body.title.trim(),
    summary: body.summary?.trim() ?? "",
    body: body.body ?? "",
    published: body.published === true,
    createdAt: now,
    updatedAt: now,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "staticPage.create",
    targetType: "staticPage",
    targetId: slug,
  });

  return NextResponse.json({ success: true, slug });
}
