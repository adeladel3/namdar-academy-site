"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "technical", label: "فنی و تکنیکال" },
  { key: "billing", label: "مالی و پرداخت" },
  { key: "course", label: "دوره‌ها و محتوا" },
  { key: "account", label: "حساب کاربری" },
  { key: "other", label: "سایر موارد" },
];

export default function TicketScopeEditor({
  userId,
  initial,
  canEdit,
}: {
  userId: string;
  initial: {
    isSuperAdmin: boolean;
    isSeniorSupport: boolean;
    categories: string[];
  };
  canEdit: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function save(patch: Partial<typeof state>) {
    const next = { ...state, ...patch };
    setState(next);
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            isSuperAdmin: next.isSuperAdmin,
            isSeniorSupport: next.isSeniorSupport,
            ticketCategoryScope: next.categories,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "ذخیره ناموفق");
          setState(state); // roll back
          return;
        }
        router.refresh();
      } catch {
        setError("خطا در ارتباط با سرور");
        setState(state);
      }
    });
  }

  function toggleCategory(c: string) {
    const has = state.categories.includes(c);
    save({
      categories: has
        ? state.categories.filter((x) => x !== c)
        : [...state.categories, c],
    });
  }

  const unrestricted = state.isSuperAdmin || state.isSeniorSupport;

  return (
    <div className="space-y-4">
      {!canEdit && (
        <div className="rounded-2xl px-4 py-3 text-[12.5px] font-bold bg-amber-50 border border-amber-200 text-amber-900">
          فقط سوپر ادمین می‌تواند این تنظیمات را تغییر دهد.
        </div>
      )}

      <ToggleRow
        title="سوپر ادمین تیکت‌ها"
        description="همهٔ تیکت‌های سیستم برای این کاربر قابل مشاهده است و می‌تواند دامنهٔ دسترسی بقیه را تنظیم کند."
        checked={state.isSuperAdmin}
        disabled={!canEdit || pending}
        onChange={(v) => save({ isSuperAdmin: v })}
      />

      <ToggleRow
        title="پشتیبان ارشد"
        description="بدون اینکه سوپر ادمین باشد، همهٔ تیکت‌ها را می‌بیند. مناسب سرپرست تیم پشتیبانی."
        checked={state.isSeniorSupport}
        disabled={!canEdit || pending}
        onChange={(v) => save({ isSeniorSupport: v })}
      />

      <div
        className={`rounded-2xl p-4 transition border ${
          unrestricted
            ? "bg-[#f4f7fc] border-[#e3e9f4] opacity-60"
            : "bg-white border-[#e5eaf5]"
        }`}
      >
        <div className="font-extrabold text-[#010514] text-[13.5px] mb-1">
          دسته‌بندی‌های تحت مدیریت
        </div>
        <p className="text-[12px] text-[#010514]/60 leading-7 mb-3">
          اگر سوپر ادمین یا پشتیبان ارشد نباشد، فقط تیکت‌های این دسته‌ها را
          می‌بیند (به‌علاوهٔ تیکت‌هایی که به او ارجاع شده یا دورهٔ تحت
          مدیریت‌اش است).
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = state.categories.includes(c.key);
            return (
              <button
                type="button"
                key={c.key}
                onClick={() => canEdit && !pending && toggleCategory(c.key)}
                disabled={!canEdit || pending || unrestricted}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12.5px] font-bold transition cursor-pointer select-none disabled:cursor-not-allowed ${
                  active
                    ? "bg-[#1b3c8a] text-white border-[#1b3c8a]"
                    : "bg-[#f4f7fc] text-[#010514]/75 border-[#e3e9f4] hover:bg-white hover:border-[#bcd9f4]"
                }`}
              >
                {active && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl px-4 py-3 text-[12.5px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-4 rounded-2xl p-4 border bg-white border-[#e5eaf5] transition ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-[#fafbfe]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 accent-[#1b3c8a] shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-[#010514] text-[13.5px]">{title}</div>
        <p className="text-[12px] text-[#010514]/60 leading-7 mt-1">
          {description}
        </p>
      </div>
    </label>
  );
}
