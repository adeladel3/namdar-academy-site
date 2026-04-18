"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
import { cx } from "./ui";

const NAV: {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  match?: RegExp;
}[] = [
  { label: "داشبورد", href: "/admin", icon: Icon.Dashboard, match: /^\/admin$/ },
  {
    label: "دوره‌ها",
    href: "/admin/courses",
    icon: Icon.Book,
    match: /^\/admin\/courses/,
  },
  {
    label: "مقالات",
    href: "/admin/articles",
    icon: Icon.Log,
    match: /^\/admin\/articles/,
  },
  {
    label: "کاربران",
    href: "/admin/users",
    icon: Icon.Users,
    match: /^\/admin\/users/,
  },
  {
    label: "سفارش‌ها",
    href: "/admin/orders",
    icon: Icon.Receipt,
    match: /^\/admin\/orders/,
  },
  {
    label: "کدهای تخفیف",
    href: "/admin/discounts",
    icon: Icon.Tag,
    match: /^\/admin\/discounts/,
  },
  {
    label: "تحلیل و گزارش",
    href: "/admin/analytics",
    icon: Icon.Chart,
    match: /^\/admin\/analytics/,
  },
  {
    label: "سوالات متداول",
    href: "/admin/faqs",
    icon: Icon.Bell,
    match: /^\/admin\/faqs/,
  },
  {
    label: "نظرات دانش‌پذیران",
    href: "/admin/testimonials",
    icon: Icon.Check,
    match: /^\/admin\/testimonials/,
  },
  {
    label: "خبرنامه",
    href: "/admin/newsletter",
    icon: Icon.Mail,
    match: /^\/admin\/newsletter/,
  },
  {
    label: "دسته و برچسب",
    href: "/admin/content/categories",
    icon: Icon.Folder,
    match: /^\/admin\/content/,
  },
  {
    label: "کتابخانه رسانه",
    href: "/admin/media",
    icon: Icon.Media,
    match: /^\/admin\/media/,
  },
  {
    label: "لاگ عملیات",
    href: "/admin/audit-log",
    icon: Icon.Log,
    match: /^\/admin\/audit-log/,
  },
  {
    label: "تنظیمات",
    href: "/admin/settings/site",
    icon: Icon.Settings,
    match: /^\/admin\/settings/,
  },
];

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="h-full w-72 bg-[#0f1f4a] text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin" className="block" onClick={onNavigate}>
          <div className="text-lg font-bold">نامدار آکادمی</div>
          <div className="text-xs text-white/55 mt-0.5">پنل مدیریت</div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((item) => {
          const active = item.match
            ? item.match.test(pathname)
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
                active
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon width={18} height={18} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/10 text-[11px] text-white/45">
        نسخه ۱.۰ • پنل داخلی
      </div>
    </aside>
  );
}
