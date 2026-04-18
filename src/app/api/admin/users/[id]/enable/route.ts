import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { enableUser, getUser, logAudit } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  if (!getUser(id))
    return NextResponse.json({ error: "not found" }, { status: 404 });
  enableUser(id);
  logAudit({
    actorId: guard.session.userId,
    action: "user.enable",
    targetType: "user",
    targetId: id,
  });
  return NextResponse.json({ success: true });
}
