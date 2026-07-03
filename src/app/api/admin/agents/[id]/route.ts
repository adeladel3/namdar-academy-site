import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  deleteSalesAgent,
  getAgentStats,
  getSalesAgent,
  listOrdersForAgent,
  logAudit,
  updateSalesAgent,
} from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const agent = getSalesAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({
    agent,
    stats: getAgentStats(id),
    orders: listOrdersForAgent(id),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  if (!getSalesAgent(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  let body: {
    name?: string;
    referralCode?: string;
    phone?: string;
    email?: string;
    userId?: string;
    isActive?: boolean;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  try {
    const updated = updateSalesAgent(id, body);
    logAudit({
      actorId: guard.session.userId,
      action: "agent.edit",
      targetType: "agent",
      targetId: id,
      metadata: body,
    });
    return NextResponse.json({ success: true, agent: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  if (!getSalesAgent(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  // Note: orders attributed to this agent keep their agentId snapshot —
  // we do NOT cascade-delete sales history. Past commission records stay
  // accurate even after the agent is removed from the active list.
  deleteSalesAgent(id);
  logAudit({
    actorId: guard.session.userId,
    action: "agent.delete",
    targetType: "agent",
    targetId: id,
  });
  return NextResponse.json({ success: true });
}
