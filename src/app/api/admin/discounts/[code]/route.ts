import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteDiscount,
  getDiscount,
  logAudit,
  upsertDiscount,
} from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).toUpperCase();
  const existing = getDiscount(code);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<{
    kind: "percent" | "fixed";
    value: number;
    maxUses: number;
    expiresAt: number;
    courseSlug: string;
    active: boolean;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  upsertDiscount({
    ...existing,
    kind: body.kind ?? existing.kind,
    value: typeof body.value === "number" ? body.value : existing.value,
    maxUses: body.maxUses ?? existing.maxUses,
    expiresAt: body.expiresAt ?? existing.expiresAt,
    courseSlug:
      body.courseSlug === undefined
        ? existing.courseSlug
        : body.courseSlug || undefined,
    active: typeof body.active === "boolean" ? body.active : existing.active,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "discount.edit",
    targetType: "discount",
    targetId: code,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).toUpperCase();
  deleteDiscount(code);
  logAudit({
    actorId: guard.session.userId,
    action: "discount.delete",
    targetType: "discount",
    targetId: code,
  });
  return NextResponse.json({ success: true });
}
