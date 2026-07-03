import { NextResponse } from "next/server";
import { addCallbackRequest } from "@/lib/db";
import { allow, clientIp } from "@/lib/rate-limit";

function normalizeIranPhone(input: string): string | null {
  const digits = input
    .replace(/[\u06F0-\u06F9]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48)
    )
    .replace(/[\u0660-\u0669]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48)
    )
    .replace(/\D/g, "");

  if (digits.startsWith("0098")) return "0" + digits.slice(4);
  if (digits.startsWith("98") && digits.length === 12) return "0" + digits.slice(2);
  if (digits.startsWith("9") && digits.length === 10) return "0" + digits;
  if (digits.startsWith("09") && digits.length === 11) return digits;
  if (digits.startsWith("0") && digits.length >= 10 && digits.length <= 11)
    return digits;
  return null;
}

export async function POST(req: Request) {
  try {
    if (!allow(`contact:${clientIp(req)}`, { windowMs: 60_000, max: 5 })) {
      return NextResponse.json(
        { error: "درخواست‌های شما زیاد است. کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    const body = (await req.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const rawPhone = typeof body.phone === "string" ? body.phone : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const relatedCourseSlug =
      typeof body.relatedCourseSlug === "string" && body.relatedCourseSlug
        ? body.relatedCourseSlug.trim()
        : undefined;
    const source =
      typeof body.source === "string" && body.source
        ? body.source.trim()
        : "contact-form";

    if (!name || !rawPhone || !message) {
      return NextResponse.json(
        { error: "فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

    const phone = normalizeIranPhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: "شماره تماس معتبر نیست" },
        { status: 400 }
      );
    }

    const rec = addCallbackRequest({
      phone,
      name,
      email: email || undefined,
      topic: subject || undefined,
      note: message,
      relatedCourseSlug,
      source,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[CONTACT→CB] ${phone} · ${subject} · ${source}`);
    }

    return NextResponse.json({ success: true, id: rec.id });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
