import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteTestimonial,
  getTestimonial,
  upsertTestimonial,
} from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const t = getTestimonial(id);
  if (!t) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<{
    name: string;
    role: string;
    avatar: string;
    quote: string;
    order: number;
    published: boolean;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  upsertTestimonial({
    ...t,
    name: body.name?.trim() || t.name,
    role: body.role === undefined ? t.role : body.role?.trim() || undefined,
    avatar:
      body.avatar === undefined ? t.avatar : body.avatar?.trim() || undefined,
    quote: body.quote?.trim() || t.quote,
    order: typeof body.order === "number" ? body.order : t.order,
    published:
      typeof body.published === "boolean" ? body.published : t.published,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  deleteTestimonial(id);
  return NextResponse.json({ success: true });
}
