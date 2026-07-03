import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  createReferralLink,
  getSalesAgent,
  listReferralLinks,
  logAudit,
} from "@/lib/db";

/**
 * Admin-side management of an agent's tracking links. Mirrors the
 * agent-facing `/api/agent/links` endpoints, but authorizes through
 * `requireAdmin` and targets the agent identified in the URL rather than
 * the logged-in session. Lets the admin generate per-agent links whose
 * destination (landingPath) points at a specific product/course page.
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  if (!getSalesAgent(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ links: listReferralLinks({ agentId: id }) });
}

export async function POST(
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
    label?: string;
    landingPath?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.label?.trim()) {
    return NextResponse.json({ error: "عنوان لینک لازم است" }, { status: 400 });
  }
  try {
    const link = createReferralLink({
      agentId: id,
      label: body.label,
      landingPath: body.landingPath,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
    });
    logAudit({
      actorId: guard.session.userId,
      action: "agent.edit",
      targetType: "agent",
      targetId: id,
      metadata: { createdLink: link.id, label: link.label, landingPath: link.landingPath },
    });
    return NextResponse.json({ success: true, link });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 400 },
    );
  }
}
