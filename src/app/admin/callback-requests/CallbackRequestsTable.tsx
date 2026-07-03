"use client";

import { useMemo, useState } from "react";
import { formatDateTime, faDigits } from "@/lib/formatting";
import { Badge, Button, toast, useConfirm } from "@/components/admin/ui";
import type {
  CallbackRequest,
  CallbackRequestStatus,
} from "@/lib/db";

const STATUS_LABEL: Record<CallbackRequestStatus, string> = {
  new: "در انتظار تماس",
  contacted: "تماس گرفته شد",
  archived: "بایگانی",
};

const STATUS_CLASS: Record<CallbackRequestStatus, string> = {
  new: "bg-[#fff7e0] text-[#8a5f0e]",
  contacted: "bg-[#e6f7ec] text-[#0f6b35]",
  archived: "bg-[#f4f5f7] text-[#010514]/65",
};

const SOURCE_LABEL: Record<string, string> = {
  site: "سایت",
  "mon-coaching": "کوچینگ MON (لندینگ)",
  "mon-coaching-action-box": "MON — باکس تماس",
  "landing-mobile-cta": "لندینگ موبایل — CTA",
  "landing-mobile-mon-hero": "لندینگ موبایل — هیرو MON",
  "landing-desktop-mon-hero": "لندینگ دسکتاپ — هیرو MON",
  "dashboard-sales-lead": "پنل کاربری — فروش",
  "coaching-register-form": "صفحهٔ کوچینگ — فرم ثبت‌نام",
  "coaching-booking-glass": "صفحهٔ کوچینگ — فرم شیشه‌ای",
  "contact-form": "فرم تماس",
  "contact-page": "صفحهٔ تماس",
};

type Filter = "all" | CallbackRequestStatus;

export default function CallbackRequestsTable({
  initial,
  coursesBySlug = {},
}: {
  initial: CallbackRequest[];
  coursesBySlug?: Record<string, string>;
}) {
  const [rows, setRows] = useState<CallbackRequest[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, setPending] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { confirm, dialog } = useConfirm();

  const filtered = useMemo(() => {
    const q = query.trim();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (q) {
        const courseTitle = r.relatedCourseSlug
          ? coursesBySlug[r.relatedCourseSlug] ?? r.relatedCourseSlug
          : "";
        const hay = `${r.phone} ${r.name ?? ""} ${r.topic ?? ""} ${r.note ?? ""} ${courseTitle}`;
        if (!hay.toLowerCase().includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, filter, query, coursesBySlug]);

  async function setStatus(id: string, status: CallbackRequestStatus) {
    setPending(id);
    try {
      const res = await fetch(`/api/admin/callback-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { record: CallbackRequest };
      setRows((rs) => rs.map((r) => (r.id === id ? data.record : r)));
      toast("وضعیت به‌روزرسانی شد", "ok");
    } catch {
      toast("خطا در به‌روزرسانی", "err");
    } finally {
      setPending(null);
    }
  }

  async function removeRow(id: string, phone: string) {
    const ok = await confirm({
      title: "حذف درخواست",
      message: `درخواست تماس شماره ${phone} حذف شود؟ این عمل قابل بازگشت نیست.`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    setPending(id);
    try {
      const res = await fetch(`/api/admin/callback-requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setRows((rs) => rs.filter((r) => r.id !== id));
      toast("درخواست حذف شد", "ok");
    } catch {
      toast("خطا در حذف", "err");
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-[#eef2f7]">
        {(["all", "new", "contacted", "archived"] as const).map((k) => {
          const active = filter === k;
          const label =
            k === "all" ? "همه" : STATUS_LABEL[k as CallbackRequestStatus];
          const count =
            k === "all"
              ? rows.length
              : rows.filter((r) => r.status === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={
                "px-3 py-1.5 rounded-full text-xs font-bold transition " +
                (active
                  ? "bg-[#1b3c8a] text-white"
                  : "bg-[#f7fafd] text-[#010514]/65 hover:bg-[#eef4ff]")
              }
            >
              {label} <span className="opacity-70">({faDigits(count)})</span>
            </button>
          );
        })}
        <div className="flex-1" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جست‌وجو در شماره، نام یا یادداشت"
          className="px-4 py-2 rounded-full border border-[#e5eaf5] bg-white text-sm w-full sm:w-72 focus:outline-none focus:border-[#1b3c8a]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center text-[#010514]/55 text-sm">
          موردی مطابق فیلتر پیدا نشد.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7fafd] text-[#010514]/65">
              <tr>
                <th className="text-right p-3 font-medium">شماره تماس</th>
                <th className="text-right p-3 font-medium">نام</th>
                <th className="text-right p-3 font-medium">موضوع</th>
                <th className="text-right p-3 font-medium">دوره / سرویس</th>
                <th className="text-right p-3 font-medium">زمان تماس</th>
                <th className="text-right p-3 font-medium">منبع</th>
                <th className="text-right p-3 font-medium">وضعیت</th>
                <th className="text-right p-3 font-medium">ثبت</th>
                <th className="text-right p-3 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[#eef2f7] align-top hover:bg-[#fbfcff]"
                >
                  <td className="p-3">
                    <a
                      href={`tel:${r.phone}`}
                      className="font-mono font-bold text-[#1b3c8a] hover:underline"
                      dir="ltr"
                    >
                      {faDigits(r.phone)}
                    </a>
                  </td>
                  <td className="p-3 text-[#010514]">
                    {r.name || <span className="text-[#010514]/40">—</span>}
                  </td>
                  <td className="p-3 text-[#010514]/80">
                    {r.topic || <span className="text-[#010514]/40">—</span>}
                  </td>
                  <td className="p-3">
                    {r.relatedCourseSlug ? (
                      <a
                        href={`/admin/courses/${r.relatedCourseSlug}`}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#eaf1fc] text-[#1b3c8a] text-[11.5px] font-bold hover:bg-[#dbe7fb] transition"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
                          <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
                        </svg>
                        {coursesBySlug[r.relatedCourseSlug] ??
                          r.relatedCourseSlug}
                      </a>
                    ) : (
                      <span className="text-[#010514]/40">—</span>
                    )}
                  </td>
                  <td className="p-3 text-[#010514]/80">
                    {r.preferredTime || (
                      <span className="text-[#010514]/40">—</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-[#010514]/65">
                    {SOURCE_LABEL[r.source] ?? r.source}
                  </td>
                  <td className="p-3">
                    <Badge className={STATUS_CLASS[r.status]}>
                      {STATUS_LABEL[r.status]}
                    </Badge>
                    {r.note && (
                      <div className="mt-1.5 text-[11px] text-[#010514]/55 max-w-[220px] leading-5">
                        {r.note}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-xs text-[#010514]/55 whitespace-nowrap">
                    {formatDateTime(r.createdAt)}
                    {r.contactedAt && (
                      <div className="text-[10px] text-[#0f6b35] mt-0.5">
                        پاسخ: {formatDateTime(r.contactedAt)}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {r.status !== "contacted" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => setStatus(r.id, "contacted")}
                          disabled={pending === r.id}
                        >
                          تماس گرفته شد
                        </Button>
                      )}
                      {r.status !== "new" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setStatus(r.id, "new")}
                          disabled={pending === r.id}
                        >
                          بازگردانی
                        </Button>
                      )}
                      {r.status !== "archived" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(r.id, "archived")}
                          disabled={pending === r.id}
                        >
                          بایگانی
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeRow(r.id, r.phone)}
                        disabled={pending === r.id}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog}
    </div>
  );
}
