import { NextResponse } from "next/server";
import { requirePerm } from "@/lib/admin-guard";
import {
  getSeminar,
  listSeminars,
  logAudit,
  upsertSeminar,
} from "@/lib/db";
import { isValidSlug } from "@/lib/slug";

export async function GET() {
  const guard = await requirePerm("seminar.view");
  if (!guard.ok) return guard.response;
  return NextResponse.json({ seminars: listSeminars() });
}

export async function POST(req: Request) {
  const guard = await requirePerm("seminar.create", req);
  if (!guard.ok) return guard.response;

  let body: {
    slug?: string;
    title?: string;
    shortDesc?: string;
    price?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const title = body.title?.trim();
  const shortDesc = body.shortDesc?.trim();
  const price = Number(body.price);

  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json(
      { error: "آدرس فقط می‌تواند شامل حروف فارسی/انگلیسی، عدد و خط تیره باشد" },
      { status: 400 }
    );
  }
  if (!title) {
    return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
  }
  if (!shortDesc) {
    return NextResponse.json({ error: "توضیح کوتاه الزامی است" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "قیمت معتبر وارد کنید" }, { status: 400 });
  }
  if (getSeminar(slug)) {
    return NextResponse.json(
      { error: "سمیناری با این آدرس قبلاً موجود است" },
      { status: 409 }
    );
  }

  const now = Date.now();
  const seminar = upsertSeminar({
    slug,
    title,
    shortDesc,
    price,
    allowPurchase: true,
    status: "draft",
    showCapacityCounter: true,
    landingBlocks: [],
    memberBlocks: [],
    createdAt: now,
    updatedAt: now,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "seminar.create",
    targetType: "seminar",
    targetId: slug,
    metadata: { title, price },
  });

  return NextResponse.json({ seminar });
}
