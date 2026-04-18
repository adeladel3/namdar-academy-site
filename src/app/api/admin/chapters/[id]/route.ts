import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { deleteChapter, getChapter, upsertChapter } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const ch = getChapter(id);
  if (!ch) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: { title?: string; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  upsertChapter({
    ...ch,
    title: typeof body.title === "string" ? body.title.trim() : ch.title,
    order: typeof body.order === "number" ? body.order : ch.order,
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
  if (!getChapter(id))
    return NextResponse.json({ error: "not found" }, { status: 404 });
  deleteChapter(id);
  return NextResponse.json({ success: true });
}
