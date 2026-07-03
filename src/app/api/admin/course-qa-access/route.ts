import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  getCourse,
  getUser,
  grantCourseQAAccess,
  hasCourseQAAccess,
} from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let body: {
    userId?: string;
    courseSlug?: string;
    note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const userId = body.userId?.trim();
  const courseSlug = body.courseSlug?.trim();
  if (!userId || !courseSlug)
    return NextResponse.json(
      { error: "کاربر و دوره الزامی هستند" },
      { status: 400 }
    );

  if (!getUser(userId))
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  if (!getCourse(courseSlug))
    return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

  if (hasCourseQAAccess(userId, courseSlug)) {
    return NextResponse.json(
      { error: "این کاربر قبلاً به پنل پرسش‌وپاسخ این دوره دسترسی دارد." },
      { status: 409 }
    );
  }

  const record = grantCourseQAAccess(
    userId,
    courseSlug,
    guard.session.userId,
    body.note
  );
  return NextResponse.json({ success: true, record });
}
