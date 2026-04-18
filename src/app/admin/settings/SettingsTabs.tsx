"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";

const TABS = [
  { href: "/admin/settings/site", label: "سایت", icon: Icon.Folder },
  { href: "/admin/settings/branding", label: "برند و ظاهر", icon: Icon.Palette },
  { href: "/admin/settings/landing", label: "صفحه فرود", icon: Icon.Media },
  { href: "/admin/settings/payment", label: "پرداخت", icon: Icon.Money },
  { href: "/admin/settings/sms", label: "پیامک", icon: Icon.Sms },
  { href: "/admin/settings/email", label: "ایمیل", icon: Icon.Mail },
  { href: "/admin/settings/chat", label: "چت زنده", icon: Icon.Bell },
];

export default function SettingsTabs() {
  const pathname = usePathname() ?? "";
  return (
    <div className="bg-white rounded-2xl border border-[#e5eaf5] overflow-x-auto">
      <div className="flex items-center min-w-max">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                "inline-flex items-center gap-2 px-5 py-3 text-sm whitespace-nowrap transition border-b-2",
                active
                  ? "text-[#1b3c8a] border-[#1b3c8a] font-bold"
                  : "text-[#010514]/65 border-transparent hover:text-[#1b3c8a]"
              )}
            >
              <t.icon width={15} height={15} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
