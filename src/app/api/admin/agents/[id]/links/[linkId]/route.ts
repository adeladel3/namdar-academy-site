import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  deleteReferralLink,
  getReferralLink,
  logAudit,
  updateReferralLink,
} from "@/lib/db";

/**
 * Edit / toggle / delete a single tracking link from the admin panel.
 * We always confirm the link actually belongs to the agent named in the
 * URL so an admin acting on agent A can't accidentally mutate agent B's
 * link by id.
 */
function loadLink(agentId: string, linkId: string) {
  const link = getReferralLink(linkId);
  if (!link || link.agentId !== agentId) return undefined;
  return link;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  const { id, linkId } = await params;
  if (!loadLink(id, linkId)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  let body: {
    label?: string;
    landingPath?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    isActive?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const updated = updateReferralLink(linkId, body);
  logAudit({
    actorId: guard.session.userId,
    action: "agent.edit",
    targetType: "agent",
    targetId: id,
    metadata: { editedLink: linkId, patch: body },
  });
  return NextResponse.json({ success: true, link: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;
  const { id, linkId } = await params;
  if (!loadLink(id, linkId)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  deleteReferralLink(linkId);
  logAudit({
    actorId: guard.session.userId,
    action: "agent.edit",
    targetType: "agent",
    targetId: id,
    metadata: { deletedLink: linkId },
  });
  return NextResponse.json({ success: true });
}
