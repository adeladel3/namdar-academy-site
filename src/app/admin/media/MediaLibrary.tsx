"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  Select,
  cx,
  toast,
  useConfirm,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import { faDigits, formatDate } from "@/lib/formatting";
import type { MediaAsset } from "@/lib/db";

export default function MediaLibrary({ initial }: { initial: MediaAsset[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [items, setItems] = useState(initial);
  const [kind, setKind] = useState<"all" | MediaAsset["kind"]>("all");
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          toast(d.error ?? "بارگذاری ناموفق", "err");
          continue;
        }
      }
      toast("بارگذاری انجام شد", "ok");
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function remove(m: MediaAsset) {
    const ok = await confirm({
      title: "حذف فایل",
      message: `فایل "${m.fileName}" حذف شود؟`,
      confirmText: "حذف",
      danger: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((x) => x.id !== m.id));
      toast("حذف شد", "ok");
    }
  }

  const filtered = items.filter((m) => {
    if (kind !== "all" && m.kind !== kind) return false;
    if (q.trim() && !m.fileName.toLowerCase().includes(q.trim().toLowerCase()))
      return false;
    return true;
  });

  return (
    <>
      {dialog}
      <Card>
        <CardHeader
          title={`${faDigits(filtered.length)} فایل`}
          right={
            <>
              <input
                ref={fileInput}
                type="file"
                multiple
                onChange={(e) => upload(e.target.files)}
                className="hidden"
              />
              <Button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                <Icon.Upload width={15} height={15} />
                {uploading ? "در حال بارگذاری..." : "بارگذاری جدید"}
              </Button>
            </>
          }
        />
        <div className="p-4 flex items-center gap-3 flex-wrap border-b border-[#eef2f7]">
          <div className="relative flex-1 min-w-[220px]">
            <Icon.Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#010514]/40"
              width={14}
              height={14}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی نام فایل"
              className="w-full pr-9 pl-4 py-2 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3c8a]/15"
            />
          </div>
          <Select
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "all" | MediaAsset["kind"])
            }
            className="!py-1.5 !px-3 !text-sm !w-auto"
          >
            <option value="all">همه</option>
            <option value="image">تصاویر</option>
            <option value="video">ویدیوها</option>
            <option value="file">فایل</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#010514]/55 text-sm">
            فایلی مطابق با جستجوی شما وجود ندارد.
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((m) => (
              <div
                key={m.id}
                className={cx(
                  "relative rounded-xl overflow-hidden border border-[#e5eaf5] bg-white group"
                )}
              >
                {m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.fileName}
                    className="w-full h-32 object-cover"
                  />
                ) : m.kind === "video" ? (
                  <div className="w-full h-32 bg-black flex items-center justify-center">
                    <Icon.Play
                      width={32}
                      height={32}
                      className="text-white/80"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-[#f7fafd] flex items-center justify-center">
                    <Icon.Folder
                      width={28}
                      height={28}
                      className="text-[#010514]/40"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-xs font-medium truncate">
                    {m.fileName}
                  </div>
                  <div className="text-[10px] text-[#010514]/50 mt-0.5 flex items-center justify-between">
                    <span>{(m.fileSize / 1024).toFixed(0)} KB</span>
                    <span>{formatDate(m.createdAt)}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(m.url);
                      toast("آدرس کپی شد", "ok");
                    }}
                    className="w-7 h-7 rounded-lg bg-white/95 text-[#1b3c8a] shadow flex items-center justify-center"
                    title="کپی آدرس"
                  >
                    <Icon.Folder width={13} height={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    className="w-7 h-7 rounded-lg bg-white/95 text-red-600 shadow flex items-center justify-center"
                    title="حذف"
                  >
                    <Icon.Trash width={13} height={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
