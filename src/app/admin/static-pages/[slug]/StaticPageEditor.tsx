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
import type { StaticPageRecord } from "@/lib/db";
import { isValidSlug, slugifyTitle } from "@/lib/slug";

export default function StaticPageEditor({
  page,
}: {
  page?: StaticPageRecord;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [form, setForm] = useState({
    slug: page?.slug ?? "",
    title: page?.title ?? "",
    summary: page?.summary ?? "",
    body: page?.body ?? "",
    published: page?.published ?? false,
  });
  const [busy, setBusy] = useState(false);

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
      const isNew = !page;
      const url = isNew
        ? "/api/admin/static-pages"
        : `/api/admin/static-pages/${encodeURIComponent(page.slug)}`;
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
      toast(isNew ? "صفحه ایجاد شد" : "ذخیره شد", "ok");
      if (isNew) router.push(`/admin/static-pages/${form.slug}`);
      else router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!page) return;
    const ok = await confirm({
      title: "حذف صفحه",
      message: `صفحه «${page.title}» حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    await fetch(
      `/api/admin/static-pages/${encodeURIComponent(page.slug)}`,
      { method: "DELETE" }
    );
    toast("حذف شد", "ok");
    router.push("/admin/static-pages");
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
          <Field label="slug" required hint="URL: /p/<slug>">
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              dir="ltr"
              className="font-mono text-sm"
              disabled={!!page}
            />
          </Field>
        </div>

        <Field
          label="خلاصه"
          hint="۱ خط کوتاه — زیر عنوان صفحه نمایش داده می‌شود."
        >
          <Textarea
            rows={2}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </Field>

        <Field label="وضعیت انتشار">
          <Toggle
            checked={form.published}
            onChange={(v) => setForm({ ...form, published: v })}
            label="منتشر شده"
          />
        </Field>

        <Field label="محتوا">
          <RichTextEditor
            value={form.body}
            onChange={(html) => setForm({ ...form, body: html })}
          />
        </Field>

        <div className="flex items-center justify-between pt-4 border-t border-[#eef2f7]">
          {page ? (
            <Button variant="danger" onClick={remove} disabled={busy}>
              حذف
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/admin/static-pages")}
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
