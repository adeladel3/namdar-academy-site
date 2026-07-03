"use client";

import Link from "@/components/SafeLink";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badgeKey?: "ticketUnread";
  /** When true, this item only appears for users whose phone matches an
   *  active sales agent. Used for the agent dashboard tab. */
  agentOnly?: boolean;
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "داشبورد",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/courses",
    label: "دوره‌های من",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
        <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
      </svg>
    ),
  },
  {
    href: "/dashboard/seminars",
    label: "سمینارهای من",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v2a2 2 0 000 4v2a3 3 0 01-3 3H5a3 3 0 01-3-3v-2a2 2 0 000-4z" />
        <path d="M9 6v12" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    href: "/dashboard/orders",
    label: "سفارش‌ها",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tickets",
    label: "تیکت‌های من",
    badgeKey: "ticketUnread",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10.5V7a2 2 0 00-2-2h-3.5a2 2 0 01-4 0H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2v-3.5a2.5 2.5 0 010-5z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/course-qa",
    label: "پرسش‌وپاسخ دوره‌ها",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "پروفایل",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" />
      </svg>
    ),
  },
  {
    href: "/dashboard/support",
    label: "پشتیبانی",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72a2 2 0 011.72 2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/agent",
    label: "داشبورد کارشناس",
    agentOnly: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v4H3zM3 11h18v4H3zM3 19h18v2H3z" />
        <circle cx="7" cy="5" r="0.8" fill="currentColor" />
        <circle cx="7" cy="13" r="0.8" fill="currentColor" />
        <circle cx="7" cy="20" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
];

export default function DashboardShell({
  session,
  isStaffUser,
  isAgent = false,
  ticketUnread = 0,
  children,
}: {
  session: { name: string; phone: string; role: string };
  isStaffUser: boolean;
  /** When true, the "داشبورد کارشناس" nav item becomes visible. */
  isAgent?: boolean;
  ticketUnread?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname?.startsWith(href + "/");
  }

  const activeLabel = NAV.find((n) => isActive(n.href))?.label ?? "پنل کاربری";

  return (
    <div className="bg-[#f7fafd] min-h-screen" dir="rtl">
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-[88px] z-30 bg-white border-b border-[#e5eaf5] px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-10 h-10 rounded-xl bg-[#f4f7fc] text-[#0e1a3d] flex items-center justify-center"
          aria-label="باز کردن منو"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="font-extrabold text-[#0e1a3d] text-[15px]">{activeLabel}</div>
        <Link
          href="/"
          aria-label="بازگشت به سایت"
          className="w-10 h-10 rounded-xl bg-[#f4f7fc] text-[#0e1a3d] flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l9-9 9 9" />
            <path d="M5 10v10h14V10" />
          </svg>
        </Link>
      </div>

      <div className="flex max-w-[1400px] mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex fixed top-[88px] bottom-0 right-0 w-[280px] flex-col bg-white border-l border-[#e5eaf5] z-20">
          <SidebarContent
            session={session}
            isStaffUser={isStaffUser}
            isAgent={isAgent}
            isActive={isActive}
            onNavigate={() => {}}
            onLogout={handleLogout}
            loggingOut={loggingOut}
            badges={{ ticketUnread }}
          />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-[#06142f]/55 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <aside
              className="relative ml-auto w-[300px] max-w-[85vw] h-full bg-white flex flex-col"
              style={{ animation: "dashDrawerIn 0.24s ease-out" }}
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#f4f7fc] text-[#0e1a3d]/70 flex items-center justify-center"
                aria-label="بستن"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
              <SidebarContent
                session={session}
                isStaffUser={isStaffUser}
                isAgent={isAgent}
                isActive={isActive}
                onNavigate={() => setDrawerOpen(false)}
                onLogout={handleLogout}
                loggingOut={loggingOut}
                badges={{ ticketUnread }}
              />
            </aside>
            <style jsx>{`
              @keyframes dashDrawerIn {
                from { transform: translateX(12%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 lg:mr-[280px] min-h-screen py-6 md:py-10 px-4 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  session,
  isStaffUser,
  isAgent,
  isActive,
  onNavigate,
  onLogout,
  loggingOut,
  badges,
}: {
  session: { name: string; phone: string; role: string };
  isStaffUser: boolean;
  isAgent: boolean;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
  onLogout: () => void;
  loggingOut: boolean;
  badges: { ticketUnread: number };
}) {
  const initial = session.name?.trim()?.[0] ?? "ن";
  return (
    <>
      <div className="p-6 border-b border-[#eef2f7]">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 mb-5 text-[#0e1a3d] hover:text-[#1b3c8a] transition text-[13px] font-bold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          بازگشت به سایت
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ring-2 ring-white shadow-[0_6px_16px_-6px_rgba(27,60,138,0.5)]"
            style={{
              background: "linear-gradient(135deg, #1b3c8a, #136cb5 55%, #49bbbd)",
            }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-[#0e1a3d] text-[14px] truncate">
              {session.name}
            </div>
            <div className="text-[11px] text-[#0e1a3d]/55 font-mono truncate" dir="ltr">
              {session.phone}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV.filter((item) => !item.agentOnly || isAgent).map((item) => {
          const active = isActive(item.href);
          const badgeCount =
            item.badgeKey === "ticketUnread" ? badges.ticketUnread : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-bold transition ${
                active
                  ? "bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white shadow-[0_10px_24px_-10px_rgba(27,60,138,0.55)]"
                  : "text-[#0e1a3d]/75 hover:bg-[#f4f7fc] hover:text-[#1b3c8a]"
              }`}
            >
              <span className={active ? "text-white" : "text-[#1b3c8a]/80"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span
                  className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[10.5px] font-black flex items-center justify-center tabular-nums ${
                    active
                      ? "bg-white text-[#1b3c8a]"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {badgeCount.toLocaleString("fa-IR")}
                </span>
              )}
              {active && badgeCount === 0 && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-[#f7cf5a]">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              )}
            </Link>
          );
        })}

        {isStaffUser && (
          <>
            <div className="h-px bg-[#eef2f7] my-3" />
            <Link
              href="/admin"
              onClick={onNavigate}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-bold text-[#2d1c03] transition"
              style={{
                background: "linear-gradient(180deg, #fde285 0%, #f7cf5a 45%, #d4a62a 100%)",
                boxShadow: "0 8px 20px -8px rgba(247,207,90,0.7), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              پنل مدیریت
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[#eef2f7]">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-[13.5px] font-bold text-[#0e1a3d]/70 bg-[#f4f7fc] hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {loggingOut ? "در حال خروج..." : "خروج از حساب"}
        </button>
      </div>
    </>
  );
}
