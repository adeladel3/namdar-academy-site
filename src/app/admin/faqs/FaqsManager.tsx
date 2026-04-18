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
  Toggle,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Icon } from "@/components/admin/Icons";
import type { FaqRecord } from "@/lib/db";

export default function FaqsManager({ faqs }: { faqs: FaqRecord[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<FaqRecord | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(f: FaqRecord) {
    const ok = await confirm({
      title: "حذف سوال",
      message: "این سوال حذف شود؟",
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/faqs/${f.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("حذف شد", "ok");
      router.refresh();
    }
  }

  async function togglePublished(f: FaqRecord) {
    await fetch(`/api/admin/faqs/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !f.published }),
    });
    router.refresh();
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title={`${faqs.length.toLocaleString("fa-IR")} سوال`}
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> سوال جدید
            </Button>
          }
        />
        {faqs.length === 0 ? (
          <div className="py-14 text-center text-[#010514]/55 text-sm">
            هنوز سوالی تعریف نشده است.
          </div>
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {faqs.map((f) => (
              <li key={f.id} className="flex items-center gap-3 p-4">
                <span className="text-xs font-mono text-[#010514]/45 w-10 shrink-0">
                  {String(f.order).padStart(3, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#010514] truncate">
                    {f.question}
                  </div>
                  <div
                    className="text-xs text-[#010514]/55 line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: f.answer }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => togglePublished(f)}
                  className={`text-[11px] px-2 py-1 rounded-full font-bold shrink-0 ${
                    f.published
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {f.published ? "منتشر شده" : "پیش‌نویس"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(f)}
                  className="p-2 text-[#010514]/55 hover:text-[#1b3c8a] rounded-lg"
                >
                  <Icon.Edit width={14} height={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(f)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Icon.Trash width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <FaqModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <FaqModal
        open={!!editing}
        onClose={() => setEditing(null)}
        faq={editing ?? undefined}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function FaqModal({
  open,
  onClose,
  faq,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  faq?: FaqRecord;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    order: faq?.order ?? 0,
    published: faq?.published ?? true,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.question.trim()) {
      toast("سوال الزامی است", "err");
      return;
    }
    setBusy(true);
    try {
      const isNew = !faq;
      const res = await fetch(
        isNew ? "/api/admin/faqs" : `/api/admin/faqs/${faq!.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast(d.error ?? "خطا", "err");
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
      title={faq ? "ویرایش سوال" : "سوال جدید"}
      width="max-w-2xl"
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
        <Field label="سوال">
          <Input
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
        </Field>
        <Field label="پاسخ">
          <RichTextEditor
            value={form.answer}
            onChange={(html) => setForm({ ...form, answer: html })}
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
