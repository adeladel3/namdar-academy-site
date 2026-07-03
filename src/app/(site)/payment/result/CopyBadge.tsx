"use client";

import { useState } from "react";

export default function CopyBadge({
  label,
  value,
  display,
  tone = "gold",
}: {
  label: string;
  value: string;
  display: string;
  tone?: "gold" | "teal" | "rose" | "neutral";
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  const toneMap = {
    gold: {
      badge: "bg-[#f7cf5a]/15 border-[#f7cf5a]/35 text-[#f7cf5a]",
      btn: "text-[#f7cf5a] hover:bg-[#f7cf5a]/15",
    },
    teal: {
      badge: "bg-[#49bbbd]/15 border-[#49bbbd]/35 text-[#7cd6d8]",
      btn: "text-[#7cd6d8] hover:bg-[#49bbbd]/15",
    },
    rose: {
      badge: "bg-rose-400/15 border-rose-300/35 text-rose-200",
      btn: "text-rose-200 hover:bg-rose-400/15",
    },
    neutral: {
      badge: "bg-white/10 border-white/20 text-white/90",
      btn: "text-white/90 hover:bg-white/10",
    },
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] tracking-[0.22em] font-extrabold text-white/50 mb-1">
          {label}
        </div>
        <div
          dir="ltr"
          className="font-extrabold text-white text-[14px] md:text-[15px] leading-tight truncate text-left tabular-nums"
        >
          {display}
        </div>
      </div>

      <button
        type="button"
        onClick={onCopy}
        aria-label="کپی"
        className={`shrink-0 inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[11.5px] font-extrabold transition ${toneMap.badge} ${toneMap.btn}`}
      >
        {copied ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            کپی شد
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            کپی
          </>
        )}
      </button>
    </div>
  );
}
