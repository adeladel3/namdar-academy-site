"use client";

import { useEffect, useRef, useState } from "react";
import { cx, Modal, toast } from "./ui";
import { Icon } from "./Icons";
import { faDigits } from "@/lib/formatting";
import type { MediaAsset } from "@/lib/db";

type Props = {
  kind: "image" | "video" | "file";
  value: string;
  onChange: (url: string) => void;
};

export default function MediaPicker({ kind, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        {value ? (
          <div className="relative">
            {kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt=""
                className="w-full h-40 object-cover rounded-xl border border-[#e5eaf5]"
              />
            ) : (
              <div className="w-full h-28 bg-[#f7fafd] rounded-xl border border-[#e5eaf5] flex items-center justify-center text-xs text-[#010514]/55 font-mono break-all px-3">
                {value}
              </div>
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 text-red-600 shadow flex items-center justify-center text-sm"
              title="حذف"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="h-40 w-full rounded-xl border-2 border-dashed border-[#e5eaf5] flex items-center justify-center text-xs text-[#010514]/50">
            هنوز رسانه‌ای انتخاب نشده
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex-1 py-2 rounded-xl border border-[#e5eaf5] text-sm font-bold text-[#1b3c8a] hover:bg-[#eef4ff] transition inline-flex items-center justify-center gap-2"
          >
            <Icon.Folder width={15} height={15} /> انتخاب از کتابخانه
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="یا آدرس URL مستقیم"
            dir="ltr"
            className="flex-1 px-3 py-2 rounded-xl border border-[#e5eaf5] text-xs font-mono focus:outline-none focus:border-[#1b3c8a]"
          />
        </div>
      </div>
      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        onPick={(url) => {
          onChange(url);
          setOpen(false);
        }}
      />
    </>
  );
}

function MediaLibraryModal({
  open,
  onClose,
  kind,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  kind: Props["kind"];
  onPick: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?kind=${kind}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (open) load();
  }, [open, kind]);

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
        }
      }
      await load();
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="کتابخانه رسانه" width="max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={
            kind === "image"
              ? "image/*"
              : kind === "video"
              ? "video/*"
              : undefined
          }
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-[#1b3c8a] text-white text-sm font-bold hover:opacity-90 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Icon.Upload width={15} height={15} />
          {uploading ? "در حال بارگذاری..." : "بارگذاری جدید"}
        </button>
        <span className="text-xs text-[#010514]/55">
          {faDigits(items.length)} فایل
        </span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[#010514]/55 text-sm">
          در حال بارگذاری...
        </div>
      ) : items.length === 0 ? (
        <div className="py-14 text-center text-[#010514]/55 text-sm border border-dashed border-[#e5eaf5] rounded-2xl">
          فایلی در کتابخانه نیست. یک فایل جدید بارگذاری کنید.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[420px] overflow-auto pr-1">
          {items.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => onPick(m.url)}
              className={cx(
                "relative rounded-xl overflow-hidden border border-[#e5eaf5] hover:border-[#1b3c8a] bg-white transition text-right"
              )}
            >
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.fileName}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 bg-[#f7fafd] flex items-center justify-center">
                  <Icon.Media
                    width={28}
                    height={28}
                    className="text-[#010514]/40"
                  />
                </div>
              )}
              <div className="p-2">
                <div className="text-xs font-medium truncate">{m.fileName}</div>
                <div className="text-[10px] text-[#010514]/50">
                  {(m.fileSize / 1024).toFixed(0)} KB
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
