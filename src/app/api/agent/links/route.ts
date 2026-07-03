import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import {
  createReferralLink,
  getSalesAgentByPhone,
  listReferralLinks,
} from "@/lib/db";

/**
 * Endpoints for an agent to manage their own tracking links. We don't
 * reuse the admin endpoints — agents shouldn't be able to touch anyone
 * else's links and shouldn't need an admin permission to do basic work.
 *
 * The agent identity is derived from `getSalesAgentByPhone(session.phone)`,
 * mirroring how the agent dashboard layout decides who's allowed in.
 */

async function requireAgent(req?: Request) {
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
  return { ok: true as const, session, agent };
}

export async function GET() {
  const guard = await requireAgent();
  if (!guard.ok) return guard.response;
  const links = listReferralLinks({ agentId: guard.agent.id });
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const guard = await requireAgent(req);
  if (!guard.ok) return guard.response;
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
    return NextResponse.json(
      { error: "عنوان لینک لازم است" },
      { status: 400 },
    );
  }
  try {
    const link = createReferralLink({
      agentId: guard.agent.id,
      label: body.label,
      landingPath: body.landingPath,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
    });
    return NextResponse.json({ success: true, link });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 400 },
    );
  }
}
