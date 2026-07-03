"use client";

import Link from "@/components/SafeLink";
import { useEffect, useState } from "react";
import ShareButtons from "./ShareButtons";

type Props = {
  shareTitle: string;
  sharePath: string;
  supportText?: string;
  supportHref?: string;
  /**
   * Vertical offset from the bottom of the viewport. Default 96px — leaves
   * room at the very bottom-right corner for a potential third-party chat
   * widget (Goftino/Raychat/Tawk) loaded by LiveChat.
   *
   * The dock always stays in the viewport margin, so it never enters the
   * reading column regardless of offset.
   */
  bottomOffset?: number;
};

/**
 * A fixed-position support + share dock that sits in the viewport's right
 * margin. Collapsed: a single circular FAB with a headset icon. Expanded:
 * a compact card with share buttons and a "contact support" CTA.
 *
 * Positioned with `fixed` so it never intrudes on the text column — it sits
 * in the viewport margin, visible through every scroll without shifting the
 * reading flow. Z-index sits above normal content but below modal overlays.
 */
export default function FloatingSupportDock({
  shareTitle,
  sharePath,
  supportText = "برای مشاوره رایگان و پاسخ به سوالاتتان، با پشتیبانی ما در تماس باشید.",
  supportHref = "/contact",
  bottomOffset = 96,
}: Props) {
  const [open, setOpen] = useState(false);

  // ESC closes the panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Backdrop — click-outside to close. Subtle, non-blocking on desktop. */}
      {open && (
        <button
          type="button"
          aria-label="بستن"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-[2px] cursor-default"
        />
      )}

      <div
        className="fixed z-[60] right-4 sm:right-6"
        style={{ bottom: bottomOffset }}
        dir="rtl"
      >
        {/* Expandable panel */}
        <div
          className={`origin-bottom-right transition-all duration-300 ease-out ${
            open
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-90 translate-y-3 pointer-events-none"
          }`}
        >
          <div className="mb-3 w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-[0_24px_60px_-12px_rgba(10,22,48,0.35)] border border-[#e5eaf5] overflow-hidden">
            {/* Gradient header strip — matches coaching page's visual language */}
            <div
              className="px-5 py-4 text-white"
              style={{
                background:
                  "linear-gradient(135deg, #136cb5 0%, #1b3c8a 55%, #49bbbd 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M3 12a9 9 0 0 1 18 0v6a2 2 0 0 1-2 2h-1v-7h3" />
                      <path d="M3 18V12h3v8H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </span>
                  <div className="font-['Yekan_Bakh:Bold',sans-serif] text-[14px] font-bold">
                    پشتیبانی و اشتراک
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="بستن"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-['Yekan_Bakh:Bold',sans-serif] text-[13px] font-bold text-[#010514] mb-3">
                اشتراک‌گذاری
              </h4>
              <ShareButtons title={shareTitle} path={sharePath} />

              <div className="my-4 h-px bg-[#eef2f7]" />

              <h4 className="font-['Yekan_Bakh:Bold',sans-serif] text-[13px] font-bold text-[#010514] mb-2">
                سوال دارید؟
              </h4>
              <p className="text-[12.5px] text-[#010514]/70 leading-[1.8] mb-4">
                {supportText}
              </p>
              <Link
                href={supportHref}
                className="group/cta flex items-center justify-center gap-2 w-full py-3 rounded-full text-white font-bold text-[13.5px] transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, #136cb5 0%, #1b3c8a 50%, #49bbbd 100%)",
                  boxShadow:
                    "0 10px 24px -8px rgba(19,108,181,0.5), inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover/cta:-translate-x-0.5"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                </svg>
                تماس با پشتیبانی
              </Link>
            </div>
          </div>
        </div>

        {/* Floating action button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "بستن پنل پشتیبانی" : "باز کردن پنل پشتیبانی"}
          aria-expanded={open}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          style={{
            background:
              "linear-gradient(135deg, #136cb5 0%, #1b3c8a 55%, #49bbbd 100%)",
            boxShadow:
              "0 12px 28px -6px rgba(19,108,181,0.55), 0 0 0 6px rgba(19,108,181,0.12), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          {/* Pulse ring (only while collapsed) */}
          {!open && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full animate-ping opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(73,187,189,0.55) 0%, transparent 70%)",
                animationDuration: "2.6s",
              }}
            />
          )}
          <span className="relative">
            {open ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 18 0v6a2 2 0 0 1-2 2h-1v-7h3" />
                <path d="M3 18V12h3v8H5a2 2 0 0 1-2-2z" />
                <circle cx="18" cy="18" r="1.3" fill="#ffffff" stroke="none" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </>
  );
}
