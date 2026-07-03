"use client";

import Link from "@/components/SafeLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Donut } from "@/components/admin/Charts";
import { toast } from "@/components/admin/ui";
import {
  faDigits,
  formatPhone,
  formatRelative,
  percent,
} from "@/lib/formatting";

export type StudentRow = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  enrolledAt: number;
  source: "purchase" | "grant" | "free";
  completedLessons: number;
  totalLessons: number;
  lastActivityAt: number | null;
  /** Unix ms when access expires. null = lifetime. */
  expiresAt: number | null;
};

const SOURCE_LABEL: Record<StudentRow["source"], string> = {
  purchase: "خرید",
  grant: "اعطا",
  free: "رایگان",
};

export default function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const columns: Column<StudentRow>[] = [
    {
      key: "name",
      header: "کاربر",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <Link
          href={`/admin/users/${r.userId}`}
          className="hover:text-[#1b3c8a] transition"
        >
          <div className="font-bold text-[#010514]">{r.name}</div>
          <div className="text-[11px] text-[#010514]/55 font-mono" dir="ltr">
            {formatPhone(r.phone)}
          </div>
        </Link>
      ),
    },
    {
      key: "progress",
      header: "پیشرفت",
      sortable: true,
      sortValue: (r) =>
        r.totalLessons ? r.completedLessons / r.totalLessons : 0,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Donut
            value={r.completedLessons}
            max={Math.max(1, r.totalLessons)}
            size={52}
            strokeWidth={7}
          />
          <div className="text-xs text-[#010514]/65">
            {faDigits(r.completedLessons)} / {faDigits(r.totalLessons)} درس
            <div className="text-[10px]">
              ({faDigits(percent(r.completedLessons, r.totalLessons))}٪)
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "روش ثبت‌نام",
      sortable: true,
      sortValue: (r) => r.source,
      cell: (r) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold">
          {SOURCE_LABEL[r.source]}
        </span>
      ),
    },
    {
      key: "enrolledAt",
      header: "تاریخ ثبت‌نام",
      sortable: true,
      sortValue: (r) => r.enrolledAt,
      cell: (r) => (
        <span className="text-xs text-[#010514]/55">
          {formatRelative(r.enrolledAt)}
        </span>
      ),
    },
    {
      key: "lastActivity",
      header: "آخرین فعالیت",
      sortable: true,
      sortValue: (r) => r.lastActivityAt ?? 0,
      cell: (r) => (
        <span className="text-xs text-[#010514]/55">
          {r.lastActivityAt ? formatRelative(r.lastActivityAt) : "—"}
        </span>
      ),
    },
    {
      key: "expires",
      header: "انقضای دسترسی",
      sortable: true,
      sortValue: (r) => r.expiresAt ?? Number.MAX_SAFE_INTEGER,
      cell: (r) => {
        if (!r.expiresAt) {
          return (
            <span className="text-xs text-emerald-700 font-bold">نامحدود</span>
          );
        }
        const now = Date.now();
        const expired = r.expiresAt < now;
        const daysLeft = Math.ceil(
          (r.expiresAt - now) / (24 * 60 * 60 * 1000),
        );
        return (
          <div className="text-xs">
            <div
              className={`font-bold ${
                expired
                  ? "text-rose-600"
                  : daysLeft < 14
                  ? "text-amber-700"
                  : "text-[#010514]/70"
              }`}
            >
              {expired
                ? "منقضی"
                : `${faDigits(daysLeft.toString())} روز مانده`}
            </div>
            <div className="text-[10px] text-[#010514]/45 font-mono" dir="ltr">
              {new Date(r.expiresAt).toLocaleDateString("fa-IR")}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      cell: (r) => <EnrollmentExpiryButton row={r} />,
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      initialSort={{ key: "enrolledAt", dir: "desc" }}
      searchFn={(r, q) =>
        r.name.toLowerCase().includes(q) || r.phone.includes(q)
      }
    />
  );
}

/** Inline button + dialog for editing enrollment expiry. Lives in the same
 *  file so the cell stays self-contained; promote to its own file if it
 *  picks up more responsibilities. */
function EnrollmentExpiryButton({ row }: { row: StudentRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState("");

  async function save(newExpiresAt: number | null) {
    setBusy(true);
    const res = await fetch(`/api/admin/enrollments/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expiresAt: newExpiresAt }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast(d.error ?? "خطا در ذخیره", "err");
      return;
    }
    toast("بروزرسانی شد", "ok");
    setOpen(false);
    router.refresh();
  }

  async function extendByDays() {
    const n = Number(days);
    if (!Number.isFinite(n) || n <= 0) {
      toast("عدد معتبر وارد کنید", "err");
      return;
    }
    const base = row.expiresAt && row.expiresAt > Date.now()
      ? row.expiresAt
      : Date.now();
    await save(base + n * 24 * 60 * 60 * 1000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDays("");
        }}
        className="text-[11px] px-2.5 py-1 rounded-lg bg-[#eef4ff] text-[#1b3c8a] font-bold hover:bg-[#dfe9ff] transition"
      >
        تغییر انقضا
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !busy && setOpen(false)}
          dir="rtl"
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-extrabold text-[#0e1a3d] mb-1">
              مدیریت انقضای دسترسی
            </h3>
            <p className="text-xs text-[#010514]/60 mb-4 leading-7">
              {row.name} — وضعیت کنونی:{" "}
              {row.expiresAt
                ? new Date(row.expiresAt).toLocaleDateString("fa-IR")
                : "نامحدود"}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[12.5px] font-bold text-[#0e1a3d] block mb-1.5">
                  تمدید (روز اضافه)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="مثلاً 30"
                    dir="ltr"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={extendByDays}
                    className="px-4 py-2 rounded-xl bg-[#1b3c8a] text-white text-sm font-extrabold hover:bg-[#254aa0] disabled:opacity-50"
                  >
                    تمدید
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-[#eef2fb]">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save(null)}
                  className="flex-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[12.5px] font-extrabold border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                >
                  دسترسی نامحدود
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save(Date.now())}
                  className="flex-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-[12.5px] font-extrabold border border-rose-200 hover:bg-rose-100 disabled:opacity-50"
                >
                  منقضی کن
                </button>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="w-full mt-1 text-[12px] text-[#010514]/55 hover:text-[#010514]/85"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
