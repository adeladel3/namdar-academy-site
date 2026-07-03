"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/cx";
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS_SHORT,
  formatJalali,
  isoToJalali,
  jalaliMonthDays,
  jalaliToIso,
  toJalali,
  toGregorian,
} from "@/lib/jalali";
import { inputCx, usePopupPosition } from "./ui";

const fa = (n: number) =>
  String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

type ViewState = { jy: number; jm: number };

export function JalaliDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled,
  className,
  clearable = true,
}: {
  value: string; // yyyy-MM-dd گرگوری، یا رشته خالی
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const pos = usePopupPosition(anchorRef, open, 400);

  const today = useMemo(() => {
    const d = new Date();
    return toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }, []);

  const selectedJ = useMemo(() => isoToJalali(value), [value]);

  const [view, setView] = useState<ViewState>(() =>
    selectedJ
      ? { jy: selectedJ.jy, jm: selectedJ.jm }
      : { jy: today.jy, jm: today.jm }
  );

  useEffect(() => {
    if (open && selectedJ) {
      setView({ jy: selectedJ.jy, jm: selectedJ.jm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function prevMonth() {
    setView((v) =>
      v.jm === 1 ? { jy: v.jy - 1, jm: 12 } : { jy: v.jy, jm: v.jm - 1 }
    );
  }
  function nextMonth() {
    setView((v) =>
      v.jm === 12 ? { jy: v.jy + 1, jm: 1 } : { jy: v.jy, jm: v.jm + 1 }
    );
  }

  function pick(jd: number) {
    onChange(jalaliToIso(view.jy, view.jm, jd));
    setOpen(false);
  }

  function goToday() {
    onChange(jalaliToIso(today.jy, today.jm, today.jd));
    setView({ jy: today.jy, jm: today.jm });
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  const daysInMonth = jalaliMonthDays(view.jy, view.jm);

  // ایندکس روز هفته اولین روز این ماه شمسی (۰=شنبه ... ۶=جمعه)
  const firstDayWeekIndex = useMemo(() => {
    const g = toGregorian(view.jy, view.jm, 1);
    const dt = new Date(g.gy, g.gm - 1, g.gd);
    return (dt.getDay() + 1) % 7;
  }, [view.jy, view.jm]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const displayText = value ? formatJalali(value) : "";

  const popup =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popupRef}
            dir="rtl"
            className="z-[100] rounded-2xl border border-[#e5eaf5] bg-white shadow-[0_22px_50px_-14px_rgba(14,26,61,0.28)] p-3.5 overflow-y-auto"
            style={{
              position: "fixed",
              top: pos.placement === "below" ? pos.top : undefined,
              bottom:
                pos.placement === "above"
                  ? window.innerHeight - pos.top
                  : undefined,
              right: pos.right,
              width: 300,
              maxHeight: pos.maxHeight,
              animation: "jdpIn 0.14s ease-out",
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg text-[#1b3c8a] hover:bg-[#f4f7fc] flex items-center justify-center"
              aria-label="ماه قبل"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <div className="font-extrabold text-[#0e1a3d] text-[14px]">
              {JALALI_MONTHS[view.jm - 1]} {fa(view.jy)}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg text-[#1b3c8a] hover:bg-[#f4f7fc] flex items-center justify-center"
              aria-label="ماه بعد"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {JALALI_WEEKDAYS_SHORT.map((w, i) => (
              <div
                key={i}
                className={cx(
                  "h-7 flex items-center justify-center text-[11px] font-bold",
                  i === 6 ? "text-rose-500/80" : "text-[#010514]/50"
                )}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const isToday =
                d === today.jd && view.jm === today.jm && view.jy === today.jy;
              const isSelected =
                !!selectedJ &&
                d === selectedJ.jd &&
                view.jm === selectedJ.jm &&
                view.jy === selectedJ.jy;
              const isFriday = i % 7 === 6;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(d)}
                  className={cx(
                    "h-9 rounded-lg text-[13px] font-medium transition relative",
                    isSelected
                      ? "text-white font-extrabold shadow-[0_6px_14px_-6px_rgba(27,60,138,0.55)]"
                      : isToday
                      ? "bg-[#eef4ff] text-[#1b3c8a] font-extrabold ring-1 ring-[#1b3c8a]/30"
                      : isFriday
                      ? "text-rose-500/90 hover:bg-[#fff4f4]"
                      : "text-[#010514]/80 hover:bg-[#f4f7fc]"
                  )}
                  style={
                    isSelected
                      ? {
                          background:
                            "linear-gradient(135deg, #1b3c8a 0%, #136cb5 55%, #49bbbd 100%)",
                        }
                      : undefined
                  }
                >
                  {fa(d)}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#eef2f7]">
            {clearable && value ? (
              <button
                type="button"
                onClick={clear}
                className="text-[12px] text-rose-600 hover:underline font-bold"
              >
                پاک کردن
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={goToday}
              className="text-[12px] text-[#1b3c8a] hover:underline font-bold"
            >
              امروز
            </button>
          </div>
          <style jsx>{`
            @keyframes jdpIn {
              from {
                opacity: 0;
                transform: translateY(-4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>,
        document.body
      )
      : null;

  return (
    <div className={cx("relative", className)} dir="rtl">
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cx(
          inputCx,
          "flex items-center justify-between text-right gap-3",
          open && "border-[#1b3c8a] ring-2 ring-[#1b3c8a]/15",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cx(
            "flex-1 truncate",
            displayText ? "text-[#010514]" : "text-[#010514]/40"
          )}
        >
          {displayText || placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#1b3c8a]/70 shrink-0"
        >
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {popup}
    </div>
  );
}
