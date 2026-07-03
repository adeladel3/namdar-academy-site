"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Toggle,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import type { ArticleRecord } from "@/lib/db";
import { isValidSlug, slugifyTitle } from "@/lib/slug";

export default function ArticleEditor({
  article,
  categories,
}: {
  article?: ArticleRecord;
  categories: string[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [form, setForm] = useState({
    slug: article?.slug ?? "",
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    category: article?.category ?? (categories[0] ?? "آموزش"),
    coverImage: article?.coverImage ?? "",
    readMinutes: article?.readMinutes ?? 5,
    published: article?.published ?? false,
    // SEO overrides
    seoTitle: article?.seoTitle ?? "",
    metaDescription: article?.metaDescription ?? "",
    focusKeyword: article?.focusKeyword ?? "",
    tags: (article?.tags ?? []).join(", "),
    authorName: article?.authorName ?? "",
    ogImage: article?.ogImage ?? "",
    noindex: article?.noindex ?? false,
    canonicalUrl: article?.canonicalUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const autoSlug = slugifyTitle;

  async function save() {
    if (!form.title.trim()) {
      toast("عنوان الزامی است", "err");
      return;
    }
    if (!form.slug.trim() || !isValidSlug(form.slug)) {
      toast("آدرس معتبر وارد کنید (فارسی یا انگلیسی، عدد و خط تیره)", "err");
      return;
    }
    setBusy(true);
    try {
      const isNew = !article;
      const url = isNew
        ? "/api/admin/articles"
        : `/api/admin/articles/${encodeURIComponent(article.slug)}`;
      const payload = {
        ...form,
        // Normalize tags from the "tag, tag, tag" text input into an array,
        // dropping empty/duplicate entries so the DB stores a clean list.
        tags: form.tags
          .split(/[,،]/)
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) {
        toast(d.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast(isNew ? "مقاله ایجاد شد" : "ذخیره شد", "ok");
      if (isNew) router.push(`/admin/articles/${form.slug}`);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!article) return;
    const ok = await confirm({
      title: "حذف مقاله",
      message: `مقاله «${article.title}» حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/admin/articles/${encodeURIComponent(article.slug)}`, {
      method: "DELETE",
    });
    toast("حذف شد", "ok");
    router.push("/admin/articles");
  }

  return (
    <>
      {dialog}
      <Card className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="عنوان" required>
            <Input
              value={form.title}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({
                  ...f,
                  title: v,
                  slug: f.slug || autoSlug(v),
                }));
              }}
            />
          </Field>
          <Field label="slug" required hint="URL: /articles/<slug>">
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              dir="ltr"
              className="font-mono text-sm"
              disabled={!!article}
            />
          </Field>
        </div>

        <Field label="خلاصه" hint="۱ تا ۲ جمله — در کارت مقاله نمایش داده می‌شود.">
          <Textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </Field>

        <Field label="تصویر کاور">
          <MediaPicker
            kind="image"
            recommended={{
              width: 1200,
              height: 675,
              maxSizeKB: 600,
              formats: ["JPG", "PNG", "WebP"],
              description:
                "تصویر بالای مقاله در صفحه مقاله و لیست مقالات.",
            }}
            value={form.coverImage}
            onChange={(url) => setForm({ ...form, coverImage: url })}
          />
        </Field>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="دسته">
            <Input
              list="categories"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="مدت مطالعه (دقیقه)">
            <Input
              type="number"
              value={form.readMinutes}
              onChange={(e) =>
                setForm({ ...form, readMinutes: Number(e.target.value) })
              }
              dir="ltr"
              className="font-mono"
            />
          </Field>
          <Field label="وضعیت انتشار">
            <Toggle
              checked={form.published}
              onChange={(v) => setForm({ ...form, published: v })}
              label="منتشر شده"
            />
          </Field>
        </div>

        <Field label="محتوا">
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
          />
        </Field>

        {/* ═══════ SEO & اشتراک‌گذاری ═══════
            Collapsible so the basic form stays simple for casual uploads;
            power-users click to reveal per-article overrides. */}
        <div className="rounded-2xl border border-[#eef2f7] bg-[#fafbfd] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            className="w-full px-5 py-3 flex items-center justify-between text-right hover:bg-[#f4f7fb] transition"
            aria-expanded={showSeo}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block transition-transform duration-200 ${showSeo ? "rotate-90" : ""}`}
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#010514]/50">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </span>
              <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#1b3c8a] to-[#49bbbd]" />
              <span className="text-sm font-bold text-[#010514]">SEO و اشتراک‌گذاری</span>
              <span className="text-[11px] text-[#010514]/55">(اختیاری)</span>
            </div>
            <span className="text-[11px] text-[#010514]/55">
              {showSeo ? "جمع کردن" : "تنظیمات پیشرفته"}
            </span>
          </button>

          {showSeo && (
            <div className="p-5 space-y-4 border-t border-[#eef2f7]">
              <div className="text-[12px] leading-7 text-[#010514]/70 bg-[#eef4ff] rounded-lg p-3">
                این فیلدها اختیاری‌اند و اگر خالی بذاری، به‌صورت خودکار از عنوان/خلاصه/کاور استفاده می‌شه. فقط وقتی پرشون کن که می‌خوای گوگل چیز متفاوتی ببینه.
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="عنوان SEO"
                  hint={`${form.seoTitle.length}/60 — این عنوان در نتیجه گوگل دیده می‌شه. خالی = از «عنوان» استفاده می‌کنه.`}
                >
                  <Input
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    maxLength={80}
                    placeholder="مثلاً: آموزش ترید در بازار نزولی ۲۰۲۶ — راهنمای کامل"
                  />
                </Field>
                <Field
                  label="کلیدواژه هدف"
                  hint="کلمه یا عبارتی که می‌خوای مقاله برای اون در گوگل رنک بگیره."
                >
                  <Input
                    value={form.focusKeyword}
                    onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                    placeholder="مثلاً: ترید در بازار نزولی"
                  />
                </Field>
              </div>

              <Field
                label="توضیحات متا (Meta Description)"
                hint={`${form.metaDescription.length}/160 — متنی که زیر عنوان در نتیجه گوگل دیده می‌شه. خالی = از «خلاصه» استفاده می‌کنه.`}
              >
                <Textarea
                  rows={3}
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm({ ...form, metaDescription: e.target.value })
                  }
                  maxLength={200}
                />
              </Field>

              <Field
                label="تگ‌ها"
                hint="با ویرگول جدا کنید — برای مقالات مرتبط و Schema.org keywords استفاده می‌شه."
              >
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="ترید, تحلیل تکنیکال, بازار نزولی, مدیریت ریسک"
                />
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="نام نویسنده"
                  hint="در نتیجه گوگل و متای مقاله نمایش داده می‌شه."
                >
                  <Input
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    placeholder="مثلاً: امیرحسین نام‌آور"
                  />
                </Field>
                <Field
                  label="Canonical URL (اختیاری)"
                  hint="فقط وقتی پر کن که مقاله از جای دیگه‌ای هم منتشر شده و می‌خوای گوگل اون منبع اصلی رو در نظر بگیره."
                >
                  <Input
                    value={form.canonicalUrl}
                    onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                    dir="ltr"
                    className="font-mono text-xs"
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <Field
                label="تصویر اشتراک‌گذاری (OG Image)"
                hint="اگه خالی باشه، تصویر کاور استفاده می‌شه. ابعاد ایده‌آل: ۱۲۰۰×۶۳۰."
              >
                <MediaPicker
                  kind="image"
                  recommended={{
                    width: 1200,
                    height: 630,
                    maxSizeKB: 400,
                    formats: ["JPG", "PNG", "WebP"],
                    description:
                      "وقتی کسی لینک مقاله رو در تلگرام/توییتر/لینکدین به‌اشتراک می‌ذاره، این تصویر دیده می‌شه.",
                  }}
                  value={form.ogImage}
                  onChange={(url) => setForm({ ...form, ogImage: url })}
                />
              </Field>

              <Field
                label="عدم ایندکس در موتورهای جست‌وجو"
                hint="اگر فعال باشه، گوگل این مقاله را ایندکس نمی‌کند — برای پیش‌نویس‌های نیمه‌منتشر یا مقالات قدیمی که دیگر بازتابنده سایت نیستند."
              >
                <Toggle
                  checked={form.noindex}
                  onChange={(v) => setForm({ ...form, noindex: v })}
                  label="noindex فعال"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#eef2f7]">
          {article ? (
            <Button variant="danger" onClick={remove} disabled={busy}>
              حذف
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/articles")}
              disabled={busy}
            >
              بازگشت
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
