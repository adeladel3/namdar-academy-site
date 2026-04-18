import { NextResponse } from "next/server";
import { addNewsletterSub } from "@/lib/db";

export async function POST(req: Request) {
  try {
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
