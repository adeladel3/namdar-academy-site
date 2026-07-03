"use client";

import { useState } from "react";

export default function LicenseCodeBox({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#1b3c8a]/30 bg-[#f7faff] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div
        dir="ltr"
        className="flex-1 min-w-0 font-mono font-extrabold text-[#1b3c8a] text-[15px] md:text-[18px] tracking-wider break-all text-center sm:text-left select-all"
      >
        {licenseKey}
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#1b3c8a] text-white font-extrabold text-[14px] hover:opacity-95 active:translate-y-[1px] transition"
      >
        {copied ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            کپی شد
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            کپی کد
          </>
        )}
      </button>
    </div>
  );
}
