"use client";

import Link from "@/components/SafeLink";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Icon } from "./Icons";
import { cx } from "./ui";
import BrandLogo from "@/components/BrandLogo";

/**
 * Sidebar reads its nav from the `sections` prop, which the admin layout
 * server-component derives from `getAdminSections()` in
 * `src/lib/admin-sections.ts`. We pass icon names as strings (rather than
 * component references) because the registry is server-only and React
 * components don't cross the server→client boundary cleanly.
 */
export type SidebarSection = {
  key: string;
  label: string;
  href: string;
  iconName: string;
  /**
   * Regex source for "is this section active?". The layout serialises the
   * pattern as a string and we re-hydrate it with `new RegExp` here.
   */
  matchPattern: string;
  autoDiscovered?: boolean;
};

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Dashboard: Icon.Dashboard,
  Book: Icon.Book,
  Log: Icon.Log,
  Folder: Icon.Folder,
  Users: Icon.Users,
  Receipt: Icon.Receipt,
  Tag: Icon.Tag,
  Chart: Icon.Chart,
  Bell: Icon.Bell,
  Check: Icon.Check,
  Media: Icon.Media,
  Ticket: Icon.Ticket,
  Sms: Icon.Sms,
  Mail: Icon.Mail,
  Settings: Icon.Settings,
  Shield: Icon.Shield,
};

export default function Sidebar({
  sections,
  onNavigate,
}: {
  sections: SidebarSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";

  const compiled = useMemo(
    () =>
      sections.map((s) => ({
        ...s,
        IconComp: ICON_MAP[s.iconName] ?? Icon.Folder,
        match: new RegExp(s.matchPattern),
      })),
    [sections]
  );

  return (
    <aside className="h-full w-72 bg-gradient-to-b from-[#0f1f4a] via-[#112559] to-[#0f1f4a] text-white flex flex-col relative">
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a]"
      />
      <div
        className="px-5 pt-6 pb-5 border-b border-white/10"
        onClick={onNavigate}
      >
        <BrandLogo variant="light" size="sm" href="/admin" />
        <div className="text-[11px] text-white/55 mt-2 pr-1 tracking-wide">
          پنل مدیریت نامدار آکادمی
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {compiled.map((item) => {
          const active = item.match.test(pathname);
          const IconComp = item.IconComp;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cx(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition",
                active
                  ? "bg-white/10 text-white font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-gradient-to-b from-[#f7cf5a] to-[#d4a62a]"
                />
              )}
              <IconComp width={18} height={18} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.autoDiscovered && (
                <span
                  title="این بخش به‌صورت خودکار از فایل‌سیستم شناسایی شده. برای برچسب و آیکن مناسب، یک ورودی صریح در src/lib/admin-sections.ts اضافه کنید."
                  className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold"
                >
                  جدید
                </span>
              )}
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
