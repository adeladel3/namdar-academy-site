import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  generateId,
  getCourse,
  getCourseRating,
  getUser,
  isEnrolled,
  listReviews,
  upsertReview,
} from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getCourse(slug))
    return NextResponse.json({ error: "not found" }, { status: 404 });

  const session = await getSession();
  const approved = listReviews({ courseSlug: slug, approvedOnly: true });
  const mine = session
    ? listReviews({ courseSlug: slug, userId: session.userId })
    : [];

  // Merge: show all approved + own pending (mine takes precedence to avoid dup)
  const seenIds = new Set<string>();
  const merged: typeof approved = [];
  for (const r of mine) {
    seenIds.add(r.id);
    merged.push(r);
  }
  for (const r of approved) {
    if (!seenIds.has(r.id)) merged.push(r);
  }
  merged.sort((a, b) => b.createdAt - a.createdAt);

  const rating = getCourseRating(slug);
  return NextResponse.json({
    avg: rating.avg,
    count: rating.count,
    reviews: merged.map((r) => {
      const u = getUser(r.userId);
      return {
        id: r.id,
        name: u?.name ?? "کاربر",
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        mine: session?.userId === r.userId,
      };
    }),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { slug } = await params;
  if (!getCourse(slug))
    return NextResponse.json({ error: "دوره پیدا نشد" }, { status: 404 });
  if (!isEnrolled(session.userId, slug) && session.role !== "admin") {
    return NextResponse.json(
      { error: "فقط دانش‌پذیران این دوره می‌توانند نظر بدهند" },
      { status: 403 }
    );
  }

  let body: { rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: "امتیاز نامعتبر" }, { status: 400 });
  const comment = body.comment?.trim() ?? "";
  if (comment.length < 5)
    return NextResponse.json({ error: "متن نظر خیلی کوتاه است" }, { status: 400 });

  // Auto-approve own review; admin can toggle moderation in settings later.
  const existing = listReviews({ courseSlug: slug, userId: session.userId })[0];
  const id = existing?.id ?? generateId("rev");
  upsertReview({
    id,
    userId: session.userId,
    courseSlug: slug,
    rating: Math.round(rating),
    comment,
    approved: true,
    createdAt: existing?.createdAt ?? Date.now(),
  });

  return NextResponse.json({ success: true, pending: false });
}
