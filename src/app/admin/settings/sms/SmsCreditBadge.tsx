"use client";

import { useCallback, useEffect, useState } from "react";
import { faDigits } from "@/lib/formatting";

type CreditState =
  | { loading: true }
  | { loading: false; ok: true; remainingCredit: number; expireDate?: string; type?: string }
  | { loading: false; ok: false; error: string };

export default function SmsCreditBadge() {
  const [state, setState] = useState<CreditState>({ loading: true });

  const refresh = useCallback(async () => {
    setState({ loading: true });
    try {
      const res = await fetch("/api/admin/settings/sms-credit", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.ok) {
        setState({
          loading: false,
          ok: true,
          remainingCredit: data.remainingCredit,
          expireDate: data.expireDate,
          type: data.type,
        });
      } else {
        setState({ loading: false, ok: false, error: data.error ?? "خطای نامشخص" });
      }
    } catch (e) {
      setState({
        loading: false,
        ok: false,
        error: e instanceof Error ? e.message : "خطا در اتصال",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div
      className="rounded-2xl border border-[#e5eaf5] bg-gradient-to-br from-white to-[#f7fafd] p-5 flex items-center justify-between gap-4"
      dir="rtl"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #1b3c8a 0%, #136cb5 55%, #49bbbd 100%)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-[11.5px] text-[#010514]/55 mb-0.5">
            اعتبار فعلی حساب کاوه‌نگار
          </div>
          {state.loading ? (
            <div className="h-5 w-32 bg-[#eef2f7] rounded animate-pulse" />
          ) : state.ok ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <div className="font-black text-[#0e1a3d] text-xl tabular-nums">
                {faDigits(state.remainingCredit.toLocaleString("fa-IR"))}
              </div>
              <div className="text-[12px] text-[#010514]/60">ریال</div>
              {state.expireDate && (
                <div className="text-[11px] text-[#010514]/55">
                  · انقضا: {state.expireDate}
                </div>
              )}
              {state.type && (
                <div className="text-[11px] text-[#010514]/55">
                  · نوع حساب: {state.type}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[12.5px] text-rose-600">{state.error}</div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={refresh}
        disabled={state.loading}
        className="shrink-0 h-9 px-3.5 rounded-lg text-[12.5px] font-bold text-[#1b3c8a] bg-[#eef4ff] hover:bg-[#dde7ff] transition disabled:opacity-60"
      >
        {state.loading ? "در حال دریافت..." : "به‌روزرسانی"}
      </button>
    </div>
  );
}
