"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  Modal,
  Empty,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import type { SeminarContentBlock, SeminarMediaKind } from "@/lib/db";

type Namespace = "landing" | "member";

const KIND_LABELS: Record<SeminarMediaKind, string> = {
  image: "تصویر",
  video: "ویدیو",
  file: "فایل (PDF و غیره)",
  link: "لینک خارجی",
  embed: "Embed (کد HTML)",
};

type BlockForm = {
  id?: string;
  kind: SeminarMediaKind;
  title: string;
  description: string;
  url: string;
  posterUrl: string;
  visible: boolean;
  order: number;
};

function emptyForm(): BlockForm {
  return {
    kind: "image",
    title: "",
    description: "",
    url: "",
    posterUrl: "",
    visible: true,
    order: 0,
  };
}

export default function ContentBlocksManager({
  seminarSlug,
  namespace,
  blocks,
  titleArea,
  description,
}: {
  seminarSlug: string;
  namespace: Namespace;
  blocks: SeminarContentBlock[];
  titleArea: string;
  description: string;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<BlockForm | null>(null);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    const nextOrder =
      blocks.length > 0 ? Math.max(...blocks.map((b) => b.order)) + 1 : 0;
    setEditing({ ...emptyForm(), order: nextOrder });
  }

  function openEdit(b: SeminarContentBlock) {
    setEditing({
      id: b.id,
      kind: b.kind,
      title: b.title,
      description: b.description ?? "",
      url: b.url ?? "",
      posterUrl: b.posterUrl ?? "",
      visible: b.visible,
      order: b.order,
    });
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast("عنوان بلوک را وارد کنید", "err");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/seminars/${encodeURIComponent(seminarSlug)}/blocks/${namespace}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            kind: editing.kind,
            title: editing.title.trim(),
            description: editing.description.trim() || undefined,
            url: editing.url.trim() || undefined,
            posterUrl: editing.posterUrl.trim() || undefined,
            order: editing.order,
            visible: editing.visible,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره‌ی بلوک");
      toast("بلوک ذخیره شد", "ok");
      setEditing(null);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      toast(msg, "err");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const ok = await confirm({
      title: "حذف بلوک",
      message: "این بلوک از صفحه برداشته می‌شود. ادامه؟",
      confirmText: "حذف کنم",
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(
        `/api/admin/seminars/${encodeURIComponent(seminarSlug)}/blocks/${namespace}?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در حذف");
      toast("بلوک حذف شد", "ok");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      toast(msg, "err");
    }
  }

  async function bump(b: SeminarContentBlock, direction: "up" | "down") {
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((x) => x.id === b.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const orderMap: Record<string, number> = {};
    sorted.forEach((x, i) => (orderMap[x.id] = i));
    orderMap[sorted[idx].id] = swapIdx;
    orderMap[sorted[swapIdx].id] = idx;
    try {
      const res = await fetch(
        `/api/admin/seminars/${encodeURIComponent(seminarSlug)}/blocks/${namespace}/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderMap }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "خطا در ترتیب");
      }
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "خطای ناشناخته";
      toast(msg, "err");
    }
  }

  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {dialog}

      <div
        className="rounded-3xl p-6 border-2 border-dashed text-center"
        style={{
          background:
            namespace === "landing"
              ? "linear-gradient(135deg, #fdf4ff, #eef4ff)"
              : "linear-gradient(135deg, #fff4d6, #fdf5de)",
          borderColor:
            namespace === "landing" ? "rgba(27,60,138,0.25)" : "rgba(212,166,42,0.4)",
        }}
      >
        <h2 className="text-xl font-extrabold text-[#0e1a3d] mb-1">{titleArea}</h2>
        <p className="text-sm text-[#0e1a3d]/65 max-w-2xl mx-auto leading-7">
          {description}
        </p>
      </div>

      <Card>
        <CardHeader
          title="بلوک‌های محتوا"
          subtitle={`${sorted.length} بلوک — ترتیب نمایش از بالا به پایین`}
          right={
            <Button variant="primary" onClick={openCreate}>
              <Icon.Plus width={16} height={16} />
              افزودن بلوک
            </Button>
          }
        />
        {sorted.length === 0 ? (
          <Empty
            title="هنوز بلوکی اضافه نشده"
            description="با کلیک روی «افزودن بلوک» اولین تصویر، ویدیو، فایل یا لینک خود را ثبت کنید."
          />
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {sorted.map((b, i) => (
              <li key={b.id} className="px-5 py-4 flex items-center gap-3">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="بالا"
                    onClick={() => bump(b, "up")}
                    disabled={i === 0}
                    className="w-7 h-7 rounded-lg bg-[#f4f7fc] text-[#1b3c8a] flex items-center justify-center disabled:opacity-30 hover:bg-[#eef4ff]"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label="پایین"
                    onClick={() => bump(b, "down")}
                    disabled={i === sorted.length - 1}
                    className="w-7 h-7 rounded-lg bg-[#f4f7fc] text-[#1b3c8a] flex items-center justify-center disabled:opacity-30 hover:bg-[#eef4ff]"
                  >
                    ▼
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center shrink-0 font-bold text-[11px]">
                  {KIND_LABELS[b.kind].slice(0, 6)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#010514] truncate">
                      {b.title}
                    </span>
                    {!b.visible && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        مخفی
                      </span>
                    )}
                  </div>
                  {b.description && (
                    <p className="text-xs text-[#010514]/55 truncate">
                      {b.description}
                    </p>
                  )}
                  {b.url && (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1b3c8a] hover:underline font-mono truncate block"
                      dir="ltr"
                    >
                      {b.url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(b)}>
                    ویرایش
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(b.id)}>
                    حذف
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? "ویرایش بلوک" : "بلوک جدید"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              انصراف
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="نوع بلوک" required>
              <Select
                value={editing.kind}
                onChange={(e) =>
                  setEditing({ ...editing, kind: e.target.value as SeminarMediaKind })
                }
              >
                {Object.entries(KIND_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="عنوان" required>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="توضیح / کپشن">
              <Textarea
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </Field>
            <Field
              label="آدرس فایل / لینک"
              hint={
                editing.kind === "embed"
                  ? "کد HTML embed (مثلاً <iframe ...>)"
                  : "آدرس کامل تصویر، ویدیو، PDF یا لینک خارجی"
              }
            >
              {editing.kind === "embed" ? (
                <Textarea
                  rows={4}
                  dir="ltr"
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
              ) : (
                <Input
                  dir="ltr"
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
              )}
            </Field>
            {editing.kind === "video" && (
              <Field label="تصویر پیش‌نمایش ویدیو (اختیاری)">
                <Input
                  dir="ltr"
                  value={editing.posterUrl}
                  onChange={(e) =>
                    setEditing({ ...editing, posterUrl: e.target.value })
                  }
                />
              </Field>
            )}
            <Field label="آیا این بلوک روی صفحه نمایش داده شود؟">
              <Select
                value={editing.visible ? "yes" : "no"}
                onChange={(e) =>
                  setEditing({ ...editing, visible: e.target.value === "yes" })
                }
              >
                <option value="yes">بله، نمایش داده شود</option>
                <option value="no">مخفی</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
