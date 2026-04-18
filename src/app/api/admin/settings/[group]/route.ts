import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { getSettingsGroup, logAudit, setSetting } from "@/lib/db";

const ALLOWED_GROUPS = new Set([
  "site",
  "branding",
  "payment",
  "sms",
  "email",
  "chat",
  "landing",
]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { group } = await params;
  if (!ALLOWED_GROUPS.has(group))
    return NextResponse.json({ error: "invalid group" }, { status: 400 });
  return NextResponse.json({ values: getSettingsGroup(`${group}.`) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { group } = await params;
  if (!ALLOWED_GROUPS.has(group))
    return NextResponse.json({ error: "invalid group" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  for (const [k, v] of Object.entries(body)) {
    setSetting(`${group}.${k}`, v, guard.session.userId);
  }

  logAudit({
    actorId: guard.session.userId,
    action: `settings.${group}.update`,
    targetType: "settings",
    targetId: group,
    metadata: { keys: Object.keys(body) },
  });

  return NextResponse.json({ success: true });
}
