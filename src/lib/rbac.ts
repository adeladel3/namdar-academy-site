import type { Session } from "@/lib/auth";
import type { UserRole } from "@/lib/db";

export type AdminAction =
  | "dashboard.view"
  | "course.view"
  | "course.create"
  | "course.edit"
  | "course.publish"
  | "course.delete"
  | "user.view"
  | "user.edit"
  | "user.disable"
  | "user.delete"
  | "order.view"
  | "order.refund"
  | "settings.view"
  | "settings.edit"
  | "audit.view";

const ROLE_PERMS: Record<UserRole, AdminAction[]> = {
  admin: [
    "dashboard.view",
    "course.view",
    "course.create",
    "course.edit",
    "course.publish",
    "course.delete",
    "user.view",
    "user.edit",
    "user.disable",
    "user.delete",
    "order.view",
    "order.refund",
    "settings.view",
    "settings.edit",
    "audit.view",
  ],
  support: [
    "dashboard.view",
    "course.view",
    "user.view",
    "order.view",
  ],
  student: [],
};

export function can(session: Session | null | undefined, action: AdminAction) {
  if (!session) return false;
  return ROLE_PERMS[session.role as UserRole]?.includes(action) ?? false;
}

export function requirePerm(session: Session | null, action: AdminAction) {
  if (!can(session, action)) throw new Error("forbidden");
}
