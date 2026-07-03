import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { listUsers } from "@/lib/db";
import { toEnglishDigits } from "@/lib/formatting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * جست‌وجوی کاربران برای picker پشتیبان دوره و سایر چندانتخابی‌های ادمین.
 *
 * چرا روت جدا:
 *   صفحه‌ی ادمین قبلاً کل لیست کاربران فعال (۱۳۰هزار+) را به‌عنوان prop به
 *   کلاینت می‌فرستاد. payload چند مگابایتی روی موبایل/شبکه‌های ایران هم
 *   کند بود هم فیلتر کلاینتی روی اعداد فارسی کار نمی‌کرد (شماره‌ها در DB
 *   انگلیسی ذخیره می‌شوند ولی کاربر با کیبورد فارسی تایپ می‌کند).
 *
 *   این روت کوئری را نرمالایز می‌کند، در DB سرور می‌گردد، و حداکثر ۵۰
 *   نتیجه‌ی اول را برمی‌گرداند.
 */
export async function GET(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const rawQ = (url.searchParams.get("q") ?? "").trim();
  if (rawQ.length < 1) {
    return NextResponse.json({ users: [] });
  }

  // اعداد فارسی/عربی → انگلیسی، تا «۰۹۱۲» با «0912» تطبیق کند.
  const q = toEnglishDigits(rawQ);

  const results = listUsers({ q, status: "active" })
    .slice(0, 50)
    .map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      phone: u.phone,
    }));

  return NextResponse.json({ users: results });
}
