"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TicketAttachment, TicketPriority, TicketStatus } from "@/lib/db";
import TicketAttachmentsField from "@/components/TicketAttachmentsField";

type Option<T extends string> = { value: T; label: string };

const STATUS_OPTIONS: Option<TicketStatus>[] = [
  { value: "open", label: "باز (در انتظار پاسخ)" },
  { value: "pending", label: "منتظر کاربر" },
  { value: "solved", label: "حل شده" },
  { value: "closed", label: "بسته" },
];

const PRIORITY_OPTIONS: Option<TicketPriority>[] = [
  { value: "low", label: "کم" },
  { value: "normal", label: "معمولی" },
  { value: "high", label: "زیاد" },
  { value: "urgent", label: "فوری" },
];

export function AdminReplyBox({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [internal, setInternal] = useState(false);
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
        body: JSON.stringify({ body: text.trim(), internal, attachments }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "ارسال ناموفق");
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

  return (
    <form
      onSubmit={handleSend}
      className={`rounded-2xl p-4 md:p-5 border transition ${
        internal
          ? "bg-amber-50/60 border-amber-200"
          : "bg-white border-[#e5eaf5]"
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="font-extrabold text-[#010514] text-[14px]">
          {internal ? "یادداشت داخلی (فقط تیم پشتیبانی)" : "پاسخ به کاربر"}
        </div>
        <label className="inline-flex items-center gap-2 text-[12.5px] font-bold text-[#010514]/70 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          یادداشت داخلی
        </label>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        maxLength={5000}
        placeholder={
          internal
            ? "یادداشت داخلی — برای کاربر قابل مشاهده نیست..."
            : "پاسخ خود را بنویسید..."
        }
        className={`w-full rounded-2xl border text-[14px] text-[#010514] p-4 leading-8 focus:outline-none resize-none transition ${
          internal
            ? "bg-white border-amber-200 focus:border-amber-400"
            : "bg-[#f4f7fc] border-[#e3e9f4] focus:border-[#136cb5] focus:bg-white"
        }`}
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
        <div className="text-[10.5px] text-[#010514]/50 font-mono tabular-nums" dir="ltr">
          {text.trim().length} / 5000
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className={`inline-flex items-center gap-2 h-11 px-6 rounded-full font-extrabold text-[13.5px] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
            internal
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "text-white"
          }`}
          style={
            internal
              ? undefined
              : {
                  background:
                    "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
                  boxShadow: "0 12px 26px -10px rgba(19,108,181,0.55)",
                }
          }
        >
          {status === "sending"
            ? "در حال ارسال..."
            : internal
            ? "ثبت یادداشت"
            : "ارسال پاسخ"}
        </button>
      </div>
    </form>
  );
}

export function StatusSelect({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<TicketStatus>(current);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: TicketStatus) {
    if (next === value || saving) return;
    const prev = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setValue(prev);
        return;
      }
      router.refresh();
    } catch {
      setValue(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value as TicketStatus)}
      disabled={saving}
      className="w-full h-11 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13px] text-[#010514] px-3 focus:outline-none focus:border-[#136cb5] focus:bg-white transition disabled:opacity-60"
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function PrioritySelect({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketPriority;
}) {
  const router = useRouter();
  const [value, setValue] = useState<TicketPriority>(current);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: TicketPriority) {
    if (next === value || saving) return;
    const prev = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ priority: next }),
      });
      if (!res.ok) {
        setValue(prev);
        return;
      }
      router.refresh();
    } catch {
      setValue(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value as TicketPriority)}
      disabled={saving}
      className="w-full h-11 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13px] text-[#010514] px-3 focus:outline-none focus:border-[#136cb5] focus:bg-white transition disabled:opacity-60"
    >
      {PRIORITY_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function AssigneeSelect({
  ticketId,
  current,
  staff,
}: {
  ticketId: string;
  current: string | undefined;
  staff: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(current ?? "");
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string) {
    if (next === value || saving) return;
    const prev = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assigneeId: next === "" ? null : next }),
      });
      if (!res.ok) {
        setValue(prev);
        return;
      }
      router.refresh();
    } catch {
      setValue(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="w-full h-11 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13px] text-[#010514] px-3 focus:outline-none focus:border-[#136cb5] focus:bg-white transition disabled:opacity-60"
    >
      <option value="">— تخصیص نداده شده —</option>
      {staff.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
