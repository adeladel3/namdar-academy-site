import { NextResponse } from "next/server";
import { requirePerm } from "@/lib/admin-guard";
import { getUser, logAudit, setUserPermission } from "@/lib/db";
import { ALL_ACTIONS } from "@/lib/rbac";
import { getAllSectionActions } from "@/lib/admin-sections";

type OverrideState = "grant" | "deny" | "inherit";

const VALID_STATES: OverrideState[] = ["grant", "deny", "inherit"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePerm("user.managePermissions");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const target = getUser(id);
  if (!target)
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

  // Safety: never let an admin strip their own permission-management flag.
  if (id === guard.session.userId) {
    return NextResponse.json(
      { error: "نمی‌توانید دسترسی خود را از این صفحه تغییر دهید" },
      { status: 400 }
    );
  }

  let body: { action?: string; state?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  const action = body.action;
  const state = body.state as OverrideState | undefined;

  // Union of hand-curated actions AND auto-discovered `section.*.access`
  // keys produced by the admin-sections registry. Without this, granting a
  // checkbox for an auto-discovered folder would always be rejected as an
  // invalid action.
  const validActions = new Set<string>([
    ...ALL_ACTIONS,
    ...getAllSectionActions(),
  ]);
  if (!action || !validActions.has(action)) {
    return NextResponse.json(
      { error: "کلید دسترسی نامعتبر" },
      { status: 400 }
    );
  }
  if (!state || !VALID_STATES.includes(state)) {
    return NextResponse.json(
      { error: "وضعیت نامعتبر (grant / deny / inherit)" },
      { status: 400 }
    );
  }

  const updated = setUserPermission(id, action, state);
  logAudit({
    actorId: guard.session.userId,
    action: "user.managePermissions",
    targetType: "user",
    targetId: id,
    metadata: { action, state },
  });

  return NextResponse.json({
    success: true,
    grants: updated?.permissionGrants ?? [],
    denies: updated?.permissionDenies ?? [],
  });
}
