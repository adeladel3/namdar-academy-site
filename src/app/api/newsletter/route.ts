import { NextResponse } from "next/server";
import { addNewsletterSub } from "@/lib/db";
import { allow, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!allow(`newsletter:${clientIp(req)}`, { windowMs: 60_000, max: 5 })) {
      return NextResponse.json(
        { error: "درخواست‌های شما زیاد است. کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let email: string | null = null;
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email;
    } else {
      const form = await req.formData();
      email = form.get("email")?.toString() ?? null;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "ایمیل معتبر نیست" }, { status: 400 });
    }

    addNewsletterSub(email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
