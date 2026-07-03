"use client";

import { useEffect, useState } from "react";
import { resolveUploadUrl } from "@/lib/upload-url";

/**
 * تصویر آپلودی با fallback دو-مرحله‌ای.
 *
 * چرا:
 *   مسیر اصلی URLهای آپلودی `/uploads/<name>` است. در پروداکشن این مسیر
 *   ممکن است:
 *     ۱) مستقیماً توسط nginx از دیسک سرو شود — اگر فایل آنجا هست، عالی.
 *     ۲) به Next ارجاع داده شود که از `public/uploads/` می‌خواند.
 *   و route پشتیبان `/api/files/<name>` همیشه از Next می‌خواند (مستقل از
 *   nginx). در شرایط خاص یکی از این دو ممکن است ۴۰۴ بدهد در حالی که
 *   دیگری کار می‌کند، بسته به تنظیمات کش nginx یا standalone بودن سرور.
 *
 *   این کامپوننت ابتدا `/api/files/...` را تست می‌کند (مطمئن‌ترین در
 *   پروداکشن چون مستقیم به Next می‌رسد) و اگر خطا داد به `/uploads/...`
 *   مستقیم برمی‌گردد. در dev که هر دو کار می‌کنند، اولین درخواست موفق
 *   است و fallback اصلاً اجرا نمی‌شود.
 */
export function UploadImg({
  url,
  alt,
  className,
  onClick,
}: {
  url: string | null | undefined;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const initial = resolveUploadUrl(url || "");
  const [src, setSrc] = useState(initial);
  const [stage, setStage] = useState<"api" | "uploads" | "failed">("api");

  useEffect(() => {
    setSrc(resolveUploadUrl(url || ""));
    setStage("api");
  }, [url]);

  function handleError() {
    if (stage === "api" && url && url.startsWith("/uploads/")) {
      setSrc(url);
      setStage("uploads");
      return;
    }
    setStage("failed");
  }

  if (stage === "failed" || !src) {
    return (
      <div
        className={
          (className || "") +
          " flex items-center justify-center bg-[#f7fafd] text-[#010514]/40 text-xs"
        }
      >
        تصویر در دسترس نیست
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
    />
  );
}
