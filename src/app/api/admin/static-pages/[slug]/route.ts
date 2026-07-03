import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  deleteStaticPage,
  getStaticPage,
  logAudit,
  upsertStaticPage,
  type StaticPageRecord,
} from "@/lib/db";

// Both PATCH and DELETE are admin-only — static pages execute embedded
// scripts via <LegacyHtml> and must not be editable by support.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  const { slug } = await params;
  const existing = getStaticPage(slug);
  if (!existing)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<StaticPageRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  upsertStaticPage({
    ...existing,
    title:
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : existing.title,
    summary:
      typeof body.summary === "string" ? body.summary : existing.summary,
    body: typeof body.body === "string" ? body.body : existing.body,
    published:
      typeof body.published === "boolean" ? body.published : existing.published,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "staticPage.edit",
    targetType: "staticPage",
    targetId: slug,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  const { slug } = await params;
  deleteStaticPage(slug);
  logAudit({
    actorId: guard.session.userId,
    action: "staticPage.delete",
    targetType: "staticPage",
    targetId: slug,
  });
  return NextResponse.json({ success: true });
}
