import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import {
  deleteReferralLink,
  getReferralLink,
  getSalesAgentByPhone,
  updateReferralLink,
} from "@/lib/db";

async function loadAgentAndLink(id: string, req?: Request) {
  if (req) {
    const csrf = requireSameOrigin(req);
    if (!csrf.ok) return { ok: false as const, response: csrf.response };
  }
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  const agent = getSalesAgentByPhone(session.phone);
  if (!agent || !agent.isActive) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  const link = getReferralLink(id);
  if (!link) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "not found" }, { status: 404 }),
    };
  }
  // Critical: an agent can only manage their own links. Without this check,
  // anyone who knows another link's ID could rename/delete it.
  if (link.agentId !== agent.id) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const, agent, link };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await loadAgentAndLink(id, req);
  if (!guard.ok) return guard.response;
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
  const updated = updateReferralLink(id, body);
  return NextResponse.json({ success: true, link: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await loadAgentAndLink(id, req);
  if (!guard.ok) return guard.response;
  deleteReferralLink(id);
  return NextResponse.json({ success: true });
}
