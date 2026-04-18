import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { disableUser, getUser, logAudit } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const user = getUser(id);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (id === guard.session.userId)
    return NextResponse.json(
      { error: "نمی‌توانید حساب خود را غیرفعال کنید" },
      { status: 400 }
    );

  let reason: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.reason === "string") reason = body.reason;
  } catch {
    // allow empty body
  }
  disableUser(id, reason);
  logAudit({
    actorId: guard.session.userId,
    action: "user.disable",
    targetType: "user",
    targetId: id,
    metadata: { reason },
  });
  return NextResponse.json({ success: true });
}
