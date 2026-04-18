"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icons";
import Sidebar from "./Sidebar";
import { Button, Dropdown, DropdownItem, cx } from "./ui";
import type { Session } from "@/lib/auth";
import { USER_ROLE_LABELS } from "@/lib/formatting";

export default function Topbar({ session }: { session: Session }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-[#e5eaf5]">
        <div className="flex items-center gap-3 px-4 md:px-6 h-16">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-[#f7fafd]"
            onClick={() => setMobileOpen(true)}
            aria-label="منو"
          >
            <Icon.Menu width={20} height={20} />
          </button>

          <div className="text-sm text-[#010514]/55 hidden md:block">
            پنل مدیریت نامدار آکادمی
          </div>

          <div className="flex-1" />

          <Link
            href="/dashboard"
            className="text-sm text-[#010514]/70 hover:text-[#1b3c8a] transition hidden md:inline"
          >
            بازگشت به سایت ←
          </Link>

          <Dropdown
            align="left"
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#f7fafd] transition"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#136cb5] to-[#49bbbd] text-white font-bold flex items-center justify-center">
                  {session.name.charAt(0)}
                </span>
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold text-[#010514]">
                    {session.name}
                  </div>
                  <div className="text-[10px] text-[#010514]/55">
                    {USER_ROLE_LABELS[session.role]}
                  </div>
                </div>
                <Icon.ChevronDown
                  width={14}
                  height={14}
                  className="text-[#010514]/55"
                />
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-[#eef2f7]">
              <div className="text-sm font-bold">{session.name}</div>
              <div className="text-xs text-[#010514]/55 font-mono" dir="ltr">
                {session.phone}
              </div>
            </div>
            <DropdownItem onClick={() => router.push("/dashboard")}>
              پنل شخصی من
            </DropdownItem>
            <DropdownItem onClick={() => router.push("/admin/settings/site")}>
              تنظیمات سایت
            </DropdownItem>
            <DropdownItem danger onClick={logout}>
              خروج
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      <div
        className={cx(
          "lg:hidden fixed inset-0 z-40 transition",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cx(
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cx(
            "absolute top-0 right-0 h-full transition-transform",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Fallback logout button outside dropdown for no-js */}
      <noscript>
        <div className="hidden">
          <Button onClick={logout}>خروج</Button>
        </div>
      </noscript>
    </>
  );
}
