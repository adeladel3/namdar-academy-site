"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReferralLinkRecord } from "@/lib/db";
import { faDigits } from "@/lib/formatting";
import { toast, useConfirm } from "@/components/admin/ui";

/** A selectable destination for a generated link. `value` is the landingPath
 *  that gets stored on the link ("" = site root / homepage). */
export type LinkDestination = { value: string; label: string; group: string };

const CUSTOM = "__custom__";

export default function AgentLinksManager({
  agentId,
  links,
  origin,
  destinations,
}: {
  agentId: string;
  links: ReferralLinkRecord[];
  /** Proxy-aware origin (https://namdaracademy.com) passed from the server so
   *  the shareable short URL is correct before hydration. */
  origin: string;
  destinations: LinkDestination[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    label: "",
    destination: "",
    customPath: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  // Group destinations for the <optgroup> structure of the dropdown.
  const groups = destinations.reduce<Record<string, LinkDestination[]>>(
    (acc, d) => {
      (acc[d.group] ??= []).push(d);
      return acc;
    },
    {},
  );

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetForm() {
    setForm({
      label: "",
      destination: "",
      customPath: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
    });
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast("کپی ناموفق", "err");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) {
      setError("عنوان لینک لازم است");
      return;
    }
    const landingPath =
      form.destination === CUSTOM ? form.customPath.trim() : form.destination;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/agents/${agentId}/links`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: form.label,
        landingPath,
        utmSource: form.utmSource,
        utmMedium: form.utmMedium,
        utmCampaign: form.utmCampaign,
      }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(d.error ?? "خطا در ساخت لینک");
      return;
    }
    toast("لینک ساخته شد", "ok");
    resetForm();
    setCreating(false);
    router.refresh();
  }

  async function toggleActive(link: ReferralLinkRecord) {
    const res = await fetch(`/api/admin/agents/${agentId}/links/${link.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });
    if (res.ok) {
      toast(link.isActive ? "غیرفعال شد" : "فعال شد", "ok");
      router.refresh();
    } else {
      toast("خطا در ذخیره", "err");
    }
  }

  async function remove(link: ReferralLinkRecord) {
    const ok = await confirm({
      title: "حذف لینک",
      message: `لینک «${link.label}» حذف شود؟ آمار کلیک و خرید این لینک از بین می‌رود (سفارش‌های ثبت‌شده دست‌نخورده می‌مانند).`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/agents/${agentId}/links/${link.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("لینک حذف شد", "ok");
      router.refresh();
    } else {
      toast("حذف ناموفق", "err");
    }
  }

  return (
    <div className="space-y-4 p-5">
      {dialog}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12px] text-[#010514]/55">
          هر لینک یک نشانی کوتاه به شکل{" "}
          <span className="font-mono" dir="ltr">
            {origin.replace(/^https?:\/\//, "")}/r/…
          </span>{" "}
          است که کلیک، ثبت‌نام و خرید را جدا می‌شمارد و به صفحه‌ی مقصد انتخابی
          می‌رود.
        </p>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="px-4 py-2 rounded-xl bg-[#1b3c8a] hover:bg-[#254aa0] text-white text-[13px] font-extrabold transition cursor-pointer active:scale-[0.98] shrink-0"
          >
            + لینک جدید
          </button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={submit}
          className="bg-[#fafbfe] rounded-2xl border border-[#e5eaf5] p-5 space-y-4"
        >
          <h3 className="font-extrabold text-[#0e1a3d] text-[14px]">
            ساخت لینک اختصاصی
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <FormField label="عنوان (اجباری)" hint="مثل: تلگرام، اینستاگرام">
              <input
                value={form.label}
                onChange={(e) => update("label", e.target.value)}
                placeholder="مثلاً تلگرام"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10"
              />
            </FormField>
            <FormField
              label="صفحه‌ی مقصد"
              hint="بازدیدکننده بعد از کلیک به این صفحه می‌رود."
            >
              <select
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 cursor-pointer"
              >
                {Object.entries(groups).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((d) => (
                      <option key={d.value || "root"} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value={CUSTOM}>مسیر دلخواه…</option>
              </select>
            </FormField>
          </div>

          {form.destination === CUSTOM && (
            <FormField
              label="مسیر دلخواه"
              hint="با / شروع شود. مثل: /coaching یا /seminars/mon"
            >
              <input
                dir="ltr"
                value={form.customPath}
                onChange={(e) => update("customPath", e.target.value)}
                placeholder="/coaching"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </FormField>
          )}

          <div className="grid md:grid-cols-3 gap-3">
            <FormField label="utm_source" hint="اختیاری — مثل: telegram">
              <input
                dir="ltr"
                value={form.utmSource}
                onChange={(e) => update("utmSource", e.target.value)}
                placeholder="telegram"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </FormField>
            <FormField label="utm_medium" hint="اختیاری — مثل: group, story">
              <input
                dir="ltr"
                value={form.utmMedium}
                onChange={(e) => update("utmMedium", e.target.value)}
                placeholder="group"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </FormField>
            <FormField label="utm_campaign" hint="اختیاری — مثل: nowrooz1405">
              <input
                dir="ltr"
                value={form.utmCampaign}
                onChange={(e) => update("utmCampaign", e.target.value)}
                placeholder="nowrooz1405"
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#e5eaf5] text-sm outline-none focus:border-[#1b3c8a]/45 focus:ring-2 focus:ring-[#1b3c8a]/10 font-mono"
              />
            </FormField>
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
                resetForm();
              }}
              className="px-4 py-2 rounded-xl border border-[#e5eaf5] text-[#0e1a3d]/65 text-[13px] font-bold hover:bg-white cursor-pointer"
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
          <div className="rounded-2xl border border-dashed border-[#e5eaf5] p-8 text-center text-[#010514]/55 text-sm">
            هنوز لینکی برای این کارشناس ساخته نشده. روی «لینک جدید» کلیک کنید.
          </div>
        )}
        {links.map((l) => {
          const url = `${origin}/r/${l.id}`;
          const conversion =
            l.clicks > 0 ? Math.round((l.paidOrders * 1000) / l.clicks) / 10 : 0;
          return (
            <div
              key={l.id}
              className={`rounded-2xl border p-4 transition ${
                l.isActive
                  ? "border-[#e5eaf5] bg-white"
                  : "border-neutral-200 bg-neutral-50 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="min-w-0">
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
                  <div
                    className="text-[11px] text-[#010514]/55 font-mono"
                    dir="ltr"
                  >
                    → {l.landingPath || "/"}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
                  title={url}
                >
                  {url}
                </div>
                <button
                  type="button"
                  onClick={() => copy(url, l.id)}
                  className="px-4 py-2 rounded-xl bg-[#1b3c8a] hover:bg-[#254aa0] text-white text-[12px] font-extrabold transition cursor-pointer active:scale-[0.98] shrink-0"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormField({
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
      <div className="text-[10px] text-[#010514]/55 font-bold mb-0.5">
        {label}
      </div>
      <div className="text-[14px] font-extrabold text-[#0e1a3d] font-mono">
        {value}
      </div>
    </div>
  );
}
