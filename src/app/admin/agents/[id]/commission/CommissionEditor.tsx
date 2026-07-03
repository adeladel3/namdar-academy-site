"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { faDigits, toEnglishDigits } from "@/lib/formatting";
import { toast } from "@/components/admin/ui";

type TierRow = {
  /** Local input as English-digit string; parsed on submit. Letting the
   *  field hold the raw text means digit normalisation can happen on every
   *  keystroke without confusing IME / paste behaviour. */
  atLeastToman: string;
  percent: string;
};

const QUICK_PRESETS = [
  { label: "۱۰۰ میلیون", value: 100_000_000 },
  { label: "۲۰۰ میلیون", value: 200_000_000 },
  { label: "۵۰۰ میلیون", value: 500_000_000 },
  { label: "۱ میلیارد", value: 1_000_000_000 },
];

export default function CommissionEditor({
  agentId,
  initialTiers,
  initialPeriod,
}: {
  agentId: string;
  initialTiers: { atLeastToman: number; percent: number }[];
  initialPeriod: "month" | "all_time";
}) {
  const router = useRouter();
  const [rows, setRows] = useState<TierRow[]>(() =>
    initialTiers.length > 0
      ? initialTiers.map((t) => ({
          atLeastToman: String(t.atLeastToman),
          percent: String(t.percent),
        }))
      : [{ atLeastToman: "0", percent: "" }]
  );
  const [period, setPeriod] = useState<"month" | "all_time">(initialPeriod);
  const [saving, setSaving] = useState(false);

  /** Parsed + sorted view used for the preview and on save. Empty rows
   *  (no percent set) are filtered out so the user can leave half-typed
   *  rows in place while still seeing a meaningful preview. */
  const parsedTiers = useMemo(() => {
    const out = rows
      .map((r) => ({
        atLeastToman: parseInt(r.atLeastToman, 10),
        percent: parseFloat(r.percent),
      }))
      .filter(
        (t) =>
          Number.isFinite(t.atLeastToman) &&
          t.atLeastToman >= 0 &&
          Number.isFinite(t.percent) &&
          t.percent > 0
      );
    out.sort((a, b) => a.atLeastToman - b.atLeastToman);
    return out;
  }, [rows]);

  function updateRow(i: number, patch: Partial<TierRow>) {
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { atLeastToman: "", percent: "" }]);
  }

  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function save() {
    // Guard against the silent "saved nothing" trap: a row can have an amount
    // (often set via a quick-preset) while its percent is left blank — the
    // grey "۵" is only the placeholder, not a real value. Those rows are
    // filtered out of parsedTiers, so without this check we'd POST an empty
    // list, the server would clear the tiers, and the user would still see a
    // success toast. Block with a clear message instead.
    const incomplete = rows.filter((r) => {
      const pct = parseFloat(r.percent);
      const hasPercent = Number.isFinite(pct) && pct > 0;
      const started =
        r.percent.trim() !== "" ||
        (r.atLeastToman.trim() !== "" && r.atLeastToman.trim() !== "0");
      return started && !hasPercent;
    });
    if (incomplete.length > 0) {
      toast("برای هر پله، درصد کارمزد را وارد کنید (بزرگ‌تر از صفر).", "err");
      return;
    }
    if (parsedTiers.length === 0) {
      toast("حداقل یک پله با مبلغ و درصد معتبر اضافه کنید.", "err");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/commission`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers: parsedTiers, period }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast("پله‌های کارمزد ذخیره شد", "ok");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <fieldset className="border border-[#e5eaf5] rounded-2xl p-4">
        <legend className="text-xs font-bold text-[#010514]/70 px-2">
          دوره محاسبه فروش
        </legend>
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="period"
              value="month"
              checked={period === "month"}
              onChange={() => setPeriod("month")}
              className="accent-[#1b3c8a]"
            />
            <span>ماه جاری (متداول)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="period"
              value="all_time"
              checked={period === "all_time"}
              onChange={() => setPeriod("all_time")}
              className="accent-[#1b3c8a]"
            />
            <span>از ابتدا (مجموع کل دوران)</span>
          </label>
        </div>
      </fieldset>

      <div>
        <div className="hidden md:grid grid-cols-[2fr_1fr_44px] gap-3 px-3 mb-2 text-[11px] text-[#010514]/55 font-bold">
          <span>از مبلغ فروش (تومان) به بالا</span>
          <span>درصد کارمزد</span>
          <span></span>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <TierRowEditor
              key={i}
              row={r}
              onChange={(patch) => updateRow(i, patch)}
              onRemove={rows.length > 1 ? () => removeRow(i) : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 text-sm px-4 py-2 rounded-full border border-dashed border-[#1b3c8a] text-[#1b3c8a] hover:bg-[#eef4ff] transition font-bold"
        >
          + افزودن پله
        </button>
      </div>

      <TierPreview tiers={parsedTiers} />

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#eef2f7]">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? "در حال ذخیره..." : "ذخیره پله‌ها"}
        </button>
      </div>
    </div>
  );
}

function TierRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: TierRow;
  onChange: (patch: Partial<TierRow>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_44px] gap-3 items-start bg-white border border-[#e5eaf5] rounded-2xl p-3">
      <div>
        <label className="md:hidden block text-[11px] text-[#010514]/55 font-bold mb-1">
          از مبلغ فروش (تومان) به بالا
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={row.atLeastToman ? formatThousands(row.atLeastToman) : ""}
            placeholder="مثلاً ۱۰۰٬۰۰۰٬۰۰۰"
            onChange={(e) =>
              onChange({
                atLeastToman: toEnglishDigits(e.target.value).replace(/[^\d]/g, ""),
              })
            }
            className="w-full h-11 px-3 pl-16 rounded-xl border border-[#e5eaf5] bg-white font-mono text-sm text-left focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#010514]/50 font-bold pointer-events-none">
            تومان
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {QUICK_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange({ atLeastToman: String(p.value) })}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5f7fb] text-[#010514]/60 hover:bg-[#eef4ff] hover:text-[#1b3c8a] transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="md:hidden block text-[11px] text-[#010514]/55 font-bold mb-1">
          درصد کارمزد
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={row.percent}
            placeholder="مثلاً ۵"
            onChange={(e) =>
              onChange({
                percent: toEnglishDigits(e.target.value).replace(/[^\d.]/g, ""),
              })
            }
            className="w-full h-11 px-3 pl-8 rounded-xl border border-[#e5eaf5] bg-white font-mono text-sm text-left focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#010514]/50 font-bold pointer-events-none">
            ٪
          </span>
        </div>
      </div>

      <div className="flex md:items-center md:h-11 justify-end">
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="حذف این پله"
            className="w-10 h-10 rounded-full text-rose-600 hover:bg-rose-50 transition flex items-center justify-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Preview block — given the current (unsaved) tier configuration, show a
 * row per tier with its threshold and percent. Lets the admin sanity-check
 * the schedule before clicking save.
 */
function TierPreview({
  tiers,
}: {
  tiers: { atLeastToman: number; percent: number }[];
}) {
  if (tiers.length === 0) {
    return (
      <div className="rounded-2xl bg-[#fafbfd] border border-dashed border-[#cbd5e1] p-5 text-center text-sm text-[#010514]/55">
        هنوز پله‌ای اضافه نشده — حداقل یک پله اضافه کنید تا کارمزد محاسبه شود.
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-[#f8fafc] border border-[#e5eaf5] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e5eaf5] text-xs font-bold text-[#010514]/70 bg-white">
        پیش‌نمایش پله‌ها
      </div>
      <ul className="divide-y divide-[#eef2f7]">
        {tiers.map((t, i) => {
          const upper = tiers[i + 1]?.atLeastToman;
          return (
            <li key={i} className="px-4 py-3 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1b3c8a] text-white text-xs font-bold">
                {faDigits(String(i + 1))}
              </span>
              <span className="text-sm text-[#010514]/85 flex-1 min-w-0">
                از{" "}
                <span className="font-mono font-bold">
                  {faDigits(t.atLeastToman.toLocaleString("en-US"))}
                </span>{" "}
                تومان
                {upper !== undefined && (
                  <>
                    {" "}تا{" "}
                    <span className="font-mono font-bold">
                      {faDigits((upper - 1).toLocaleString("en-US"))}
                    </span>{" "}
                    تومان
                  </>
                )}{" "}
                به بالا
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {faDigits(String(t.percent))}٪
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatThousands(s: string): string {
  if (!s) return "";
  const n = parseInt(s, 10);
  if (!Number.isFinite(n)) return s;
  return n.toLocaleString("en-US");
}
