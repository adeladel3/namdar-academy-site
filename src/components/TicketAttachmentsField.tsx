"use client";

import { useRef, useState } from "react";
import type { TicketAttachment } from "@/lib/db";
import { resolveUploadUrl } from "@/lib/upload-url";
import { UploadImg } from "./UploadImg";

const MAX_FILES = 6;
const MAX_SIZE = 15 * 1024 * 1024;
const ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.pdf,image/*,application/pdf";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function TicketAttachmentsField({
  value,
  onChange,
  disabled,
  compact,
}: {
  value: TicketAttachment[];
  onChange: (next: TicketAttachment[]) => void;
  disabled?: boolean;
  /** Compact = reply box (smaller dropzone). Default = new-ticket form. */
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  async function uploadOne(file: File): Promise<TicketAttachment | null> {
    if (file.size > MAX_SIZE) {
      setError(
        `«${file.name}» بزرگ‌تر از حد مجاز است (حداکثر ${MAX_SIZE / 1024 / 1024} مگابایت)`
      );
      return null;
    }
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/tickets/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "آپلود ناموفق");
        return null;
      }
      return {
        url: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      };
    } catch {
      setError("خطا در آپلود");
      return null;
    }
  }

  async function handleFiles(files: FileList | File[]) {
    setError("");
    const list = Array.from(files);
    if (value.length + list.length > MAX_FILES) {
      setError(`حداکثر ${MAX_FILES} فایل ضمیمه می‌توانید بفرستید`);
      return;
    }
    setUploading((c) => c + list.length);
    try {
      const results = await Promise.all(list.map((f) => uploadOne(f)));
      const valid = results.filter((r): r is TicketAttachment => r !== null);
      if (valid.length > 0) onChange([...value, ...valid]);
    } finally {
      setUploading(0);
    }
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  const padCx = compact ? "p-3" : "p-4";

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex items-center gap-3 ${padCx} rounded-2xl border-2 border-dashed transition cursor-pointer select-none ${
          disabled
            ? "bg-[#f4f7fc] border-[#e5eaf5] opacity-60 cursor-not-allowed"
            : drag
            ? "bg-[#eaf1fc] border-[#1b3c8a]"
            : "bg-[#fafbfe] border-[#e3e9f4] hover:bg-[#f4f7fc] hover:border-[#bcd9f4]"
        }`}
      >
        <div className="shrink-0 w-9 h-9 rounded-xl bg-[#eaf1fc] text-[#1b3c8a] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-extrabold text-[#0e1a3d]">
            {uploading > 0
              ? `در حال آپلود ${uploading} فایل…`
              : "افزودن فایل ضمیمه"}
          </div>
          <div className="text-[11.5px] text-[#0e1a3d]/55 leading-6">
            عکس (JPG/PNG/WebP/GIF) یا PDF · حداکثر {MAX_FILES} فایل · هر فایل تا ۱۵ مگابایت
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
          disabled={disabled || uploading > 0}
        />
      </div>

      {error && (
        <div className="px-3 py-2 rounded-xl text-[12px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
          {error}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((a, i) => {
            const isImg = a.mimeType.startsWith("image/");
            return (
              <div
                key={`${a.url}-${i}`}
                className="group relative flex items-center gap-2 pr-2 pl-1 py-1 rounded-2xl bg-white border border-[#e5eaf5]"
              >
                {isImg ? (
                  <UploadImg
                    url={a.url}
                    alt={a.fileName}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#0e1a3d] truncate max-w-[160px]">
                    {a.fileName}
                  </div>
                  <div className="text-[10.5px] text-[#0e1a3d]/55 font-mono" dir="ltr">
                    {formatSize(a.fileSize)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={disabled}
                  aria-label="حذف"
                  className="ms-1 w-7 h-7 rounded-full bg-[#f4f7fc] text-[#0e1a3d]/65 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6l12 12M18 6l-12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
