"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { TicketAttachment, TicketCategory, TicketPriority } from "@/lib/db";
import TicketAttachmentsField from "@/components/TicketAttachmentsField";

const CATEGORIES: { value: TicketCategory; label: string; desc: string }[] = [
  {
    value: "technical",
    label: "فنی و تکنیکال",
    desc: "مشکلات پخش ویدیو، دسترسی، خطاهای سایت",
  },
  {
    value: "billing",
    label: "پرداخت و صورتحساب",
    desc: "پرداخت ناموفق، فاکتور، استرداد",
  },
  {
    value: "course",
    label: "دوره‌ها و محتوا",
    desc: "سوال دربارهٔ محتوا، پیشنهاد، گزارش خطا",
  },
  {
    value: "account",
    label: "حساب کاربری",
    desc: "تغییر اطلاعات، امنیت، ورود",
  },
  {
    value: "other",
    label: "سایر موارد",
    desc: "پیشنهاد، همکاری، سایر درخواست‌ها",
  },
];

const PRIORITIES: { value: TicketPriority; label: string; desc: string }[] = [
  { value: "low", label: "کم", desc: "سوال عمومی، بدون فوریت" },
  { value: "normal", label: "معمولی", desc: "انتظار پاسخ در ساعات اداری" },
  { value: "high", label: "زیاد", desc: "مشکلی مانع استفاده از سرویس است" },
  { value: "urgent", label: "فوری", desc: "مسدودسازی کامل / موضوع مالی حساس" },
];

export default function NewTicketForm({
  courses,
  orders,
  preselectCourseSlug,
}: {
  courses: { slug: string; title: string }[];
  orders: { id: string; label: string }[];
  preselectCourseSlug?: string;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("technical");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [body, setBody] = useState("");
  const [relatedCourseSlug, setRelatedCourseSlug] = useState(
    preselectCourseSlug ?? ""
  );
  const [relatedOrderId, setRelatedOrderId] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    subject?: string;
    body?: string;
  }>({});

  const subjectLen = subject.trim().length;
  const bodyLen = body.trim().length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    const errs: { subject?: string; body?: string } = {};
    if (subjectLen < 3) errs.subject = "موضوع تیکت باید حداقل ۳ کاراکتر باشد.";
    if (bodyLen < 10) errs.body = "متن پیام باید حداقل ۱۰ کاراکتر باشد.";
    if (errs.subject || errs.body) {
      setFieldErrors(errs);
      setStatus("error");
      setError(
        errs.body && errs.subject
          ? "لطفاً موضوع و متن پیام را تکمیل کنید."
          : errs.body
          ? "لطفاً متن پیام خود را وارد کنید (حداقل ۱۰ کاراکتر)."
          : "لطفاً موضوع تیکت را وارد کنید (حداقل ۳ کاراکتر)."
      );
      // Scroll to first invalid field so the user sees why.
      if (typeof document !== "undefined") {
        const sel = errs.subject
          ? 'input[name="subject"]'
          : 'textarea[name="body"]';
        const el = document.querySelector<HTMLElement>(sel);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      }
      return;
    }

    setFieldErrors({});
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          category,
          priority,
          relatedCourseSlug: relatedCourseSlug || undefined,
          relatedOrderId: relatedOrderId || undefined,
          attachments,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "خطا در ثبت تیکت");
        setStatus("error");
        return;
      }
      router.push(`/dashboard/tickets/${data.id}`);
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
      setStatus("error");
    }
  }

  const canSubmit = subjectLen >= 3 && bodyLen >= 10 && status !== "sending";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
      {/* Subject */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6 space-y-4">
        <Field label="موضوع تیکت" required>
          <input
            type="text"
            name="subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (fieldErrors.subject) {
                setFieldErrors((s) => ({ ...s, subject: undefined }));
              }
            }}
            maxLength={120}
            placeholder="خلاصه‌ای کوتاه از موضوع"
            className={`w-full h-12 rounded-2xl bg-[#f4f7fc] border text-[14.5px] text-[#0e1a3d] px-4 focus:outline-none focus:bg-white transition ${
              fieldErrors.subject
                ? "border-rose-400 focus:border-rose-500"
                : "border-[#e3e9f4] focus:border-[#136cb5]"
            }`}
          />
          <div className="flex items-center justify-between gap-3 mt-1.5">
            <div className="text-[11.5px] text-rose-600 font-bold">
              {fieldErrors.subject}
            </div>
            <div
              className="text-[10.5px] text-[#0e1a3d]/50 font-mono tabular-nums"
              dir="ltr"
            >
              {subjectLen} / 120
            </div>
          </div>
        </Field>
      </div>

      {/* Category */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
        <div className="font-extrabold text-[#0e1a3d] text-[14px] mb-3">
          دسته‌بندی<span className="text-rose-500 mr-1">*</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <button
                type="button"
                key={c.value}
                onClick={() => setCategory(c.value)}
                aria-pressed={active}
                className={`text-right p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                  active
                    ? "border-[#1b3c8a] bg-[#eaf1fc] shadow-[0_8px_18px_-10px_rgba(27,60,138,0.35)]"
                    : "border-[#e5eaf5] bg-[#fafbfe] hover:border-[#bcd9f4] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`font-extrabold text-[13.5px] ${active ? "text-[#1b3c8a]" : "text-[#0e1a3d]"}`}
                  >
                    {c.label}
                  </span>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1b3c8a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="text-[11.5px] text-[#0e1a3d]/55 leading-6">
                  {c.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priority */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
        <div className="font-extrabold text-[#0e1a3d] text-[14px] mb-3">
          اولویت
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {PRIORITIES.map((p) => {
            const active = priority === p.value;
            const tints: Record<TicketPriority, string> = {
              low: "border-neutral-200",
              normal: "border-sky-200",
              high: "border-orange-200",
              urgent: "border-rose-200",
            };
            return (
              <button
                type="button"
                key={p.value}
                onClick={() => setPriority(p.value)}
                title={p.desc}
                aria-pressed={active}
                className={`text-center py-3 px-2 rounded-2xl border-2 transition cursor-pointer select-none ${
                  active
                    ? `${tints[p.value]} bg-white shadow-[0_8px_18px_-10px_rgba(14,26,61,0.25)]`
                    : "border-[#e5eaf5] bg-[#fafbfe] hover:border-[#bcd9f4] hover:bg-white"
                }`}
              >
                <div
                  className={`font-extrabold text-[13.5px] ${
                    active
                      ? p.value === "urgent"
                        ? "text-rose-600"
                        : p.value === "high"
                        ? "text-orange-600"
                        : p.value === "normal"
                        ? "text-[#1b3c8a]"
                        : "text-[#0e1a3d]"
                      : "text-[#0e1a3d]/70"
                  }`}
                >
                  {p.label}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[11.5px] text-[#0e1a3d]/55 mt-3 leading-6">
          {PRIORITIES.find((p) => p.value === priority)?.desc}
        </div>
      </div>

      {/* Related course / order */}
      {(courses.length > 0 || orders.length > 0) && (
        <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6 space-y-4">
          <div className="font-extrabold text-[#0e1a3d] text-[14px]">
            مرتبط با (اختیاری)
          </div>
          {courses.length > 0 && (
            <div>
              <span className="block text-[12.5px] font-bold text-[#0e1a3d]/80 mb-1.5">
                دوره
              </span>
              <Dropdown
                placeholder="— انتخاب کنید —"
                value={relatedCourseSlug}
                onChange={setRelatedCourseSlug}
                options={[
                  { value: "", label: "— بدون انتخاب —" },
                  ...courses.map((c) => ({ value: c.slug, label: c.title })),
                ]}
              />
            </div>
          )}
          {orders.length > 0 && (
            <div>
              <span className="block text-[12.5px] font-bold text-[#0e1a3d]/80 mb-1.5">
                سفارش
              </span>
              <Dropdown
                placeholder="— انتخاب کنید —"
                value={relatedOrderId}
                onChange={setRelatedOrderId}
                options={[
                  { value: "", label: "— بدون انتخاب —" },
                  ...orders.map((o) => ({ value: o.id, label: o.label })),
                ]}
              />
            </div>
          )}
        </div>
      )}

      {/* Attachments */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
        <div className="font-extrabold text-[#0e1a3d] text-[14px] mb-3">
          فایل‌های ضمیمه <span className="text-[#0e1a3d]/45 font-normal text-[12px]">(اختیاری)</span>
        </div>
        <TicketAttachmentsField
          value={attachments}
          onChange={setAttachments}
          disabled={status === "sending"}
        />
      </div>

      {/* Body */}
      <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
        <Field label="متن پیام" required>
          <textarea
            name="body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (fieldErrors.body) {
                setFieldErrors((s) => ({ ...s, body: undefined }));
              }
            }}
            rows={8}
            maxLength={5000}
            placeholder="لطفاً مشکل یا درخواست خود را با جزئیات کافی توضیح دهید..."
            className={`w-full rounded-2xl bg-[#f4f7fc] border text-[14px] text-[#0e1a3d] p-4 leading-8 focus:outline-none focus:bg-white transition resize-none ${
              fieldErrors.body
                ? "border-rose-400 focus:border-rose-500"
                : "border-[#e3e9f4] focus:border-[#136cb5]"
            }`}
          />
          <div className="flex items-center justify-between gap-3 mt-1.5">
            <div className="text-[11.5px] text-rose-600 font-bold">
              {fieldErrors.body}
            </div>
            <div
              className="text-[10.5px] text-[#0e1a3d]/50 font-mono tabular-nums"
              dir="ltr"
            >
              {bodyLen} / 5000
            </div>
          </div>
        </Field>
      </div>

      {/* Error */}
      {status === "error" && error && (
        <div className="p-3.5 rounded-2xl text-[13px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-[11.5px] text-[#0e1a3d]/50 leading-6">
          پس از ثبت، پاسخ تیم پشتیبانی در همین صفحه نمایش داده می‌شود.
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          aria-disabled={!canSubmit}
          className={`inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-white font-extrabold text-[14px] transition active:scale-[0.98] cursor-pointer disabled:cursor-wait ${
            canSubmit ? "" : "opacity-70"
          }`}
          style={{
            background: "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
            boxShadow: "0 14px 30px -10px rgba(19,108,181,0.55)",
          }}
        >
          {status === "sending" ? "در حال ثبت..." : "ثبت تیکت"}
          {status !== "sending" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-bold text-[#0e1a3d]/80 mb-1.5">
        {label}
        {required && <span className="text-rose-500 mr-1">*</span>}
      </span>
      {children}
    </label>
  );
}

type DropOption = { value: string; label: string };

function Dropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: DropOption[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value && o.value !== "");
  const displayLabel = selected?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full h-12 rounded-2xl bg-[#f4f7fc] border text-[13.5px] px-4 flex items-center justify-between gap-2 transition cursor-pointer select-none ${
          open
            ? "border-[#136cb5] bg-white shadow-[0_10px_24px_-14px_rgba(19,108,181,0.45)]"
            : "border-[#e3e9f4] hover:border-[#bcd9f4] hover:bg-white"
        } ${selected ? "text-[#0e1a3d] font-bold" : "text-[#0e1a3d]/55"}`}
      >
        <span className="truncate text-right flex-1">{displayLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 text-[#1b3c8a] ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 bg-white rounded-2xl border border-[#e3e9f4] shadow-[0_22px_50px_-18px_rgba(14,26,61,0.28)] overflow-hidden max-h-[260px] overflow-y-auto"
          style={{ animation: "ticketDropIn 0.14s ease-out" }}
        >
          {options.map((o, i) => {
            const active = o.value === value;
            return (
              <button
                type="button"
                key={`${o.value}-${i}`}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-right px-4 py-3 text-[13.5px] flex items-center justify-between gap-3 border-t border-[#f1f4fa] first:border-t-0 transition cursor-pointer ${
                  active
                    ? "bg-[#eaf1fc] text-[#1b3c8a] font-extrabold"
                    : "text-[#0e1a3d] hover:bg-[#f7fafd]"
                }`}
              >
                <span className="truncate flex-1">{o.label}</span>
                {active && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1b3c8a"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
          <style>{`
            @keyframes ticketDropIn {
              from { opacity: 0; transform: translateY(-4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
