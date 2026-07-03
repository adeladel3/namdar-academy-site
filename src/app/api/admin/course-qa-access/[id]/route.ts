import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { revokeCourseQAAccess } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  // id = `${userId}__${courseSlug}`
  const sep = id.indexOf("__");
  if (sep === -1)
    return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const userId = id.slice(0, sep);
  const courseSlug = id.slice(sep + 2);
  revokeCourseQAAccess(userId, courseSlug);
  return NextResponse.json({ success: true });
}
