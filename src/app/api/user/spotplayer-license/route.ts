import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEnrollment } from "@/lib/db";
import { ensureLicenseForEnrollment } from "@/lib/spotplayer";

// تلاش مجدد برای ساخت لایسنس اسپات‌پلیر دوره‌ای که کاربر در آن ثبت‌نام کرده.
// idempotent است: اگر لایسنس از قبل ساخته شده باشد، همان را برمی‌گرداند.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "نیاز به ورود" }, { status: 401 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  const slug = (body.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "شناسه دوره الزامی است" }, { status: 400 });
  }

  const enrollment = getEnrollment(session.userId, slug);
  if (!enrollment) {
    return NextResponse.json(
      { error: "شما در این دوره ثبت‌نام نکرده‌اید" },
      { status: 403 }
    );
  }

  const result = await ensureLicenseForEnrollment(enrollment.id);
  if (result.status === "ready") {
    return NextResponse.json({ ok: true, license: result.license });
  }
  if (result.status === "not-spotplayer") {
    return NextResponse.json(
      { error: "این دوره از اسپات‌پلیر استفاده نمی‌کند" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
}
