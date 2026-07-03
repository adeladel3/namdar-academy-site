"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SalesAgentRecord } from "@/lib/db";
import { Button, Field, Input, Textarea, toast } from "@/components/admin/ui";

export default function AgentEditForm({ agent }: { agent: SalesAgentRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: agent.name,
    referralCode: agent.referralCode,
    phone: agent.phone ?? "",
    email: agent.email ?? "",
    notes: agent.notes ?? "",
    isActive: agent.isActive,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/admin/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(d.error ?? "خطا در ذخیره", "err");
      return;
    }
    toast("تغییرات ذخیره شد", "ok");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="نام و نام خانوادگی" required>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="کد رفرال" required>
          <Input
            dir="ltr"
            className="font-mono"
            value={form.referralCode}
            onChange={(e) =>
              update("referralCode", e.target.value.toUpperCase())
            }
          />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="موبایل">
          <Input
            dir="ltr"
            className="font-mono"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="ایمیل">
          <Input
            dir="ltr"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
      </div>

      <Field label="یادداشت داخلی">
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="w-5 h-5 accent-[#1b3c8a]"
        />
        <span className="text-sm font-bold text-[#010514]">
          کارشناس فعال است
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#eef2fb]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.refresh()}
        >
          انصراف
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
