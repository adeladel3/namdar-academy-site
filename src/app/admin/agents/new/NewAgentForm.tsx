"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, Textarea, toast } from "@/components/admin/ui";

export default function NewAgentForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    referralCode: "",
    phone: "",
    email: "",
    notes: "",
    isActive: true,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.referralCode.trim()) {
      toast("نام و کد رفرال الزامی است", "err");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(d.error ?? "خطا در ثبت", "err");
      return;
    }
    toast("کارشناس با موفقیت ثبت شد", "ok");
    router.push(`/admin/agents/${d.agent.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="نام و نام خانوادگی" required>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="مثلاً علی محمدی"
          />
        </Field>
        <Field
          label="کد رفرال اختصاصی"
          required
          hint="با حروف لاتین، عدد و خط تیره. حروف کوچک خودکار به بزرگ تبدیل می‌شوند."
        >
          <Input
            dir="ltr"
            className="font-mono"
            value={form.referralCode}
            onChange={(e) => update("referralCode", e.target.value.toUpperCase())}
            placeholder="مثل MONA10 یا SALE-ALI"
          />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="موبایل" hint="اختیاری">
          <Input
            dir="ltr"
            className="font-mono"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="09xxxxxxxxx"
          />
        </Field>
        <Field label="ایمیل" hint="اختیاری">
          <Input
            dir="ltr"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="agent@example.com"
          />
        </Field>
      </div>

      <Field label="یادداشت داخلی" hint="فقط ادمین می‌بیند">
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="نکات داخلی درباره این کارشناس…"
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
          کارشناس از همین حالا فعال باشد
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#eef2fb]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/agents")}
        >
          انصراف
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "در حال ذخیره…" : "ثبت کارشناس"}
        </Button>
      </div>
    </form>
  );
}
