"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Field,
  Input,
  Textarea,
  toast,
} from "@/components/admin/ui";
import { toEnglishDigits } from "@/lib/formatting";

export default function NewSeminarForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    shortDesc: "",
    price: "490000",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.slug.trim()) nextErrors.slug = "شناسه‌ی آدرس را وارد کنید";
    if (!form.title.trim()) nextErrors.title = "عنوان سمینار الزامی است";
    if (!form.shortDesc.trim()) nextErrors.shortDesc = "توضیح کوتاه را وارد کنید";
    const priceNum = Number(toEnglishDigits(form.price).replace(/[^\d]/g, ""));
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      nextErrors.price = "قیمت معتبر وارد کنید";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/seminars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          shortDesc: form.shortDesc.trim(),
          price: priceNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ایجاد سمینار");
      toast("سمینار با موفقیت ساخته شد", "ok");
      router.push(`/admin/seminars/${encodeURIComponent(form.slug.trim())}/edit`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطای ناشناخته";
      toast(msg, "err");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <Field
          label="شناسه‌ی آدرس (slug)"
          required
          hint="در URL استفاده می‌شود. می‌توانید فارسی بنویسید، مثل «سمینار-طلا-اصفهان»."
          error={errors.slug}
        >
          <Input
            dir="ltr"
            placeholder="seminar-gold-isfahan-1405"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
        </Field>

        <Field label="عنوان سمینار" required error={errors.title}>
          <Input
            placeholder="مثلاً: سمینار حضوری ترید طلا — اصفهان ۱۴۰۵"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </Field>

        <Field
          label="توضیح کوتاه"
          required
          hint="یک یا دو خط — در کارت‌های لیست و متاتگ‌ها نمایش داده می‌شود."
          error={errors.shortDesc}
        >
          <Textarea
            rows={3}
            value={form.shortDesc}
            onChange={(e) => update("shortDesc", e.target.value)}
          />
        </Field>

        <Field
          label="قیمت ثبت‌نام (تومان)"
          required
          hint="قیمت اولیه. می‌توانید بعداً تخفیف یا تغییر بدهید."
          error={errors.price}
        >
          <Input
            dir="ltr"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eef2f7]">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/seminars")}
            disabled={submitting}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "در حال ایجاد..." : "ایجاد سمینار"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
