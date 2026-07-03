"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type Capability = {
  key: string;
  title: string;
  tagline: string;
  bullets: string[];
  accent: string;
  icon: React.ReactNode;
};

export default function InvestingHubClient({
  capabilities,
}: {
  capabilities: Capability[];
}) {
  const [active, setActive] = useState<Capability | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {capabilities.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActive(c)}
            className="group relative flex items-center gap-3.5 rounded-[20px] px-5 py-4 text-right transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 overflow-hidden cursor-pointer"
            style={{
              backgroundImage: [
                "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 22%)",
                "linear-gradient(148deg, rgba(130,165,205,0.22) 0%, rgba(55,90,135,0.32) 100%)",
              ].join(", "),
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.22)",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.40)",
                "inset 0 -1px 0 rgba(0,15,40,0.18)",
                "0 10px 26px rgba(10,22,48,0.22)",
              ].join(", "),
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-[20px]"
              style={{
                background:
                  "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(160deg, ${c.accent}, ${c.accent}aa)`,
                color: "#0a0e2f",
                boxShadow: `0 4px 14px ${c.accent}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
              }}
            >
              {c.icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[10.5px] tracking-[0.2em] font-bold mb-0.5" style={{ color: c.accent }} dir="ltr">
                {c.tagline}
              </span>
              <span className="block font-extrabold text-[15px] md:text-base text-white leading-tight">
                {c.title}
              </span>
            </span>
            <svg
              className="shrink-0 text-white/60 transition-transform group-hover:-translate-x-1"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        ))}
      </div>

      {active && <CapabilityPopup item={active} onClose={() => setActive(null)} />}

      <style jsx global>{`
        @keyframes ihCapFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ihCapScaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(18px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

function CapabilityPopup({
  item,
  onClose,
}: {
  item: Capability;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-5"
      style={{ animation: "ihCapFadeIn 220ms ease-out both" }}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cap-popup-title"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="بستن"
        className="absolute inset-0 w-full h-full bg-transparent border-0 p-0 cursor-pointer"
        style={{
          background: "rgba(6,12,30,0.62)",
          backdropFilter: "blur(16px) saturate(120%)",
          WebkitBackdropFilter: "blur(16px) saturate(120%)",
        }}
      />

      <div
        className="relative w-full max-w-[680px] rounded-[24px] overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #8fa8cc 0%, #4f6d9c 55%, #2a3f66 100%)",
          boxShadow:
            "0 50px 120px rgba(6,12,30,0.65), inset 0 1px 0 rgba(255,255,255,0.22)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          animation: "ihCapScaleIn 360ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            right: "-80px",
            top: "-80px",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${item.accent}55 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute top-4 left-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="relative px-8 pt-10 pb-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{
              background: `${item.accent}22`,
              border: `1px solid ${item.accent}55`,
            }}
          >
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span
                className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                style={{ background: item.accent }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: item.accent }}
              />
            </span>
            <span
              className="font-bold text-[10.5px] tracking-[2.2px]"
              style={{ color: item.accent }}
              dir="ltr"
            >
              {item.tagline}
            </span>
          </div>
          <h2
            id="cap-popup-title"
            className="font-extrabold text-white leading-[1.2] text-[28px] md:text-[30px] mb-3"
          >
            {item.title}
          </h2>
        </div>

        <ul className="relative px-8 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {item.bullets.map((p) => (
            <li
              key={p}
              className="flex items-center gap-2.5 text-right rounded-[14px] px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span
                className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${item.accent}, ${item.accent}aa)`,
                  boxShadow: `0 3px 10px ${item.accent}55`,
                }}
                aria-hidden
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a0e2f"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="text-[14px] text-white/95 leading-[1.45]">{p}</span>
            </li>
          ))}
        </ul>

        <div className="relative px-8 pt-6 pb-6 flex items-center justify-end">
          <div className="flex items-center gap-2 text-white/70 text-[12.5px]">
            <span>برای بستن:</span>
            <span
              className="inline-flex items-center justify-center h-6 px-2 rounded-md"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
              dir="ltr"
            >
              Esc
            </span>
            <span>یا کلیک خارج از کارت</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
