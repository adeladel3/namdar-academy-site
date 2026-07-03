"use client";

import { useEffect, useRef, useState } from "react";

type ServiceOption = { label: string };

// Curated lead-capture topic list. Deliberately short — dumping the whole
// course catalogue into this dropdown overwhelms users and tanks conversion.
// These are the main lead magnets; everything else funnels through "موارد دیگر".
const CONSULTATION_TOPICS: ServiceOption[] = [
  { label: "دوره پیشرفته MoN" },
  { label: "اینوستینگ هاب" },
  { label: "دوره آنلاین تکنیکال" },
  { label: "مشاوره سرمایه‌گذاری" },
  { label: "موارد دیگر" },
];

const DEFAULT_TRIGGER_CLASSNAME =
  "flex w-full items-center justify-center h-14 rounded-xl text-white font-extrabold text-[16px] transition active:scale-[0.98] mb-3";
const DEFAULT_TRIGGER_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
  boxShadow: "0 14px 30px -10px rgba(19,108,181,0.55)",
};

export default function ConsultationRequestButton({
  source = "landing-mobile-cta",
  triggerClassName = DEFAULT_TRIGGER_CLASSNAME,
  triggerStyle = DEFAULT_TRIGGER_STYLE,
  triggerLabel = "درخواست ثبت مشاوره",
}: {
  source?: string;
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  triggerLabel?: string;
}) {
  const options = CONSULTATION_TOPICS;
  const TOPIC_PLACEHOLDER = "موضوع را انتخاب کنید";
  const [open, setOpen] = useState(false);
  // Start empty, force the user to pick. Otherwise every lead comes in as
  // whatever happened to be the first option — sales team can't tell which
  // ones are deliberate vs default.
  const [topic, setTopic] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [topicOpen, setTopicOpen] = useState(false);
  const topicRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native <dialog> via showModal/close. The browser puts the
  // dialog in the top layer, which escapes the transformed .figma-canvas
  // ancestor — no scroll-lock tricks, no layout reflow on the big canvas.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(() => {
      setOpen(false);
      setStatus("idle");
    }, 1000);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    if (!topicOpen) return;
    function onClickAway(e: MouseEvent) {
      if (!topicRef.current?.contains(e.target as Node)) {
        setTopicOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [topicOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!topic) {
      setErrorMsg("لطفاً موضوع مشاوره را انتخاب کنید");
      setStatus("error");
      setTopicOpen(true);
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          phone,
          topic,
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || "خطا در ثبت درخواست");
        setStatus("error");
        return;
      }
      setStatus("done");
      setPhone("");
      setTopic("");
    } catch {
      setErrorMsg("خطا در ارتباط با سرور");
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus("idle");
        }}
        className={triggerClassName}
        style={triggerStyle}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="consultation-dialog-title"
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="consultation-dialog"
        dir="rtl"
      >
        {open && (
          <div
            className="relative w-full max-w-md mx-auto bg-white rounded-[24px] p-5 pb-6 shadow-[0_24px_60px_-12px_rgba(14,26,61,0.45)]"
            style={{ animation: "cstnFadeIn 0.24s ease-out" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                id="consultation-dialog-title"
                className="font-['Yekan_Bakh:Bold',sans-serif] text-[18px] font-black text-[#0e1a3d]"
              >
                درخواست مشاوره
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-[#f4f7fc] text-[#0e1a3d]/60 flex items-center justify-center active:scale-95"
                aria-label="بستن"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>

            {status === "done" ? (
              <div className="py-6 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className="font-['Yekan_Bakh:Bold',sans-serif] text-[16px] font-extrabold text-[#0e1a3d] mb-1.5">
                  درخواست شما ثبت شد
                </div>
                <p className="text-[13px] text-[#0e1a3d]/65 leading-[1.85]">
                  همکاران ما در اولین فرصت با شما تماس می‌گیرند.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#0e1a3d] text-white text-[13px] font-bold"
                >
                  بستن
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <label className="block">
                  <span className="block text-[12.5px] font-bold text-[#0e1a3d]/80 mb-1.5">
                    شماره تماس
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    required
                    dir="ltr"
                    className="w-full h-12 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[15px] text-[#0e1a3d] px-4 text-center tracking-wider focus:outline-none focus:border-[#136cb5] focus:bg-white"
                  />
                </label>

                <div className="block">
                  <span className="block text-[12.5px] font-bold text-[#0e1a3d]/80 mb-1.5">
                    موضوع مشاوره
                  </span>
                  <div className="relative" ref={topicRef}>
                    <button
                      type="button"
                      onClick={() => setTopicOpen((v) => !v)}
                      aria-invalid={!topic && status === "error"}
                      className={`w-full h-12 rounded-2xl bg-[#f4f7fc] border text-[14px] px-4 pl-9 flex items-center text-right transition ${
                        !topic && status === "error"
                          ? "border-rose-400 bg-rose-50"
                          : topicOpen
                          ? "border-[#136cb5] bg-white"
                          : "border-[#e3e9f4]"
                      } ${topic ? "text-[#0e1a3d]" : "text-[#0e1a3d]/45"}`}
                    >
                      <span className="flex-1 truncate">
                        {topic || TOPIC_PLACEHOLDER}
                      </span>
                      <svg
                        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0e1a3d]/50 transition-transform ${
                          topicOpen ? "rotate-180" : ""
                        }`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {topicOpen && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-white border border-[#e3e9f4] shadow-[0_14px_32px_-8px_rgba(14,26,61,0.22)] overflow-hidden z-10"
                        role="listbox"
                      >
                        {options.map((opt) => {
                          const active = opt.label === topic;
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                setTopic(opt.label);
                                setTopicOpen(false);
                              }}
                              className={`w-full text-right px-4 py-3 text-[13.5px] transition ${
                                active
                                  ? "bg-[#136cb5]/8 text-[#136cb5] font-bold"
                                  : "text-[#0e1a3d] hover:bg-[#f4f7fc]"
                              }`}
                              style={
                                active
                                  ? { backgroundColor: "rgba(19,108,181,0.08)" }
                                  : undefined
                              }
                              role="option"
                              aria-selected={active}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {status === "error" && errorMsg && (
                  <div className="text-[12.5px] text-rose-600 bg-rose-50 rounded-xl px-3 py-2">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex items-center justify-center w-full h-13 rounded-xl text-white font-extrabold text-[15px] transition active:scale-[0.98] disabled:opacity-70 mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
                    boxShadow: "0 12px 26px -10px rgba(19,108,181,0.55)",
                    height: "52px",
                  }}
                >
                  {status === "sending" ? "در حال ارسال..." : "ثبت درخواست مشاوره"}
                </button>
              </form>
            )}
          </div>
        )}
      </dialog>

      <style jsx global>{`
        /* Native <dialog>: stretch to viewport so click outside inner card
         * reaches the dialog element (for dismiss). Scope to [open] so the
         * UA default display:none on closed dialogs is preserved. */
        .consultation-dialog[open] {
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          inset: 0;
          margin: 0;
          padding: 16px;
          background: transparent;
          border: 0;
          color: inherit;
          overflow: auto;
          display: grid;
          place-items: center;
        }
        .consultation-dialog::backdrop {
          background: rgba(6, 20, 47, 0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        @keyframes cstnFadeIn {
          from { transform: translateY(12px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
