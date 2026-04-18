import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { listNewsletterSubs } from "@/lib/db";

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const subs = listNewsletterSubs();
  const lines = ["email,subscribed_at"];
  for (const s of subs) {
    lines.push(`${s.email},${new Date(s.subscribedAt).toISOString()}`);
  }
  const body = "\uFEFF" + lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${Date.now()}.csv"`,
    },
  });
}
