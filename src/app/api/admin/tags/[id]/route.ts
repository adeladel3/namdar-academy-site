import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { deleteTag } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  deleteTag(id);
  return NextResponse.json({ success: true });
}
