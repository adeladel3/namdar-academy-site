import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  "coaching",
  "spotplayer",
]);

// Keys whose value is an API credential or other secret. GET returns them
// masked for non-admin staff so a support account cannot copy the Kavenegar
// key or SEP terminal password out of the settings panel.
const SECRET_KEY_SUBSTRINGS = [
  "apikey",
  "api_key",
  "apisecret",
  "api_secret",
  "secret",
  "token",
  "password",
  "terminalid",
  "terminal_id",
  "smtppassword",
  "clientsecret",
  "client_secret",
  "snappaypassword",
  "snappay_password",
];

function isSecretKey(fullKey: string): boolean {
  const lower = fullKey.toLowerCase();
  return SECRET_KEY_SUBSTRINGS.some((s) => lower.includes(s));
}

function maskForNonAdmin(
  values: Record<string, unknown>,
  isAdminUser: boolean
): Record<string, unknown> {
  if (isAdminUser) return values;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = isSecretKey(k) && v ? "••••••" : v;
  }
  return out;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  const { group } = await params;
  if (!ALLOWED_GROUPS.has(group))
    return NextResponse.json({ error: "invalid group" }, { status: 400 });
  const values = getSettingsGroup(`${group}.`);
  return NextResponse.json({
    values: maskForNonAdmin(values, guard.session.role === "admin"),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const guard = await requireStaff(req);
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
    // Ignore masked placeholder values submitted by non-admin UI.
    if (typeof v === "string" && v === "••••••") continue;
    setSetting(`${group}.${k}`, v, guard.session.userId);
  }

  logAudit({
    actorId: guard.session.userId,
    action: `settings.${group}.update`,
    targetType: "settings",
    targetId: group,
    metadata: { keys: Object.keys(body) },
  });

  // Settings flow into public pages (contact, landing, about, coaching, …)
  // and shared chrome (header/footer). Flush the full route tree so the
  // next visit gets fresh values regardless of which group changed.
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
