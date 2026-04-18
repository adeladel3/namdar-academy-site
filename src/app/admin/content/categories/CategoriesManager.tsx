"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import type { CategoryRecord } from "@/lib/db";

export default function CategoriesManager({
  categories,
}: {
  categories: CategoryRecord[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(c: CategoryRecord) {
    const ok = await confirm({
      title: "حذف دسته‌بندی",
      message: `دسته "${c.name}" حذف شود؟ دوره‌هایی که به این دسته متصل هستند، از دسته خارج می‌شوند.`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("دسته حذف شد", "ok");
      router.refresh();
    }
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title="دسته‌بندی‌ها"
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> دسته جدید
            </Button>
          }
        />
        {categories.length === 0 ? (
          <div className="py-10 text-center text-[#010514]/55 text-sm">
            هنوز دسته‌ای تعریف نشده است.
          </div>
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-3 p-4">
                <span className="w-8 h-8 rounded-lg bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center text-sm">
                  {c.icon ?? "#"}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-[#010514]">{c.name}</div>
                  <div className="text-xs text-[#010514]/55 font-mono" dir="ltr">
                    /{c.slug}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="p-2 text-[#010514]/55 hover:text-[#1b3c8a] rounded-lg"
                  title="ویرایش"
                >
                  <Icon.Edit width={14} height={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="حذف"
                >
                  <Icon.Trash width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CategoryModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <CategoryModal
        open={!!editing}
        onClose={() => setEditing(null)}
        category={editing ?? undefined}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function CategoryModal({
  open,
  onClose,
  category,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  category?: CategoryRecord;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    icon: category?.icon ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name.trim()) {
      toast("نام الزامی است", "err");
      return;
    }
    setBusy(true);
    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : `/api/admin/categories`;
      const method = category ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          icon: form.icon.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast(d.error ?? "خطا", "err");
        return;
      }
      toast(category ? "ویرایش شد" : "دسته اضافه شد", "ok");
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "ویرایش دسته" : "دسته جدید"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            انصراف
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "..." : "ذخیره"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="نام دسته">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="slug (اختیاری)">
          <Input
            dir="ltr"
            className="font-mono"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>
        <Field label="ایکن (emoji یا یک حرف، اختیاری)">
          <Input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            maxLength={2}
          />
        </Field>
      </div>
    </Modal>
  );
}
