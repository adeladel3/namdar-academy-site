"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Field, Input, Select, Textarea, toast } from "@/components/admin/ui";
import type { CategoryRecord } from "@/lib/db";
import { isValidSlug, slugifyTitle } from "@/lib/slug";

const LEVELS = [
  { key: "beginner", label: "مقدماتی" },
  { key: "intermediate", label: "متوسط" },
  { key: "advanced", label: "پیشرفته" },
] as const;

export default function NewCourseWizard({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDesc: "",
    categoryId: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    price: 0,
    isFree: false,
    instructor: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors({ ...errors, [k]: "" });
  }

  // عنوان به آدرس فارسی تبدیل می‌شود (مثلاً «سمینار سقوط» → «سمینار-سقوط»).
  // فینگیلیش (transliteration) ساخته نمی‌شود — مرورگرهای مدرن آدرس فارسی
  // را در نوار آدرس و SEO به‌درستی نمایش می‌دهند.
  const autoSlug = slugifyTitle;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "عنوان الزامی است";
    if (!form.slug.trim()) e.slug = "آدرس الزامی است";
    else if (!isValidSlug(form.slug))
      e.slug = "آدرس فقط می‌تواند شامل حروف فارسی/انگلیسی، عدد و خط تیره باشد";
    if (!form.shortDesc.trim()) e.shortDesc = "توضیح کوتاه الزامی است";
    if (!form.instructor.trim()) e.instructor = "نام مدرس الزامی است";
    if (!form.isFree && form.price <= 0)
      e.price = "برای دوره غیررایگان قیمت الزامی است";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          shortDesc: form.shortDesc.trim(),
          categoryId: form.categoryId || undefined,
          level: form.level,
          price: form.isFree ? 0 : Number(form.price) || 0,
          isFree: form.isFree,
          instructor: form.instructor.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "خطا در ایجاد دوره", "err");
        setBusy(false);
        return;
      }
      toast("دوره ایجاد شد", "ok");
      router.push(`/admin/courses/${data.slug}`);
    } catch {
      toast("خطای شبکه", "err");
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="عنوان دوره" required error={errors.title}>
          <Input
            value={form.title}
            onChange={(e) => {
              update("title", e.target.value);
              if (!form.slug) update("slug", autoSlug(e.target.value));
            }}
            placeholder="مثلاً: دوره جامع ترید"
          />
        </Field>
        <Field
          label="slug (انگلیسی)"
          required
          error={errors.slug}
          hint="URL دوره در سایت: /courses/<slug> — فقط حروف انگلیسی کوچک، عدد و خط تیره"
        >
          <Input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="master-trading"
            dir="ltr"
            className="font-mono text-sm"
          />
        </Field>
      </div>

      <Field label="توضیح کوتاه" required error={errors.shortDesc} hint="حداکثر ۲ خط؛ در کارت دوره نمایش داده می‌شود.">
        <Textarea
          value={form.shortDesc}
          onChange={(e) => update("shortDesc", e.target.value)}
          rows={2}
          placeholder="این دوره برای چه کسانی است و چه یاد می‌دهد؟"
        />
      </Field>

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="دسته">
          <Select
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            <option value="">بدون دسته</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="سطح">
          <Select
            value={form.level}
            onChange={(e) =>
              update(
                "level",
                e.target.value as "beginner" | "intermediate" | "advanced"
              )
            }
          >
            {LEVELS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="مدرس" required error={errors.instructor}>
          <Input
            value={form.instructor}
            onChange={(e) => update("instructor", e.target.value)}
            placeholder="نام مدرس"
          />
        </Field>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f7fafd]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => update("isFree", e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">دوره رایگان است</span>
        </label>
        <div className="flex-1">
          {!form.isFree && (
            <Field label="قیمت (تومان)" required error={errors.price}>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
                dir="ltr"
                className="font-mono"
              />
            </Field>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eef2f7]">
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={busy}
        >
          انصراف
        </Button>
        <Button onClick={submit} disabled={busy}>
          {busy ? "در حال ذخیره..." : "ایجاد دوره"}
        </Button>
      </div>
    </Card>
  );
}
