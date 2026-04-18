import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  getUser,
  logAudit,
  updateUser,
  type UserRole,
} from "@/lib/db";

const VALID_ROLES: UserRole[] = ["admin", "support", "student"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const user = getUser(id);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: { role?: string; name?: string; email?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const patch: Partial<typeof user> = {};
  if (body.role && VALID_ROLES.includes(body.role as UserRole)) {
    if (guard.session.role !== "admin") {
      return NextResponse.json(
        { error: "فقط مدیر می‌تواند نقش را تغییر دهد" },
        { status: 403 }
      );
    }
    if (
      body.role !== "admin" &&
      user.role === "admin" &&
      user.id === guard.session.userId
    ) {
      return NextResponse.json(
        { error: "نمی‌توانید نقش خود را پایین بیاورید" },
        { status: 400 }
      );
    }
    patch.role = body.role as UserRole;
  }
  if (typeof body.name === "string" && body.name.trim()) {
    patch.name = body.name.trim();
  }
  if (body.email !== undefined) {
    patch.email =
      body.email && body.email.trim() ? body.email.trim() : undefined;
  }

  const updated = updateUser(id, patch);
  logAudit({
    actorId: guard.session.userId,
    action: "user.edit",
    targetType: "user",
    targetId: id,
    metadata: patch,
  });
  return NextResponse.json({ success: true, user: updated });
}
