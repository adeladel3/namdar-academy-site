import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getArticle, logAudit, upsertArticle } from "@/lib/db";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { isValidSlug } from "@/lib/slug";

export async function POST(req: Request) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;

  let body: {
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    coverImage?: string;
    readMinutes?: number;
    published?: boolean;
    seoTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    tags?: string[];
    authorName?: string;
    ogImage?: string;
    noindex?: boolean;
    canonicalUrl?: string;
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
  if (getArticle(slug)) {
    return NextResponse.json({ error: "مقاله‌ای با این آدرس از قبل وجود دارد" }, {
      status: 409,
    });
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
  }

  const now = Date.now();
  upsertArticle({
    slug,
    title: body.title.trim(),
    excerpt: body.excerpt?.trim() ?? "",
    content: sanitizeRichHtml(body.content ?? ""),
    category: body.category?.trim() || "آموزش",
    coverImage: body.coverImage || "/figma/detail.png",
    readMinutes:
      typeof body.readMinutes === "number" ? body.readMinutes : 5,
    published: body.published === true,
    authorId: guard.session.userId,
    seoTitle: body.seoTitle?.trim() || undefined,
    metaDescription: body.metaDescription?.trim() || undefined,
    focusKeyword: body.focusKeyword?.trim() || undefined,
    tags:
      Array.isArray(body.tags) && body.tags.length > 0
        ? body.tags.map((t) => String(t).trim()).filter(Boolean)
        : undefined,
    authorName: body.authorName?.trim() || undefined,
    ogImage: body.ogImage?.trim() || undefined,
    noindex: body.noindex === true ? true : undefined,
    canonicalUrl: body.canonicalUrl?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    publishedAt: body.published === true ? now : undefined,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "article.create",
    targetType: "article",
    targetId: slug,
  });

  return NextResponse.json({ success: true, slug });
}
