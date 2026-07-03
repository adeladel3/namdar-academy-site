// تابع ساخت آدرس (slug) از عنوان فارسی یا انگلیسی.
//
// چرا فارسی را نگه می‌داریم؟ آدرس‌های فینگیلیش (transliteration) مثل
// «smynar-sghvt» نه قابل خواندن هستند، نه قابل تشخیص توسط کاربر، و
// نه به‌درد SEO فارسی می‌خورند. مرورگرهای مدرن آدرس فارسی را در نوار
// آدرس درست نمایش می‌دهند (مثلاً /courses/سمینار-سقوط) و گوگل هم آنها
// را در نتایج جستجو به همان صورت ایندکس می‌کند.
//
// قواعد:
// 1. حروف فارسی/عربی، انگلیسی، عدد لاتین و اعداد فارسی (۰-۹) و علامت
//    خط تیره نگه داشته می‌شوند.
// 2. اعداد فارسی به انگلیسی تبدیل می‌شوند تا یکنواخت باشد و جستجو راحت‌تر.
// 3. حروف انگلیسی به حروف کوچک.
// 4. فاصله‌ها (شامل نیم‌فاصله U+200C) به خط تیره.
// 5. هر چیز دیگر (نقطه، ویرگول، علامت سوال و ...) حذف می‌شود.
// 6. خط تیره‌های تکراری در یکی ادغام می‌شوند و از ابتدا/انتها حذف.

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (ch) => {
    const i = PERSIAN_DIGITS.indexOf(ch);
    if (i >= 0) return String(i);
    const j = ARABIC_DIGITS.indexOf(ch);
    if (j >= 0) return String(j);
    return ch;
  });
}

export function slugifyTitle(input: string): string {
  if (!input) return "";
  let s = normalizeDigits(input).trim().toLowerCase();

  // یکدست‌سازی حروف عربی به فارسی (ی به جای ي، ک به جای ك)
  s = s.replace(/ي/g, "ی").replace(/ك/g, "ک");

  // فاصله‌ها (شامل ZWNJ نیم‌فاصله و فاصله‌های unicode) → خط تیره
  s = s.replace(/[\s‌​]+/g, "-");

  // فقط نگه‌داشتن: حروف فارسی/عربی (U+0600 تا U+06FF)، حروف انگلیسی،
  // اعداد لاتین، و خط تیره. بقیه حذف.
  s = s.replace(/[^؀-ۿa-z0-9-]/g, "");

  // ادغام خط تیره‌های تکراری و حذف از ابتدا/انتها
  s = s.replace(/-+/g, "-").replace(/^-+|-+$/g, "");

  return s;
}

/**
 * بررسی اعتبار slug — همان مجموعه‌ی کاراکترهای slugifyTitle.
 * برای validation در فرم‌ها استفاده می‌شود.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 1 || slug.length > 200) return false;
  return /^[؀-ۿa-z0-9-]+$/.test(slug);
}
