import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { deleteMedia } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  deleteMedia(id);
  return NextResponse.json({ success: true });
}
