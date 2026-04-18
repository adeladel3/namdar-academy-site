import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getDiscount, logAudit, upsertDiscount } from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: {
    code?: string;
    kind?: string;
    value?: number;
    maxUses?: number;
    expiresAt?: number;
    courseSlug?: string;
    active?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const code = body.code?.trim().toUpperCase();
  if (!code || !/^[A-Z0-9-]+$/.test(code)) {
    return NextResponse.json(
      { error: "کد باید فقط حروف انگلیسی، عدد و خط تیره باشد" },
      { status: 400 }
    );
  }
  if (getDiscount(code)) {
    return NextResponse.json(
      { error: "کدی با این عنوان موجود است" },
      { status: 409 }
    );
  }
  if (body.kind !== "percent" && body.kind !== "fixed") {
    return NextResponse.json({ error: "نوع نامعتبر" }, { status: 400 });
  }
  if (typeof body.value !== "number" || body.value <= 0) {
    return NextResponse.json({ error: "مقدار نامعتبر" }, { status: 400 });
  }
  if (body.kind === "percent" && body.value > 100) {
    return NextResponse.json(
      { error: "درصد نمی‌تواند بیش از ۱۰۰ باشد" },
      { status: 400 }
    );
  }

  upsertDiscount({
    code,
    kind: body.kind,
    value: body.value,
    maxUses: body.maxUses,
    expiresAt: body.expiresAt,
    courseSlug: body.courseSlug,
    active: body.active ?? true,
    uses: 0,
    createdAt: Date.now(),
  });

  logAudit({
    actorId: guard.session.userId,
    action: "discount.create",
    targetType: "discount",
    targetId: code,
  });

  return NextResponse.json({ success: true });
}
