import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getSalesAgent,
  logAudit,
  updateSalesAgent,
  type CommissionTier,
} from "@/lib/db";

type Body = {
  tiers?: Array<{ atLeastToman?: number; percent?: number }>;
  period?: "month" | "all_time";
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  if (!getSalesAgent(id)) {
    return NextResponse.json({ error: "کارشناس یافت نشد" }, { status: 404 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  // Normalize the tier array up front so the DB layer never sees malformed
  // rows. We accept anything roughly shaped right and clamp values; the
  // sort + dedupe + drop-empty happens inside updateSalesAgent.
  let tiers: CommissionTier[] | undefined;
  if (body.tiers !== undefined) {
    if (!Array.isArray(body.tiers)) {
      return NextResponse.json(
        { error: "فهرست پله‌ها نامعتبر" },
        { status: 400 }
      );
    }
    tiers = body.tiers.map((t) => ({
      atLeastToman: Math.max(0, Math.floor(Number(t?.atLeastToman) || 0)),
      percent: Math.max(0, Math.min(100, Number(t?.percent) || 0)),
    }));
  }

  const period =
    body.period === "month" || body.period === "all_time"
      ? body.period
      : undefined;

  const updated = updateSalesAgent(id, {
    ...(tiers !== undefined ? { commissionTiers: tiers } : {}),
    ...(period !== undefined ? { commissionPeriod: period } : {}),
  });

  logAudit({
    actorId: guard.session.userId,
    action: "agent.commission.edit",
    targetType: "agent",
    targetId: id,
    metadata: {
      tiers: updated?.commissionTiers ?? [],
      period: updated?.commissionPeriod ?? "month",
    },
  });

  return NextResponse.json({
    success: true,
    tiers: updated?.commissionTiers ?? [],
    period: updated?.commissionPeriod ?? "month",
  });
}
