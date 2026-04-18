import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { generateId, upsertTestimonial } from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let body: {
    name?: string;
    role?: string;
    avatar?: string;
    quote?: string;
    order?: number;
    published?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.quote?.trim())
    return NextResponse.json({ error: "نام و متن الزامی" }, { status: 400 });

  const id = generateId("t");
  upsertTestimonial({
    id,
    name: body.name.trim(),
    role: body.role?.trim() || undefined,
    avatar: body.avatar?.trim() || undefined,
    quote: body.quote.trim(),
    order: body.order ?? 0,
    published: body.published !== false,
    createdAt: Date.now(),
  });
  return NextResponse.json({ success: true, id });
}
