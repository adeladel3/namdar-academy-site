/**
 * هنگام آپلود رسانه، خطاها از چند لایه می‌آیند: خود اپلیکیشن Next (پیام
 * فارسی JSON)، Nginx (پاسخ HTML برای ۴۱۳)، یا فایروال شبکه. این helper
 * یک پیام فارسی روشن می‌سازد تا ادمین بفهمد دقیقاً چه شده، به‌جای
 * توست عمومی «بارگذاری ناموفق» که به اشتباه به نظر می‌رسد امکان آپلود
 * اصلاً وجود ندارد.
 */
export async function uploadErrorMessage(
  res: Response,
  file?: File
): Promise<string> {
  if (res.status === 413) {
    const sizeMb = file ? (file.size / 1024 / 1024).toFixed(1) : null;
    return sizeMb
      ? `حجم فایل (${sizeMb} مگابایت) بیش از حد مجاز سرور است. اگر مدیر سرور هستید، client_max_body_size در پیکربندی Nginx را افزایش دهید.`
      : "حجم فایل بیش از حد مجاز سرور است.";
  }
  if (res.status === 401) {
    return "نشست شما منقضی شده. لطفاً دوباره وارد حساب ادمین شوید.";
  }
  if (res.status === 403) {
    return "اجازه‌ی آپلود ندارید. به ادمین اصلی بگویید دسترسی media به شما داده شود.";
  }
  if (res.status === 415) {
    return file
      ? `نوع فایل «${file.name}» مجاز نیست. فقط تصویر، ویدئو، صوت و سند پشتیبانی می‌شود.`
      : "نوع فایل مجاز نیست.";
  }
  // تلاش برای خواندن پیام JSON اپلیکیشن (که فارسی است). اگر پاسخ HTML باشد
  // (مثل صفحه‌ی خطای Nginx) parse fail می‌کند و به fallback می‌رسیم.
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    if (data.error) return data.error;
    if (data.message) return data.message;
  } catch {
    /* پاسخ JSON نبود؛ احتمالاً صفحه‌ی HTML از Nginx یا فایروال */
  }
  return `بارگذاری ناموفق (کد ${res.status}). اگر تکرار شد، با مدیر سرور تماس بگیرید.`;
}
