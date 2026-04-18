import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { deleteFaq, getFaq, upsertFaq } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const existing = getFaq(id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<{ question: string; answer: string; order: number; published: boolean }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  upsertFaq({
    ...existing,
    question: body.question?.trim() || existing.question,
    answer: body.answer ?? existing.answer,
    order: typeof body.order === "number" ? body.order : existing.order,
    published:
      typeof body.published === "boolean" ? body.published : existing.published,
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
  deleteFaq(id);
  return NextResponse.json({ success: true });
}
