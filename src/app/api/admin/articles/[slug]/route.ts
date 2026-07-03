import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteArticle,
  getArticle,
  logAudit,
  upsertArticle,
  type ArticleRecord,
} from "@/lib/db";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff(req);
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

  // Empty-string overrides for optional SEO fields clear them back to the
  // default fallback; `undefined` (field not sent) leaves the existing value.
  const pickOptionalString = (
    next: unknown,
    prev: string | undefined
  ): string | undefined => {
    if (typeof next !== "string") return prev;
    const t = next.trim();
    return t || undefined;
  };

  upsertArticle({
    ...existing,
    title:
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : existing.title,
    excerpt:
      typeof body.excerpt === "string" ? body.excerpt : existing.excerpt,
    content:
      typeof body.content === "string"
        ? sanitizeRichHtml(body.content)
        : existing.content,
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
    seoTitle: pickOptionalString(body.seoTitle, existing.seoTitle),
    metaDescription: pickOptionalString(
      body.metaDescription,
      existing.metaDescription
    ),
    focusKeyword: pickOptionalString(body.focusKeyword, existing.focusKeyword),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean).length > 0
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : undefined
      : existing.tags,
    authorName: pickOptionalString(body.authorName, existing.authorName),
    ogImage: pickOptionalString(body.ogImage, existing.ogImage),
    noindex:
      typeof body.noindex === "boolean" ? body.noindex : existing.noindex,
    canonicalUrl: pickOptionalString(body.canonicalUrl, existing.canonicalUrl),
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
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff(req);
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
