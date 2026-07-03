"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { TicketAttachment } from "@/lib/db";
import TicketAttachmentsField from "@/components/TicketAttachmentsField";

export function ReplyBox({
  ticketId,
  disabled,
}: {
  ticketId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const canSend =
    (text.trim().length >= 2 || attachments.length > 0) && status !== "sending";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text.trim(), attachments }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "ارسال پیام ناموفق");
        setStatus("error");
        return;
      }
      setText("");
      setAttachments([]);
      setStatus("idle");
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
      setStatus("error");
    }
  }

  if (disabled) {
    return (
      <div className="bg-[#f4f7fc] border border-[#e5eaf5] rounded-2xl p-5 text-center text-[13px] text-[#0e1a3d]/65">
        این تیکت بسته شده. برای موضوع جدید، تیکت جدیدی باز کنید.
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="bg-white border border-[#e5eaf5] rounded-2xl p-4 md:p-5">
      <label className="block font-extrabold text-[#0e1a3d] text-[14px] mb-2.5">
        پاسخ شما
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={5000}
        placeholder="متن پاسخ..."
        className="w-full rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[14px] text-[#0e1a3d] p-4 leading-8 focus:outline-none focus:border-[#136cb5] focus:bg-white transition resize-none"
      />

      <div className="mt-3">
        <TicketAttachmentsField
          value={attachments}
          onChange={setAttachments}
          disabled={status === "sending"}
          compact
        />
      </div>

      {status === "error" && error && (
        <div className="mt-2 p-2.5 rounded-xl text-[12px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <div className="text-[10.5px] text-[#0e1a3d]/50 font-mono tabular-nums" dir="ltr">
          {text.trim().length} / 5000
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-white font-extrabold text-[13.5px] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
            boxShadow: "0 12px 26px -10px rgba(19,108,181,0.55)",
          }}
        >
          {status === "sending" ? "در حال ارسال..." : "ارسال پاسخ"}
          {status !== "sending" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

export function CloseTicketButton({
  ticketId,
  label = "بستن تیکت",
}: {
  ticketId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleClose() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      setConfirmOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[12.5px] font-extrabold text-[#0e1a3d]/75 bg-[#f4f7fc] hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-60"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
        {loading ? "..." : label}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !loading && setConfirmOpen(false)}
        onConfirm={handleClose}
        loading={loading}
        title="بستن تیکت"
        description="آیا مطمئنید این تیکت را می‌بندید؟ پس از بستن، می‌توانید آن را دوباره باز کنید."
        confirmLabel="بله، ببند"
        cancelLabel="انصراف"
      />
    </>
  );
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[#06142f]/55 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
        aria-hidden
      />
      <div
        className="relative w-full max-w-[400px] rounded-[20px] bg-white p-6 shadow-[0_24px_60px_-12px_rgba(14,26,61,0.45)]"
        style={{ animation: "ticketConfirmIn 0.2s ease-out" }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[16px] font-extrabold text-[#0e1a3d]">
              {title}
            </h3>
            <p className="text-[13px] text-[#0e1a3d]/70 mt-1.5 leading-[1.9]">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-5 rounded-full text-[13px] font-extrabold text-[#0e1a3d]/70 bg-[#f4f7fc] hover:bg-[#eaeff8] transition disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 px-5 rounded-full text-[13px] font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-60"
          >
            {loading ? "در حال بستن..." : confirmLabel}
          </button>
        </div>

        <style jsx>{`
          @keyframes ticketConfirmIn {
            from { transform: translateY(8px) scale(0.98); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

export function ReopenTicketButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReopen() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleReopen}
      disabled={loading}
      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[12.5px] font-extrabold text-[#1b3c8a] bg-[#eaf1fc] hover:bg-[#dbe7fb] transition disabled:opacity-60"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15A9 9 0 1118.5 5.5L23 10" />
      </svg>
      {loading ? "..." : "باز کردن دوباره"}
    </button>
  );
}

export function RatingPanel({
  ticketId,
  initialRating,
}: {
  ticketId: string;
  initialRating?: number;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    initialRating ? "done" : "idle"
  );

  async function handleSubmit() {
    if (rating < 1 || status === "saving") return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, ratingComment: comment.trim() }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
        <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="font-extrabold text-emerald-800 text-[13.5px]">
          از بازخورد شما متشکریم
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#f5e1a1] rounded-2xl p-5">
      <div className="font-extrabold text-[#0e1a3d] text-[14px] mb-1">
        پشتیبانی چطور بود؟
      </div>
      <div className="text-[12px] text-[#0e1a3d]/60 mb-3 leading-6">
        بازخورد شما به بهبود تیم کمک می‌کند.
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            type="button"
            key={i}
            onClick={() => setRating(i)}
            aria-label={`امتیاز ${i}`}
            className="group"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={i <= rating ? "#f7cf5a" : "transparent"}
              stroke={i <= rating ? "#d4a62a" : "#cbd5e1"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition group-hover:scale-110"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
        <span
          className={`ms-2 text-[12.5px] font-extrabold tabular-nums transition ${
            rating > 0 ? "text-[#0e1a3d]/80" : "text-[#0e1a3d]/35"
          }`}
        >
          {rating > 0 ? `${rating} از ۵` : "بدون امتیاز"}
        </span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="نظر یا پیشنهادی دارید؟ (اختیاری)"
        className="w-full rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13px] text-[#0e1a3d] p-3 leading-7 focus:outline-none focus:border-[#136cb5] focus:bg-white transition resize-none"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating < 1 || status === "saving"}
        className="mt-3 w-full h-11 rounded-full text-[2d1c03] font-extrabold text-[13.5px] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #fde285, #f7cf5a, #d4a62a)",
          color: "#2d1c03",
          boxShadow: "0 12px 26px -10px rgba(247,207,90,0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        {status === "saving" ? "در حال ثبت..." : "ثبت امتیاز"}
      </button>

      {status === "error" && (
        <div className="mt-2 p-2 rounded-xl text-[11.5px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          خطا در ثبت امتیاز
        </div>
      )}
    </div>
  );
}
