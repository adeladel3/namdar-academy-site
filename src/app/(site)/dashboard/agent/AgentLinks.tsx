"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReferralLinkRecord } from "@/lib/db";
import { faDigits } from "@/lib/formatting";

export default function AgentLinks({
  links,
  origin,
}: {
  links: ReferralLinkRecord[];
  /** Full origin (https://namdaracademy.com) — passed from server so the
   *  shareable URL is correct even before JS hydrates. */
  origin: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    landingPath: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) {
      setError("عنوان لینک لازم است");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/agent/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(d.error ?? "خطا در ساخت لینک");
      return;
    }
    setForm({
      label: "",
      landingPath: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
    });
    setCreating(false);
    router.refresh();
  }

  async function toggleActive(link: ReferralLinkRecord) {
    const res = await fetch(`/api/agent/links/${link.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });
    if (res.ok) router.refresh();
  }

  async function remove(link: ReferralLinkRecord) {
    if (!confirm(`لینک «${link.label}» حذف شود؟ تاریخچهٔ آمار از بین می‌رود.`))
      return;
    const res = await fetch(`/api/agent/links/${link.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-extrabold text-[#0e1a3d] text-[15px]">
            لینک‌های ردیابی
          </h2>
          <p className="text-[12px] text-[#0e1a3d]/55 mt-0.5">
            برای هر کانال (تلگرام، اینستاگرام، ...) یک لینک جدا بساز و ببین کدام
            بیشتر می‌فروشد.
          </p>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="px-4 py-2 rounded-xl bg-[#1b3c8a] hover:bg-[#254aa0] text-white text-[13px] font-extrabold transition cursor-pointer active:scale-[0.98]"
          >
            + لینک جدید
          </button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={submit}
          className="bg-white rounded-3xl border border-[#e5eaf5] p-5 space-y-4"
        >
          <h3 className="font-extrabold text-[#0e1a3d]">ساخت لینک جدید</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="عنوان (اجباری)" hint="مثل: تلگرام، اینستاگرام">
              <input
                value={form.label}
                onChange={(e) => update("label", e.target.value)}
                placeholder="مثلاً تلگرام"
                className="w-full px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10"
              />
            </Field>
            <Field
              label="مسیر مقصد"
              hint="پیش‌فرض: / (صفحه‌ی اصلی). می‌توانی /coaching یا /courses/mon بدهی."
            >
              <input
                dir="ltr"
                value={form.landingPath}
                onChange={(e) => update("landingPath", e.target.value)}
                placeholder="/coaching"
                className="w-full px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </Field>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label="utm_source" hint="مثل: telegram">
              <input
                dir="ltr"
                value={form.utmSource}
                onChange={(e) => update("utmSource", e.target.value)}
                placeholder="telegram"
                className="w-full px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </Field>
            <Field label="utm_medium" hint="مثل: group, story, dm">
              <input
                dir="ltr"
                value={form.utmMedium}
                onChange={(e) => update("utmMedium", e.target.value)}
                placeholder="group"
                className="w-full px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </Field>
            <Field label="utm_campaign" hint="مثل: nowrooz1405">
              <input
                dir="ltr"
                value={form.utmCampaign}
                onChange={(e) => update("utmCampaign", e.target.value)}
                placeholder="nowrooz1405"
                className="w-full px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </Field>
          </div>
          {error && (
            <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setError("");
              }}
              className="px-4 py-2 rounded-xl border border-[#e5eaf5] text-[#0e1a3d]/65 text-[13px] font-bold hover:bg-[#f7fafd]"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-xl bg-[#1b3c8a] hover:bg-[#254aa0] text-white text-[13px] font-extrabold disabled:opacity-50 cursor-pointer"
            >
              {busy ? "در حال ذخیره…" : "ذخیره لینک"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {links.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#e5eaf5] p-10 text-center text-[#0e1a3d]/55 text-sm">
            هنوز لینکی نساخته‌ای. روی «لینک جدید» کلیک کن.
          </div>
        )}
        {links.map((l) => {
          const url = `${origin}/r/${l.id}`;
          const conversion =
            l.clicks > 0
              ? Math.round((l.paidOrders * 1000) / l.clicks) / 10
              : 0;
          return (
            <div
              key={l.id}
              className={`bg-white rounded-3xl border p-5 transition ${
                l.isActive
                  ? "border-[#e5eaf5]"
                  : "border-neutral-200 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-extrabold text-[#0e1a3d] text-[14px]">
                      {l.label}
                    </h3>
                    {!l.isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-bold border border-neutral-200">
                        غیرفعال
                      </span>
                    )}
                    {(l.utmSource || l.utmMedium || l.utmCampaign) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold border border-[#dfe9ff]">
                        UTM
                      </span>
                    )}
                  </div>
                  {l.landingPath && (
                    <div className="text-[11px] text-[#0e1a3d]/55 font-mono" dir="ltr">
                      → {l.landingPath}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(l)}
                    title={l.isActive ? "غیرفعال کن" : "فعال کن"}
                    className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(l)}
                    title="حذف"
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-stretch gap-2 mb-4">
                <div
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#f7fafd] border border-[#e5eaf5] text-[12.5px] font-mono text-[#0e1a3d]/85 overflow-hidden text-ellipsis whitespace-nowrap"
                  dir="ltr"
                >
                  {url}
                </div>
                <button
                  type="button"
                  onClick={() => copy(url, l.id)}
                  className="px-4 py-2 rounded-xl bg-[#1b3c8a] hover:bg-[#254aa0] text-white text-[12px] font-extrabold transition cursor-pointer active:scale-[0.98]"
                >
                  {copied === l.id ? "کپی شد ✓" : "کپی"}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Stat label="کلیک" value={faDigits(l.clicks.toString())} />
                <Stat label="ثبت‌نام" value={faDigits(l.signups.toString())} />
                <Stat label="خرید" value={faDigits(l.paidOrders.toString())} />
                <Stat
                  label="تبدیل"
                  value={faDigits(conversion.toString()) + "٪"}
                  hint="درصد خرید از کلیک"
                />
              </div>

              {(l.utmSource || l.utmMedium || l.utmCampaign) && (
                <div className="mt-3 pt-3 border-t border-[#eef2fb] text-[10.5px] text-[#0e1a3d]/55 flex flex-wrap gap-3" dir="ltr">
                  {l.utmSource && <span>source: <b className="text-[#1b3c8a]">{l.utmSource}</b></span>}
                  {l.utmMedium && <span>medium: <b className="text-[#1b3c8a]">{l.utmMedium}</b></span>}
                  {l.utmCampaign && <span>campaign: <b className="text-[#1b3c8a]">{l.utmCampaign}</b></span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold text-[#0e1a3d] block mb-1.5">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[10.5px] text-[#0e1a3d]/50 block mt-1">
          {hint}
        </span>
      )}
    </label>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      title={hint}
      className="bg-[#f7fafd] rounded-xl px-3 py-2 border border-[#e5eaf5]"
    >
      <div className="text-[10px] text-[#0e1a3d]/55 font-bold mb-0.5">
        {label}
      </div>
      <div className="text-[14px] font-extrabold text-[#0e1a3d] font-mono">
        {value}
      </div>
    </div>
  );
}
