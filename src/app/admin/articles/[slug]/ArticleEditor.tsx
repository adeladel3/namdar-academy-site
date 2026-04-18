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
  });
  const [busy, setBusy] = useState(false);

  function autoSlug(title: string) {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/gi, "")
      .replace(/\s+/g, "-");
  }

  async function save() {
    if (!form.title.trim()) {
      toast("عنوان الزامی است", "err");
      return;
    }
    if (!form.slug.trim() || !/^[a-z0-9-]+$/i.test(form.slug)) {
      toast("slug معتبر وارد کنید (حروف انگلیسی)", "err");
      return;
    }
    setBusy(true);
    try {
      const isNew = !article;
      const url = isNew
        ? "/api/admin/articles"
        : `/api/admin/articles/${encodeURIComponent(article.slug)}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
