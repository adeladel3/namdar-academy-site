"use client";

import { useState } from "react";

export default function CopyReferralLink({ code }: { code: string }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${code}`
      : `https://namdaracademy.com/?ref=${code}`;

  async function copy(text: string, kind: "link" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="relative rounded-3xl p-6 md:p-7 overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(135deg, #1b3c8a 0%, #136cb5 60%, #4fb3c9 100%)",
      }}
    >
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-30 bg-[#f7cf5a] pointer-events-none" />

      <div className="relative">
        <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">
          REFERRAL CODE
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-2xl md:text-3xl font-extrabold tracking-wider"
            dir="ltr"
          >
            {code}
          </span>
          <button
            type="button"
            onClick={() => copy(code, "code")}
            className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold transition cursor-pointer"
          >
            {copied === "code" ? "کپی شد ✓" : "کپی کد"}
          </button>
        </div>

        <div className="text-[12px] font-bold text-white/80 mb-1.5">
          لینک اختصاصی شما
        </div>
        <div className="flex items-stretch gap-2 flex-wrap">
          <div
            className="flex-1 min-w-[220px] px-4 py-2.5 rounded-xl bg-black/25 backdrop-blur-sm border border-white/15 text-[13px] font-mono text-white/95 overflow-hidden text-ellipsis whitespace-nowrap"
            dir="ltr"
          >
            {link}
          </div>
          <button
            type="button"
            onClick={() => copy(link, "link")}
            className="px-5 py-2.5 rounded-xl bg-[#f7cf5a] hover:bg-[#ffd97a] text-[#2d1c03] text-[13px] font-extrabold transition cursor-pointer active:scale-[0.98]"
          >
            {copied === "link" ? "کپی شد ✓" : "کپی لینک"}
          </button>
        </div>

        <div className="text-[11.5px] text-white/65 mt-3 leading-7">
          این لینک را برای مشتری بفرستید. وقتی روی آن کلیک کرد، تا ۳۰ روز
          هر خریدی انجام دهد، به نام شما ثبت می‌شود.
        </div>
      </div>
    </div>
  );
}
