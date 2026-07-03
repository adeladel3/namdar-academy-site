import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { logAudit, updateEnrollment } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: { expiresAt?: number | null; durationDays?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const patch: { expiresAt?: number; durationDays?: number } = {};
  if (body.expiresAt !== undefined) {
    // null = remove expiry (lifetime access). number = absolute unix ms.
    patch.expiresAt = body.expiresAt === null ? 0 : Number(body.expiresAt);
  }
  if (body.durationDays !== undefined) {
    patch.durationDays =
      body.durationDays === null ? 0 : Number(body.durationDays);
  }

  // updateEnrollment treats 0/undefined sensibly; we re-interpret to clear
  // the field when admin explicitly asked for "no expiry".
  const updated = updateEnrollment(id, {
    expiresAt: patch.expiresAt === 0 ? undefined : patch.expiresAt,
    durationDays: patch.durationDays === 0 ? undefined : patch.durationDays,
  });
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  logAudit({
    actorId: guard.session.userId,
    action: "enrollment.edit",
    targetType: "enrollment",
    targetId: id,
    metadata: patch,
  });
  return NextResponse.json({ success: true, enrollment: updated });
}
