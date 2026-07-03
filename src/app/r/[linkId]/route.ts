import { NextResponse } from "next/server";
import {
  getReferralLink,
  getSalesAgent,
  incrementLinkClicks,
} from "@/lib/db";
import { REFERRAL_COOKIE, referralCookieOptions } from "@/lib/referral";

/**
 * Short tracking link that an agent shares with prospects.
 *
 * Flow:
 *   1. Visitor opens `/r/<linkId>` (e.g. `/r/link_a8x9k2`).
 *   2. We look up the link → its agent → bump click counter.
 *   3. Drop the standard `namdar_ref` cookie with the agent's referral code
 *      so the existing checkout attribution code keeps working unchanged.
 *      Also store the specific linkId in a sibling cookie so registration
 *      and order capture can credit the right link, not just the agent.
 *   4. Redirect to the link's landingPath (defaults to "/").
 *
 * Inactive links and missing IDs both 404 to keep things simple — we don't
 * want stale links from removed agents to silently work.
 */

const LINK_COOKIE = "namdar_ref_link";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ linkId: string }> },
) {
  const { linkId } = await params;
  const link = getReferralLink(linkId);
  if (!link || !link.isActive) {
    // Don't pretend a dead/disabled link routes somewhere — surface a 404
    // so the agent notices their old links stopped working.
    return NextResponse.redirect(new URL("/", req.url));
  }
  const agent = getSalesAgent(link.agentId);
  if (!agent || !agent.isActive) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  incrementLinkClicks(linkId);

  // Build destination URL. If the link defines UTM params, append them so
  // downstream analytics tools (or our own admin pages) can see the source.
  const dest = new URL(link.landingPath || "/", req.url);
  if (link.utmSource) dest.searchParams.set("utm_source", link.utmSource);
  if (link.utmMedium) dest.searchParams.set("utm_medium", link.utmMedium);
  if (link.utmCampaign) dest.searchParams.set("utm_campaign", link.utmCampaign);

  const res = NextResponse.redirect(dest);
  // Agent's primary code — keeps `/api/checkout` flow unchanged.
  res.cookies.set(REFERRAL_COOKIE, agent.referralCode, referralCookieOptions());
  // Specific link id — for per-link conversion stats.
  res.cookies.set(LINK_COOKIE, linkId, referralCookieOptions());
  return res;
}
