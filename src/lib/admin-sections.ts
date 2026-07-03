import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { AdminAction } from "@/lib/rbac";

/**
 * Single source of truth for the admin panel.
 *
 * Why this exists:
 *   The sidebar nav, the permission matrix, and (eventually) route-level
 *   permission enforcement all need to know "what admin sections exist."
 *   Without a registry, we duplicated this list in three places and forgot
 *   to update one — new sections silently bypassed the permission matrix.
 *
 * How auto-discovery works:
 *   `EXPLICIT_SECTIONS` is the curated list with proper Persian labels and
 *   fine-grained `actions`. At module init we ALSO scan `src/app/admin/*`
 *   for folders that aren't in the explicit list and aren't Next.js dynamic
 *   segments (`[...slug]`) — those auto-register with a default
 *   `section.<key>.access` permission. That way, when a developer adds a
 *   new admin section folder in the future, it shows up in the sidebar AND
 *   in the permission matrix automatically — even without touching this
 *   file. The dev gets a warning in the server log nudging them to add an
 *   explicit entry for a proper label and icon.
 */

export type IconName =
  | "Dashboard"
  | "Book"
  | "Log"
  | "Folder"
  | "Users"
  | "Receipt"
  | "Tag"
  | "Chart"
  | "Bell"
  | "Check"
  | "Media"
  | "Ticket"
  | "Sms"
  | "Mail"
  | "Settings"
  | "Shield";

export type AdminSection = {
  /** URL-safe key, also used as the permission prefix for the section. */
  key: string;
  /** Persian label shown in the sidebar AND the permission matrix. */
  label: string;
  /** Sidebar link target. */
  href: string;
  /** Icon name (resolved to a component in the client Sidebar). */
  iconName: IconName;
  /**
   * Regex for "is this section active?" — applied to the current pathname.
   * Stored as a string here so the value can serialize across the
   * server→client boundary; the client re-hydrates it with `new RegExp`.
   */
  matchPattern: string;
  /**
   * Permission actions that belong to this section. The first one is the
   * minimum permission to *see* the section in the sidebar; the rest are
   * fine-grained actions shown grouped under the section in the matrix.
   *
   * For auto-discovered sections we synthesize a single
   * `section.<key>.access` action.
   */
  actions: AdminAction[];
  /**
   * Whether this section was auto-discovered from the filesystem (no
   * explicit entry). UI may surface a small badge to remind the developer
   * to add a proper entry.
   */
  autoDiscovered?: boolean;
};

/**
 * Curated sections — each one has a hand-written Persian label, a chosen
 * icon, and maps to the existing fine-grained `AdminAction` keys defined
 * in `src/lib/rbac.ts`. Order here = order in the sidebar.
 */
const EXPLICIT_SECTIONS: AdminSection[] = [
  {
    key: "dashboard",
    label: "داشبورد",
    href: "/admin",
    iconName: "Dashboard",
    matchPattern: "^/admin$",
    actions: ["dashboard.view"],
  },
  {
    key: "courses",
    label: "دوره‌ها",
    href: "/admin/courses",
    iconName: "Book",
    matchPattern: "^/admin/courses",
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
    href: "/admin/seminars",
    iconName: "Ticket",
    matchPattern: "^/admin/seminars",
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
    href: "/admin/articles",
    iconName: "Log",
    matchPattern: "^/admin/articles",
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
    href: "/admin/static-pages",
    iconName: "Folder",
    matchPattern: "^/admin/static-pages",
    actions: ["staticPage.view", "staticPage.manage"],
  },
  {
    key: "users",
    label: "کاربران",
    href: "/admin/users",
    iconName: "Users",
    matchPattern: "^/admin/users",
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
    label: "سفارش‌ها",
    href: "/admin/orders",
    iconName: "Receipt",
    matchPattern: "^/admin/orders",
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
    href: "/admin/discounts",
    iconName: "Tag",
    matchPattern: "^/admin/discounts",
    actions: [
      "discount.view",
      "discount.create",
      "discount.edit",
      "discount.delete",
    ],
  },
  {
    key: "analytics",
    label: "تحلیل و گزارش",
    href: "/admin/analytics",
    iconName: "Chart",
    matchPattern: "^/admin/analytics",
    actions: [
      "analytics.view",
      "analytics.revenue.view",
      "analytics.funnel.view",
      "analytics.retention.view",
      "analytics.courses.view",
      "analytics.marketing.view",
    ],
  },
  {
    key: "faqs",
    label: "سوالات متداول",
    href: "/admin/faqs",
    iconName: "Bell",
    matchPattern: "^/admin/faqs",
    actions: ["faq.manage"],
  },
  {
    key: "testimonials",
    label: "نظرات دانش‌پذیران",
    href: "/admin/testimonials",
    iconName: "Check",
    matchPattern: "^/admin/testimonials",
    actions: ["testimonial.manage"],
  },
  {
    key: "wall-of-fame",
    label: "دیوار افتخارات",
    href: "/admin/wall-of-fame",
    iconName: "Media",
    matchPattern: "^/admin/wall-of-fame",
    actions: ["wallOfFame.view", "wallOfFame.manage"],
  },
  {
    key: "tickets",
    label: "تیکت‌های پشتیبانی",
    href: "/admin/tickets",
    iconName: "Ticket",
    matchPattern: "^/admin/tickets",
    actions: ["ticket.view", "ticket.reply", "ticket.assign", "ticket.close"],
  },
  {
    key: "agents",
    label: "کارشناسان فروش",
    href: "/admin/agents",
    iconName: "Users",
    matchPattern: "^/admin/agents",
    actions: ["agent.view", "agent.manage"],
  },
  {
    key: "course-qa-access",
    label: "پنل پرسش‌وپاسخ دوره‌ها",
    href: "/admin/course-qa-access",
    iconName: "Ticket",
    matchPattern: "^/admin/course-qa-access",
    actions: ["courseQa.view", "courseQa.manage"],
  },
  {
    key: "callback-requests",
    label: "درخواست‌های تماس",
    href: "/admin/callback-requests",
    iconName: "Sms",
    matchPattern: "^/admin/callback-requests",
    actions: ["callback.view", "callback.update", "callback.export"],
  },
  {
    key: "newsletter",
    label: "خبرنامه",
    href: "/admin/newsletter",
    iconName: "Mail",
    matchPattern: "^/admin/newsletter",
    actions: ["newsletter.view", "newsletter.export"],
  },
  {
    key: "content",
    label: "دسته و برچسب",
    href: "/admin/content/categories",
    iconName: "Folder",
    matchPattern: "^/admin/content",
    actions: ["category.manage", "tag.manage"],
  },
  {
    key: "media",
    label: "کتابخانه رسانه",
    href: "/admin/media",
    iconName: "Media",
    matchPattern: "^/admin/media",
    actions: ["media.view", "media.upload", "media.delete"],
  },
  {
    key: "audit-log",
    label: "لاگ عملیات",
    href: "/admin/audit-log",
    iconName: "Log",
    matchPattern: "^/admin/audit-log",
    actions: ["audit.view"],
  },
  {
    key: "settings",
    label: "تنظیمات",
    href: "/admin/settings/site",
    iconName: "Settings",
    matchPattern: "^/admin/settings",
    actions: ["settings.view", "settings.edit"],
  },
];

/**
 * Discover folders under `src/app/admin/*` that aren't in EXPLICIT_SECTIONS
 * and aren't Next.js route conventions (`[slug]`, `_components`, etc.).
 * Each becomes an auto-section with a single `section.<key>.access` action.
 *
 * This scan runs at module-load time on the server only. In production it
 * runs once per Node process; in dev the module reloads when files change.
 */
function discoverFromFs(): AdminSection[] {
  const adminDir = path.join(process.cwd(), "src", "app", "admin");
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(adminDir, { withFileTypes: true });
  } catch {
    // Build/test environments without the source tree — fall through silently.
    return [];
  }

  const knownKeys = new Set(EXPLICIT_SECTIONS.map((s) => s.key));
  const out: AdminSection[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    // Skip dynamic segments, parallel routes, route groups, private folders.
    if (name.startsWith("[") || name.startsWith("(") || name.startsWith("_")) {
      continue;
    }
    if (knownKeys.has(name)) continue;

    // Sanity-check: only register folders that actually contain a page.
    const hasPage =
      fs.existsSync(path.join(adminDir, name, "page.tsx")) ||
      fs.existsSync(path.join(adminDir, name, "page.ts")) ||
      fs.existsSync(path.join(adminDir, name, "page.jsx"));
    if (!hasPage) continue;

    const accessAction = `section.${name}.access` as AdminAction;
    out.push({
      key: name,
      label: `بخش ${name}`,
      href: `/admin/${name}`,
      iconName: "Folder",
      matchPattern: `^/admin/${escapeRegex(name)}`,
      actions: [accessAction],
      autoDiscovered: true,
    });

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[admin-sections] auto-discovered "/admin/${name}". Add an explicit entry in src/lib/admin-sections.ts for a proper Persian label and icon.`
      );
    }
  }

  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let cachedSections: AdminSection[] | null = null;

/**
 * Get the merged section list (explicit + auto-discovered).
 *
 * Lazy + cached: discovery touches the filesystem, so we don't redo it on
 * every render. In production this is effectively static; in dev the dev
 * server's module reload picks up new folders.
 */
export function getAdminSections(): AdminSection[] {
  if (cachedSections) return cachedSections;
  cachedSections = [...EXPLICIT_SECTIONS, ...discoverFromFs()];
  return cachedSections;
}

/**
 * Flat list of every action across every section — used by `rbac.ts` to
 * build `ALL_ACTIONS` and `roleDefaultPerms("admin")`.
 */
export function getAllSectionActions(): AdminAction[] {
  return getAdminSections().flatMap((s) => s.actions);
}
