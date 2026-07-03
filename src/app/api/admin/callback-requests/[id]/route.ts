import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteCallbackRequest,
  getCallbackRequest,
  updateCallbackRequestStatus,
  type CallbackRequestStatus,
} from "@/lib/db";

const VALID: CallbackRequestStatus[] = ["new", "contacted", "archived"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  if (!getCallbackRequest(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const status = body.status as CallbackRequestStatus;
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const rec = updateCallbackRequestStatus(id, status, guard.session.userId);
  return NextResponse.json({ success: true, record: rec });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  deleteCallbackRequest(id);
  return NextResponse.json({ success: true });
}
