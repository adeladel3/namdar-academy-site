import { NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var __namdar_newsletter: Set<string> | undefined;
}

const subs =
  globalThis.__namdar_newsletter ?? (globalThis.__namdar_newsletter = new Set());

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

    subs.add(email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
