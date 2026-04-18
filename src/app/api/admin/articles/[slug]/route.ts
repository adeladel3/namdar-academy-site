import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteArticle,
  getArticle,
  logAudit,
  upsertArticle,
  type ArticleRecord,
} from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { slug } = await params;
  const existing = getArticle(slug);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<ArticleRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const nowPublishing = body.published === true && !existing.published;

  upsertArticle({
    ...existing,
    title:
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : existing.title,
    excerpt:
      typeof body.excerpt === "string" ? body.excerpt : existing.excerpt,
    content:
      typeof body.content === "string" ? body.content : existing.content,
    category:
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : existing.category,
    coverImage:
      typeof body.coverImage === "string" && body.coverImage
        ? body.coverImage
        : existing.coverImage,
    readMinutes:
      typeof body.readMinutes === "number"
        ? body.readMinutes
        : existing.readMinutes,
    published:
      typeof body.published === "boolean" ? body.published : existing.published,
    publishedAt: nowPublishing ? Date.now() : existing.publishedAt,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "article.edit",
    targetType: "article",
    targetId: slug,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { slug } = await params;
  deleteArticle(slug);
  logAudit({
    actorId: guard.session.userId,
    action: "article.delete",
    targetType: "article",
    targetId: slug,
  });
  return NextResponse.json({ success: true });
}
