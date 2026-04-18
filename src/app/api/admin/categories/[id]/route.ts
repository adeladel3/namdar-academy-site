import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteCategory,
  getCategory,
  logAudit,
  upsertCategory,
} from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const c = getCategory(id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: { name?: string; slug?: string; icon?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  upsertCategory({
    ...c,
    name: body.name?.trim() || c.name,
    slug: body.slug?.trim() || c.slug,
    icon: body.icon ?? c.icon,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  deleteCategory(id);
  logAudit({
    actorId: guard.session.userId,
    action: "category.delete",
    targetType: "category",
    targetId: id,
  });
  return NextResponse.json({ success: true });
}
