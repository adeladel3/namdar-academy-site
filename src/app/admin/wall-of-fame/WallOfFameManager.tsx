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
import MediaPicker from "@/components/admin/MediaPicker";
import { Icon } from "@/components/admin/Icons";
import type { WallOfFameItem } from "@/lib/db";

export default function WallOfFameManager({
  items,
}: {
  items: WallOfFameItem[];
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<WallOfFameItem | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(w: WallOfFameItem) {
    const ok = await confirm({
      title: "حذف",
      message: `این آیتم از دیوار افتخارات حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/wall-of-fame/${w.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("حذف شد", "ok");
      router.refresh();
    }
  }

  async function togglePublished(w: WallOfFameItem) {
    await fetch(`/api/admin/wall-of-fame/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !w.published }),
    });
    router.refresh();
  }

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title={`${items.length.toLocaleString("fa-IR")} آیتم`}
          right={
            <Button onClick={() => setCreating(true)}>
              <Icon.Plus width={15} height={15} /> آیتم جدید
            </Button>
          }
        />
        {items.length === 0 ? (
          <div className="py-14 text-center text-[#010514]/55 text-sm">
            هنوز هیچ آیتمی به دیوار افتخارات اضافه نشده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {items.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl border border-[#eef2f7] overflow-hidden bg-white flex flex-col"
              >
                <div className="aspect-video bg-neutral-100 relative">
                  {w.kind === "video" ? (
                    w.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={w.posterUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video
                        src={w.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    )
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.url}
                      alt={w.caption ?? ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span
                    className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      w.kind === "video"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {w.kind === "video" ? "ویدئو" : "تصویر"}
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-2">
                  {w.studentName && (
                    <div className="font-bold text-sm text-[#010514]">
                      {w.studentName}
                    </div>
                  )}
                  {w.caption && (
                    <p className="text-xs text-[#010514]/65 line-clamp-2">
                      {w.caption}
                    </p>
                  )}
                  <div className="text-[11px] text-[#010514]/45 mt-auto">
                    ترتیب: {w.order.toLocaleString("fa-IR")}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border-t border-[#eef2f7]">
                  <button
                    type="button"
                    onClick={() => togglePublished(w)}
                    className={`text-[11px] px-2 py-1 rounded-full font-bold ${
                      w.published
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {w.published ? "منتشر شده" : "پیش‌نویس"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(w)}
                      className="p-2 text-[#010514]/55 hover:text-[#1b3c8a] rounded-lg"
                    >
                      <Icon.Edit width={14} height={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(w)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Icon.Trash width={14} height={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <WallOfFameModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <WallOfFameModal
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

function WallOfFameModal({
  open,
  onClose,
  item,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  item?: WallOfFameItem;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    kind: item?.kind ?? ("image" as "image" | "video"),
    url: item?.url ?? "",
    posterUrl: item?.posterUrl ?? "",
    studentName: item?.studentName ?? "",
    caption: item?.caption ?? "",
    order: item?.order ?? 0,
    published: item?.published ?? true,
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form.url.trim()) {
      toast("لطفاً فایل را انتخاب یا آپلود کنید", "err");
      return;
    }
    setBusy(true);
    try {
      const isNew = !item;
      const res = await fetch(
        isNew
          ? "/api/admin/wall-of-fame"
          : `/api/admin/wall-of-fame/${item!.id}`,
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
      title={item ? "ویرایش آیتم" : "آیتم جدید — دیوار افتخارات"}
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
        <Field label="نوع محتوا">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, kind: "image", url: "", posterUrl: "" })
              }
              className={`flex-1 px-4 py-2 rounded-xl border text-sm font-bold ${
                form.kind === "image"
                  ? "bg-[#1b3c8a] text-white border-[#1b3c8a]"
                  : "bg-white text-[#010514] border-[#eef2f7]"
              }`}
            >
              تصویر
            </button>
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, kind: "video", url: "", posterUrl: "" })
              }
              className={`flex-1 px-4 py-2 rounded-xl border text-sm font-bold ${
                form.kind === "video"
                  ? "bg-[#1b3c8a] text-white border-[#1b3c8a]"
                  : "bg-white text-[#010514] border-[#eef2f7]"
              }`}
            >
              ویدئو
            </button>
          </div>
        </Field>

        <Field
          label={form.kind === "video" ? "فایل ویدئو" : "تصویر"}
          hint={
            form.kind === "video"
              ? "MP4 یا WebM. حداکثر ۲۰۰ مگابایت."
              : "JPG/PNG/WebP. ترجیحاً افقی با نسبت ۱۶:۹."
          }
        >
          <MediaPicker
            kind={form.kind}
            recommended={
              form.kind === "video"
                ? {
                    maxSizeKB: 200 * 1024,
                    formats: ["MP4", "WEBM"],
                    description:
                      "ویدئوی موفقیت دانش‌پذیر برای نمایش در دیوار افتخارات.",
                  }
                : {
                    width: 1280,
                    height: 720,
                    maxSizeKB: 800,
                    formats: ["JPG", "PNG", "WebP"],
                    description:
                      "تصویر موفقیت دانش‌پذیر برای نمایش در دیوار افتخارات.",
                  }
            }
            value={form.url}
            onChange={(url) => setForm({ ...form, url })}
          />
        </Field>

        {form.kind === "video" && (
          <Field
            label="تصویر پیش‌نمایش ویدئو (اختیاری)"
            hint="فریم ابتدایی که قبل از پخش ویدئو نمایش داده می‌شود."
          >
            <MediaPicker
              kind="image"
              recommended={{
                width: 1280,
                height: 720,
                maxSizeKB: 500,
                formats: ["JPG", "WebP"],
                description: "تصویر پیش‌نمایش ویدئو.",
              }}
              value={form.posterUrl}
              onChange={(url) => setForm({ ...form, posterUrl: url })}
            />
          </Field>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          <Field label="نام دانش‌پذیر (اختیاری)">
            <Input
              value={form.studentName}
              onChange={(e) =>
                setForm({ ...form, studentName: e.target.value })
              }
              placeholder="مثلاً: علی رضایی"
            />
          </Field>
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
        </div>

        <Field label="توضیح کوتاه (اختیاری)" hint="حداکثر یک جمله.">
          <Input
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            placeholder="مثلاً: ۳۰٪ سود ماهانه پس از دوره MON"
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
    </Modal>
  );
}
