/**
 * Client-safe helper for resolving stored upload URLs. Kept in its own
 * module (no `node:fs` etc.) so client components can import it without
 * pulling server-only code into the browser bundle.
 *
 * URL ذخیره‌شده در دیتابیس همیشه `"/uploads/<file>"` است. در پروداکشن
 * nginx مسیرهای `/uploads/` و حتی `/api/files/` را با ۴۰۴ پاسخ می‌دهد چون
 * از پوشه‌ی فیزیکی محلی می‌خواند. به جای آن یک namespace ساده‌ی `/m/<file>`
 * استفاده می‌کنیم که nginx هیچ قاعده‌ای برایش ندارد و درخواست مستقیم به
 * Next می‌رسد.
 */
export function resolveUploadUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (!url.startsWith("/uploads/")) return url;
  const name = url.slice("/uploads/".length);
  if (!name) return url;
  return `/m/${encodeURIComponent(name)}`;
}
