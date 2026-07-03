import type { Session } from "@/lib/auth";
import { getUser, type UserRole } from "@/lib/db";
import { getAllSectionActions } from "@/lib/admin-sections";

/**
 * The set of known, hand-curated admin actions. The `section.<key>.access`
 * template literal at the end is the catch-all for sections that were
 * auto-discovered from the filesystem in `admin-sections.ts` — those don't
 * have hand-written labels but still need a permission key so the matrix
 * can render a row for them. When a new admin folder is added in the
 * future, it gets a `section.<folder>.access` action automatically.
 */
export type AdminAction =
  | "dashboard.view"
  | "analytics.view"
  | "analytics.revenue.view"
  | "analytics.funnel.view"
  | "analytics.retention.view"
  | "analytics.courses.view"
  | "analytics.marketing.view"
  | "audit.view"
  | "course.view"
  | "course.create"
  | "course.edit"
  | "course.publish"
  | "course.delete"
  | "course.duplicate"
  | "curriculum.edit"
  | "article.view"
  | "article.create"
  | "article.edit"
  | "article.publish"
  | "article.delete"
  | "staticPage.view"
  | "staticPage.manage"
  | "user.view"
  | "user.edit"
  | "user.disable"
  | "user.delete"
  | "user.grantCourse"
  | "user.managePermissions"
  | "order.view"
  | "order.edit"
  | "order.refund"
  | "order.cancel"
  | "order.markPaid"
  | "order.export"
  | "discount.view"
  | "discount.create"
  | "discount.edit"
  | "discount.delete"
  | "ticket.view"
  | "ticket.reply"
  | "ticket.assign"
  | "ticket.close"
  | "agent.view"
  | "agent.manage"
  | "courseQa.view"
  | "courseQa.manage"
  | "wallOfFame.view"
  | "wallOfFame.manage"
  | "callback.view"
  | "callback.update"
  | "callback.export"
  | "testimonial.manage"
  | "faq.manage"
  | "newsletter.view"
  | "newsletter.export"
  | "category.manage"
  | "tag.manage"
  | "media.view"
  | "media.upload"
  | "media.delete"
  | "settings.view"
  | "settings.edit"
  | "seminar.view"
  | "seminar.create"
  | "seminar.edit"
  | "seminar.publish"
  | "seminar.delete"
  | "seminar.manageContent"
  | "seminar.manageRegistrations"
  | `section.${string}.access`;

/**
 * Hand-written Persian labels for known actions. Auto-discovered actions
 * (`section.*.access`) aren't in this map — call `getActionLabel(a)` to get
 * a sensible fallback derived from the section key.
 */
const KNOWN_ACTION_LABELS: Record<Exclude<AdminAction, `section.${string}.access`>, string> = {
  "dashboard.view": "مشاهده داشبورد",
  "analytics.view": "مشاهده صفحه تحلیل",
  "analytics.revenue.view": "گزارش درآمد",
  "analytics.funnel.view": "گزارش قیف تبدیل",
  "analytics.retention.view": "گزارش نگهداشت",
  "analytics.courses.view": "گزارش عملکرد دوره‌ها",
  "analytics.marketing.view": "گزارش مارکتینگ و فروش",
  "audit.view": "مشاهده لاگ ممیزی",
  "course.view": "مشاهده دوره‌ها",
  "course.create": "ایجاد دوره",
  "course.edit": "ویرایش دوره",
  "course.publish": "انتشار / لغو انتشار دوره",
  "course.delete": "حذف دوره",
  "course.duplicate": "تکثیر دوره",
  "curriculum.edit": "ویرایش فصل‌ها و درس‌ها",
  "article.view": "مشاهده مقالات",
  "article.create": "ایجاد مقاله",
  "article.edit": "ویرایش مقاله",
  "article.publish": "انتشار مقاله",
  "article.delete": "حذف مقاله",
  "staticPage.view": "مشاهده صفحات ثابت",
  "staticPage.manage": "ایجاد، ویرایش و حذف صفحات ثابت",
  "user.view": "مشاهده کاربران",
  "user.edit": "ویرایش مشخصات کاربر",
  "user.disable": "غیرفعال / فعال‌سازی کاربر",
  "user.delete": "حذف کاربر",
  "user.grantCourse": "اعطای دوره رایگان به کاربر",
  "user.managePermissions": "تغییر نقش و دسترسی کاربران",
  "order.view": "مشاهده سفارش‌ها",
  "order.edit": "ویرایش سفارش",
  "order.refund": "بازپرداخت سفارش",
  "order.cancel": "لغو سفارش",
  "order.markPaid": "تأیید دستی پرداخت",
  "order.export": "خروجی گرفتن از سفارش‌ها",
  "discount.view": "مشاهده کدهای تخفیف",
  "discount.create": "ایجاد کد تخفیف",
  "discount.edit": "ویرایش کد تخفیف",
  "discount.delete": "حذف کد تخفیف",
  "ticket.view": "مشاهده تیکت‌های پشتیبانی",
  "ticket.reply": "پاسخ به تیکت",
  "ticket.assign": "ارجاع تیکت به کارشناس",
  "ticket.close": "بستن / حل تیکت",
  "agent.view": "مشاهده کارشناسان فروش",
  "agent.manage": "افزودن، ویرایش و حذف کارشناسان فروش",
  "courseQa.view": "مشاهده دسترسی پنل پرسش‌وپاسخ دوره‌ها",
  "courseQa.manage": "اعطا / لغو دسترسی پنل پرسش‌وپاسخ دوره‌ها",
  "wallOfFame.view": "مشاهده دیوار افتخارات",
  "wallOfFame.manage": "افزودن، ویرایش و حذف آیتم‌های دیوار افتخارات",
  "callback.view": "مشاهده درخواست‌های تماس",
  "callback.update": "به‌روزرسانی وضعیت تماس",
  "callback.export": "خروجی گرفتن از درخواست‌های تماس",
  "testimonial.manage": "مدیریت نظرات مشتریان",
  "faq.manage": "مدیریت سوالات متداول",
  "newsletter.view": "مشاهده مشترکان خبرنامه",
  "newsletter.export": "خروجی گرفتن از خبرنامه",
  "category.manage": "مدیریت دسته‌بندی‌ها",
  "tag.manage": "مدیریت برچسب‌ها",
  "media.view": "مشاهده کتابخانه رسانه",
  "media.upload": "آپلود رسانه جدید",
  "media.delete": "حذف رسانه",
  "settings.view": "مشاهده تنظیمات سایت",
  "settings.edit": "ویرایش تنظیمات سایت",
  "seminar.view": "مشاهده سمینارها",
  "seminar.create": "ایجاد سمینار",
  "seminar.edit": "ویرایش سمینار",
  "seminar.publish": "انتشار / لغو انتشار سمینار",
  "seminar.delete": "حذف سمینار",
  "seminar.manageContent": "مدیریت محتوای سمینار (لندینگ و پنل خریدار)",
  "seminar.manageRegistrations": "مدیریت ثبت‌نام‌های سمینار",
};

/**
 * @deprecated Use `getActionLabel(action)` instead — it handles
 * auto-discovered `section.*.access` actions with a sensible fallback.
 */
export const ACTION_LABELS = KNOWN_ACTION_LABELS as Record<AdminAction, string>;

export function getActionLabel(action: AdminAction): string {
  if (action in KNOWN_ACTION_LABELS) {
    return KNOWN_ACTION_LABELS[action as keyof typeof KNOWN_ACTION_LABELS];
  }
  // Auto-discovered actions look like `section.<folder>.access`. Pull the
  // folder name back out and present it as "access to <folder>".
  const m = /^section\.(.+)\.access$/.exec(action);
  if (m) return `دسترسی به بخش «${m[1]}»`;
  return action;
}

export type PermissionGroup = {
  key: string;
  label: string;
  actions: AdminAction[];
};

/**
 * Static fallback for the permission matrix.
 *
 * The PRIMARY source for the matrix is `getAdminSections()` in
 * `src/lib/admin-sections.ts`, which includes auto-discovered admin
 * folders. This static `PERMISSION_GROUPS` exists as a safety net for the
 * server-only role defaults below (`ADMIN_PERMS = ALL_ACTIONS`) and for
 * any caller that imports the groups directly without going through the
 * registry. Keep this list in sync when adding hand-curated actions to
 * `AdminAction`; auto-discovered `section.*.access` actions don't appear
 * here because they're filesystem-derived.
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "overview",
    label: "داشبورد و گزارش‌ها",
    actions: [
      "dashboard.view",
      "analytics.view",
      "analytics.revenue.view",
      "analytics.funnel.view",
      "analytics.retention.view",
      "analytics.courses.view",
      "analytics.marketing.view",
      "audit.view",
    ],
  },
  {
    key: "courses",
    label: "دوره‌ها",
    actions: [
      "course.view",
      "course.create",
      "course.edit",
      "course.publish",
      "course.delete",
      "course.duplicate",
      "curriculum.edit",
    ],
  },
  {
    key: "seminars",
    label: "سمینارها",
    actions: [
      "seminar.view",
      "seminar.create",
      "seminar.edit",
      "seminar.publish",
      "seminar.delete",
      "seminar.manageContent",
      "seminar.manageRegistrations",
    ],
  },
  {
    key: "articles",
    label: "مقالات",
    actions: [
      "article.view",
      "article.create",
      "article.edit",
      "article.publish",
      "article.delete",
    ],
  },
  {
    key: "static-pages",
    label: "صفحات ثابت",
    actions: ["staticPage.view", "staticPage.manage"],
  },
  {
    key: "users",
    label: "کاربران",
    actions: [
      "user.view",
      "user.edit",
      "user.disable",
      "user.delete",
      "user.grantCourse",
      "user.managePermissions",
    ],
  },
  {
    key: "orders",
    label: "سفارش‌ها و پرداخت",
    actions: [
      "order.view",
      "order.edit",
      "order.refund",
      "order.cancel",
      "order.markPaid",
      "order.export",
    ],
  },
  {
    key: "discounts",
    label: "کدهای تخفیف",
    actions: [
      "discount.view",
      "discount.create",
      "discount.edit",
      "discount.delete",
    ],
  },
  {
    key: "support",
    label: "پشتیبانی",
    actions: [
      "ticket.view",
      "ticket.reply",
      "ticket.assign",
      "ticket.close",
      "callback.view",
      "callback.update",
      "callback.export",
    ],
  },
  {
    key: "agents",
    label: "کارشناسان فروش",
    actions: ["agent.view", "agent.manage"],
  },
  {
    key: "course-qa",
    label: "پنل پرسش‌وپاسخ دوره‌ها",
    actions: ["courseQa.view", "courseQa.manage"],
  },
  {
    key: "marketing",
    label: "محتوای بازاریابی",
    actions: [
      "testimonial.manage",
      "faq.manage",
      "wallOfFame.view",
      "wallOfFame.manage",
      "newsletter.view",
      "newsletter.export",
    ],
  },
  {
    key: "taxonomy",
    label: "طبقه‌بندی",
    actions: ["category.manage", "tag.manage"],
  },
  {
    key: "media",
    label: "کتابخانه رسانه",
    actions: ["media.view", "media.upload", "media.delete"],
  },
  {
    key: "settings",
    label: "تنظیمات سایت",
    actions: ["settings.view", "settings.edit"],
  },
];

export const ALL_ACTIONS: AdminAction[] = PERMISSION_GROUPS.flatMap(
  (g) => g.actions
);

/**
 * Admin should be able to do everything by default — including reach any
 * auto-discovered admin section without needing the matrix to grant it
 * explicitly. We compute lazily because `getAllSectionActions()` walks the
 * filesystem on first call.
 */
function adminPerms(): AdminAction[] {
  return Array.from(new Set([...ALL_ACTIONS, ...getAllSectionActions()]));
}

const SUPPORT_PERMS: AdminAction[] = [
  "dashboard.view",
  "analytics.view",
  "course.view",
  "article.view",
  "user.view",
  "order.view",
  "ticket.view",
  "ticket.reply",
  "ticket.assign",
  "ticket.close",
  "callback.view",
  "callback.update",
  "media.view",
];

const INSTRUCTOR_PERMS: AdminAction[] = [
  "dashboard.view",
  "analytics.courses.view",
  "course.view",
  "course.edit",
  "curriculum.edit",
  "article.view",
  "article.create",
  "article.edit",
  "media.view",
  "media.upload",
];

const STATIC_ROLE_PERMS: Record<UserRole, AdminAction[]> = {
  admin: [], // computed lazily via adminPerms() — see roleDefaultPerms
  support: SUPPORT_PERMS,
  instructor: INSTRUCTOR_PERMS,
  student: [],
  sales_agent: [],
};

export function roleDefaultPerms(role: UserRole): AdminAction[] {
  if (role === "admin") return adminPerms();
  return STATIC_ROLE_PERMS[role] ?? [];
}

/**
 * Compute the effective permission set for a user, applying per-user
 * grant/deny overrides on top of the role defaults. Denies win over grants.
 */
export function effectivePerms(
  role: UserRole,
  grants: AdminAction[] = [],
  denies: AdminAction[] = []
): Set<AdminAction> {
  const set = new Set<AdminAction>(roleDefaultPerms(role));
  for (const g of grants) set.add(g);
  for (const d of denies) set.delete(d);
  return set;
}

/**
 * Decide whether a given action is allowed for the current session. The
 * source of truth is the DB record — session.role may be stale if the
 * admin changed this user's role/permissions since last login.
 */
export function can(
  session: Session | null | undefined,
  action: AdminAction
): boolean {
  if (!session) return false;
  const fresh = getUser(session.userId);
  if (!fresh || fresh.status === "disabled") return false;

  const grants = (fresh.permissionGrants ?? []) as AdminAction[];
  const denies = (fresh.permissionDenies ?? []) as AdminAction[];
  if (denies.includes(action)) return false;
  if (grants.includes(action)) return true;
  return roleDefaultPerms(fresh.role).includes(action);
}

/** Throw-based assertion, used in server-actions. */
export function requirePerm(session: Session | null, action: AdminAction) {
  if (!can(session, action)) throw new Error("forbidden");
}

export type PermissionSource = "role" | "grant" | "deny";

export function permissionSource(
  role: UserRole,
  grants: AdminAction[],
  denies: AdminAction[],
  action: AdminAction
): { allowed: boolean; source: PermissionSource } {
  if (denies.includes(action)) return { allowed: false, source: "deny" };
  if (grants.includes(action)) return { allowed: true, source: "grant" };
  return {
    allowed: roleDefaultPerms(role).includes(action),
    source: "role",
  };
}
