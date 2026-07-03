import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  createSalesAgent,
  getAgentStats,
  listSalesAgents,
  logAudit,
} from "@/lib/db";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const agents = listSalesAgents().map((a) => ({
    ...a,
    stats: getAgentStats(a.id),
  }));
  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

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

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "نام کارشناس لازم است" }, { status: 400 });
  }
  if (!body.referralCode?.trim()) {
    return NextResponse.json({ error: "کد رفرال لازم است" }, { status: 400 });
  }

  try {
    const agent = createSalesAgent({
      name: body.name,
      referralCode: body.referralCode,
      phone: body.phone,
      email: body.email,
      userId: body.userId,
      isActive: body.isActive,
      notes: body.notes,
    });
    logAudit({
      actorId: guard.session.userId,
      action: "agent.create",
      targetType: "agent",
      targetId: agent.id,
      metadata: { name: agent.name, referralCode: agent.referralCode },
    });
    return NextResponse.json({ success: true, agent });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 400 },
    );
  }
}
