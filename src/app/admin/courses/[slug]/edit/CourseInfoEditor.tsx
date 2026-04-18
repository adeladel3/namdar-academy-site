"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import TagPicker from "@/components/admin/TagPicker";
import MediaPicker from "@/components/admin/MediaPicker";
import type { CategoryRecord, CourseRecord, TagRecord } from "@/lib/db";

export default function CourseInfoEditor({
  course,
  categories,
  tags,
}: {
  course: CourseRecord;
  categories: CategoryRecord[];
  tags: TagRecord[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: course.title,
    shortDesc: course.shortDesc,
    longDesc: course.longDesc,
    previewImage: course.previewImage,
    previewVideoUrl: course.previewVideoUrl ?? "",
    categoryId: course.categoryId ?? "",
    tagIds: course.tagIds,
    level: course.level,
    instructor: course.instructor,
    badge: course.badge ?? "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          shortDesc: form.shortDesc,
          longDesc: form.longDesc,
          previewImage: form.previewImage,
          previewVideoUrl: form.previewVideoUrl || undefined,
          categoryId: form.categoryId || null,
          tagIds: form.tagIds,
          level: form.level,
          instructor: form.instructor,
          badge: form.badge || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error ?? "خطا در ذخیره", "err");
        return;
      }
      toast("تغییرات ذخیره شد", "ok");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirm({
      title: "حذف دوره",
      message: `آیا از حذف دوره "${course.title}" مطمئن هستید؟ این عمل همه فصل‌ها، درس‌ها و ثبت‌نام‌ها را پاک می‌کند و قابل بازگشت نیست.`,
      confirmText: "حذف کامل",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    await fetch(`/api/admin/courses/${course.slug}`, { method: "DELETE" });
    toast("دوره حذف شد", "ok");
    router.push("/admin/courses");
  }

  return (
    <>
      {dialog}
      <div className="space-y-6">
        <Card className="p-6 space-y-5">
          <h2 className="font-bold text-[#010514]">اطلاعات پایه</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="عنوان" required>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>
            <Field label="مدرس" required>
              <Input
                value={form.instructor}
                onChange={(e) => update("instructor", e.target.value)}
              />
            </Field>
          </div>

          <Field label="توضیح کوتاه" required>
            <Textarea
              rows={2}
              value={form.shortDesc}
              onChange={(e) => update("shortDesc", e.target.value)}
            />
          </Field>

          <Field label="توضیح کامل (ویرایشگر محتوا)">
            <RichTextEditor
              value={form.longDesc}
              onChange={(html) => update("longDesc", html)}
            />
          </Field>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="دسته‌بندی">
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
                <option value="beginner">مقدماتی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
              </Select>
            </Field>
            <Field label="برچسب ویژه (مثل «ویژه» یا «پرفروش»)">
              <Input
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                placeholder="اختیاری"
              />
            </Field>
          </div>

          <Field label="تگ‌ها">
            <TagPicker
              allTags={tags}
              value={form.tagIds}
              onChange={(ids) => update("tagIds", ids)}
            />
          </Field>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-bold text-[#010514]">رسانه معرفی</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="تصویر preview" required>
              <MediaPicker
                kind="image"
                value={form.previewImage}
                onChange={(url) => update("previewImage", url)}
              />
            </Field>
            <Field label="ویدیو معرفی (URL)" hint="mp4 یا m3u8 — اختیاری">
              <Input
                dir="ltr"
                className="font-mono text-sm"
                value={form.previewVideoUrl}
                onChange={(e) => update("previewVideoUrl", e.target.value)}
                placeholder="https://cdn.namdar.academy/preview.mp4"
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button variant="danger" onClick={remove} disabled={busy}>
            حذف دوره
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => router.refresh()}
              disabled={busy}
            >
              انصراف
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
