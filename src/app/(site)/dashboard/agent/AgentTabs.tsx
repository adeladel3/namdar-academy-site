"use client";

import { useState, type ReactNode } from "react";

export type AgentTab = "overview" | "links" | "clients";

const TABS: { id: AgentTab; label: string; icon: ReactNode }[] = [
  {
    id: "overview",
    label: "خلاصه",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9" />
        <path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10" />
      </svg>
    ),
  },
  {
    id: "links",
    label: "لینک‌ها",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007 0l4-4a5 5 0 00-7-7l-1.5 1.5" />
        <path d="M14 11a5 5 0 00-7 0l-4 4a5 5 0 007 7l1.5-1.5" />
      </svg>
    ),
  },
  {
    id: "clients",
    label: "مشتریان",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function AgentTabs({
  initial = "overview",
  overview,
  links,
  clients,
}: {
  initial?: AgentTab;
  overview: ReactNode;
  links: ReactNode;
  clients: ReactNode;
}) {
  const [tab, setTab] = useState<AgentTab>(initial);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-1.5 inline-flex">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-extrabold transition cursor-pointer ${
                active
                  ? "bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white shadow-[0_8px_18px_-10px_rgba(27,60,138,0.55)]"
                  : "text-[#0e1a3d]/65 hover:text-[#0e1a3d] hover:bg-[#f4f7fc]"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === "overview" && overview}
        {tab === "links" && links}
        {tab === "clients" && clients}
      </div>
    </div>
  );
}
