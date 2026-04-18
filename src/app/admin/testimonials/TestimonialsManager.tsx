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
  Textarea,
  Toggle,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";
import { Icon } from "@/components/admin/Icons";
import type { TestimonialRecord } from "@/lib/db";

export default function TestimonialsManager({
  items,
}: {
  items: TestimonialRecord[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<TestimonialRecord | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(t: TestimonialRecord) {
    const ok = await confirm({
      title: "حذف",
      message: `نظر «${t.name}» حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("حذف شد", "ok");
      router.refresh();
    }
  }

  async function togglePublished(t: TestimonialRecord) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !t.published }),
    });
    router.refresh();
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title={`${items.length.toLocaleString("fa-IR")} نظر`}
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> نظر جدید
            </Button>
          }
        />
        {items.length === 0 ? (
          <div className="py-14 text-center text-[#010514]/55 text-sm">
            هنوز testimonial ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-[#eef2f7]">
            {items.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-4">
                <span className="w-11 h-11 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {t.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    t.name.charAt(0)
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#010514]">
                    {t.name}
                    {t.role && (
                      <span className="text-xs text-[#010514]/55 font-normal mr-2">
                        · {t.role}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#010514]/65 line-clamp-2 mt-0.5">
                    {t.quote}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePublished(t)}
                  className={`text-[11px] px-2 py-1 rounded-full font-bold shrink-0 ${
                    t.published
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {t.published ? "منتشر شده" : "پیش‌نویس"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(t)}
                  className="p-2 text-[#010514]/55 hover:text-[#1b3c8a] rounded-lg"
                >
                  <Icon.Edit width={14} height={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(t)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Icon.Trash width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <TestimonialModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <TestimonialModal
        open={!!editing}
        onClose={() => setEditing(null)}
        item={editing ?? undefined}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function TestimonialModal({
  open,
  onClose,
  item,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  item?: TestimonialRecord;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name ?? "",
    role: item?.role ?? "",
    avatar: item?.avatar ?? "",
    quote: item?.quote ?? "",
    order: item?.order ?? 0,
    published: item?.published ?? true,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.quote.trim()) {
      toast("نام و متن نظر الزامی است", "err");
      return;
    }
    setBusy(true);
    try {
      const isNew = !item;
      const res = await fetch(
        isNew
          ? "/api/admin/testimonials"
          : `/api/admin/testimonials/${item!.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        toast("خطا در ذخیره", "err");
        return;
      }
      toast("ذخیره شد", "ok");
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "ویرایش نظر" : "نظر جدید"}
      width="max-w-xl"
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
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="نام کامل">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="سمت / عنوان">
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="فارغ‌التحصیل دوره MON"
            />
          </Field>
        </div>
        <Field label="آواتار (اختیاری)">
          <MediaPicker
            kind="image"
            value={form.avatar}
            onChange={(url) => setForm({ ...form, avatar: url })}
          />
        </Field>
        <Field label="متن نظر">
          <Textarea
            rows={4}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
          />
        </Field>
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="ترتیب">
            <Input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) })
              }
              dir="ltr"
              className="font-mono"
            />
          </Field>
          <Field label="وضعیت">
            <Toggle
              checked={form.published}
              onChange={(v) => setForm({ ...form, published: v })}
              label="منتشر شده"
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
