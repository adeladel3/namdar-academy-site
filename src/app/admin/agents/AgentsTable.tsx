"use client";

import Link from "@/components/SafeLink";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SalesAgentRecord } from "@/lib/db";
import { toast, useConfirm } from "@/components/admin/ui";
import { faDigits } from "@/lib/formatting";

type Row = SalesAgentRecord & {
  stats: {
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
    pendingOrders: number;
    lastSaleAt?: number;
  };
};

export default function AgentsTable({ agents }: { agents: Row[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = agents.filter((a) => {
    if (filter === "active" && !a.isActive) return false;
    if (filter === "inactive" && a.isActive) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.referralCode.toLowerCase().includes(q) ||
        (a.phone ?? "").includes(q)
      );
    }
    return true;
  });

  async function toggleActive(agent: Row) {
    setBusy(agent.id);
    const res = await fetch(`/api/admin/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !agent.isActive }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast(d.error ?? "خطا در ذخیره", "err");
      return;
    }
    toast(agent.isActive ? "غیرفعال شد" : "فعال شد", "ok");
    router.refresh();
  }

  async function remove(agent: Row) {
    const ok = await confirm({
      title: "حذف کارشناس",
      message: `«${agent.name}» حذف شود؟ تاریخچهٔ فروش‌های گذشته‌اش دست‌نخورده می‌ماند ولی این کارشناس از فهرست فعال حذف می‌شود.`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    setBusy(agent.id);
    const res = await fetch(`/api/admin/agents/${agent.id}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast(d.error ?? "حذف ناموفق", "err");
      return;
    }
    toast("کارشناس حذف شد", "ok");
    router.refresh();
  }

  return (
    <>
      {dialog}
      <div className="p-4 flex items-center gap-3 flex-wrap border-b border-[#eef2fb]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در نام / کد / موبایل…"
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 transition"
        />
        <div className="flex items-center gap-1 bg-[#f4f7fc] rounded-xl p-1 border border-[#e5eaf5]">
          {(["all", "active", "inactive"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition cursor-pointer ${
                filter === k
                  ? "bg-white text-[#1b3c8a] shadow-sm"
                  : "text-[#010514]/55 hover:text-[#010514]/85"
              }`}
            >
              {k === "all" ? "همه" : k === "active" ? "فعال" : "غیرفعال"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fafbfe] text-[#010514]/55 text-[12px] font-bold">
            <tr>
              <th className="text-right p-3">نام</th>
              <th className="text-right p-3">کد رفرال</th>
              <th className="text-right p-3">موبایل</th>
              <th className="text-right p-3">فروش موفق</th>
              <th className="text-right p-3">گردش</th>
              <th className="text-right p-3">کمیسیون</th>
              <th className="text-right p-3">وضعیت</th>
              <th className="text-right p-3">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="border-t border-[#eef2fb] hover:bg-[#fafbfe] transition"
              >
                <td className="p-3">
                  <Link
                    href={`/admin/agents/${a.id}`}
                    className="font-bold text-[#0e1a3d] hover:text-[#1b3c8a]"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="p-3 font-mono text-[12.5px] text-[#1b3c8a] font-bold" dir="ltr">
                  {a.referralCode}
                </td>
                <td className="p-3 text-[#010514]/70 font-mono" dir="ltr">
                  {a.phone ?? "—"}
                </td>
                <td className="p-3 font-mono text-[#0e1a3d]">
                  {faDigits(a.stats.totalSales.toString())}
                </td>
                <td className="p-3 font-mono text-[12px] text-[#010514]/70">
                  {faDigits(a.stats.totalRevenue.toLocaleString("en-US"))}
                </td>
                <td className="p-3 font-mono text-[12px] text-emerald-700 font-bold">
                  {faDigits(a.stats.totalCommission.toLocaleString("en-US"))}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                      a.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        a.isActive ? "bg-emerald-500" : "bg-neutral-400"
                      }`}
                    />
                    {a.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/agents/${a.id}`}
                      title="جزئیات / ویرایش"
                      className="p-1.5 rounded-lg hover:bg-[#eef4ff] text-[#1b3c8a] transition"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleActive(a)}
                      disabled={busy === a.id}
                      title={a.isActive ? "غیرفعال کن" : "فعال کن"}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-700 transition cursor-pointer disabled:opacity-50"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(a)}
                      disabled={busy === a.id}
                      title="حذف"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition cursor-pointer disabled:opacity-50"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m5 0V4a2 2 0 012-2h0a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-10 text-center text-[#010514]/55 text-sm"
                >
                  هیچ کارشناسی ثبت نشده. روی «کارشناس جدید» کلیک کنید.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
