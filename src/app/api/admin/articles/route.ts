import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getArticle, logAudit, upsertArticle } from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
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
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const slug = body.slug?.trim();
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: "slug نامعتبر" }, { status: 400 });
  }
  if (getArticle(slug)) {
    return NextResponse.json({ error: "مقاله‌ای با این slug موجود است" }, {
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
    content: body.content ?? "",
    category: body.category?.trim() || "آموزش",
    coverImage: body.coverImage || "/figma/detail.png",
    readMinutes:
      typeof body.readMinutes === "number" ? body.readMinutes : 5,
    published: body.published === true,
    authorId: guard.session.userId,
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
