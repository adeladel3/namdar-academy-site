import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import {
  getSeminar,
  listAllOrders,
  listSeminarRegistrationsBySeminar,
} from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import StatCard from "@/components/admin/StatCard";
import { Icon } from "@/components/admin/Icons";
import {
  faDigits,
  formatRelative,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function formatEventDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fa-IR", {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default async function SeminarOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) notFound();

  const registrations = listSeminarRegistrationsBySeminar(seminar.slug);
  const orders = listAllOrders().filter(
    (o) =>
      (o.productType === "seminar" || o.seminarSlug) &&
      (o.seminarSlug === seminar.slug || o.courseSlug === seminar.slug) &&
      o.status === "paid"
  );
  const revenue = orders.reduce((s, o) => s + o.finalAmount, 0);

  const landingBlocks = seminar.landingBlocks ?? [];
  const memberBlocks = seminar.memberBlocks ?? [];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="ثبت‌نام‌ها"
          value={`${faDigits(registrations.length)}${
            seminar.capacity ? ` / ${faDigits(seminar.capacity)}` : ""
          }`}
          icon={<Icon.Users width={18} height={18} />}
        />
        <StatCard
          label="درآمد"
          value={formatTomanCompact(revenue)}
          hint={`${faDigits(orders.length)} فروش موفق`}
          icon={<Icon.Money width={18} height={18} />}
        />
        <StatCard
          label="بلوک‌های لندینگ"
          value={faDigits(landingBlocks.length)}
          hint="محتوای صفحه‌ی عمومی"
          icon={<Icon.Eye width={18} height={18} />}
        />
        <StatCard
          label="بلوک‌های پنل خریدار"
          value={faDigits(memberBlocks.length)}
          hint="فایل‌ها، ویدیو، QR"
          icon={<Icon.Folder width={18} height={18} />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="آخرین ثبت‌نام‌ها"
            right={
              <Link
                href={`/admin/seminars/${encodeURIComponent(seminar.slug)}/registrations`}
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                همه ←
              </Link>
            }
          />
          {registrations.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز کسی برای این سمینار ثبت‌نام نکرده است.
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {registrations.slice(0, 8).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="w-8 h-8 rounded-full bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center font-bold text-xs">
                    {r.fullName.trim().slice(0, 1) || "•"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#010514] truncate">
                      {r.fullName}
                    </div>
                    <div className="text-[11px] text-[#010514]/55 font-mono" dir="ltr">
                      {r.phone} · {r.nationalId}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#010514]/50">
                    {formatRelative(r.registeredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="اطلاعات سریع" />
          <div className="p-5 space-y-3 text-sm">
            <div>
              <div className="text-[#010514]/55 mb-1">تاریخ برگزاری</div>
              <div className="font-bold leading-7">
                {formatEventDate(seminar.eventDate)}
              </div>
            </div>
            <div>
              <div className="text-[#010514]/55 mb-1">مکان</div>
              <div className="font-bold leading-7">
                {seminar.venueName ?? "—"}
              </div>
              {seminar.venueAddress && (
                <div className="text-xs text-[#010514]/65 mt-1 leading-6">
                  {seminar.venueAddress}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#010514]/55">قیمت اصلی</span>
              <span className="font-bold">{formatToman(seminar.price)}</span>
            </div>
            {seminar.discountPrice && (
              <div className="flex items-center justify-between">
                <span className="text-[#010514]/55">قیمت با تخفیف</span>
                <span className="font-bold text-[#1b3c8a]">
                  {formatToman(seminar.discountPrice)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#010514]/55">قابلیت خرید</span>
              <span className="font-bold">
                {seminar.allowPurchase ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#010514]/55">ایجاد شده</span>
              <span>{formatRelative(seminar.createdAt)}</span>
            </div>
            {seminar.publishedAt && (
              <div className="flex items-center justify-between">
                <span className="text-[#010514]/55">انتشار</span>
                <span>{formatRelative(seminar.publishedAt)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="پیش‌نمایش لینک‌های مفید" />
        <div className="p-5 grid sm:grid-cols-2 gap-3 text-sm">
          <a
            href={`/seminars/${encodeURIComponent(seminar.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-[#e5eaf5] bg-[#f7fafd] hover:border-[#1b3c8a] hover:bg-[#eef4ff] transition p-4 flex items-center gap-3"
          >
            <Icon.Eye width={20} height={20} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#010514]">صفحه لندینگ سمینار</div>
              <div className="text-xs text-[#010514]/55 font-mono truncate" dir="ltr">
                /seminars/{seminar.slug}
              </div>
            </div>
          </a>
          <Link
            href={`/admin/seminars/${encodeURIComponent(seminar.slug)}/landing-content`}
            className="rounded-2xl border border-[#e5eaf5] bg-[#f7fafd] hover:border-[#1b3c8a] hover:bg-[#eef4ff] transition p-4 flex items-center gap-3"
          >
            <Icon.Folder width={20} height={20} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#010514]">
                مدیریت محتوای فرانت سایت
              </div>
              <div className="text-xs text-[#010514]/55">
                تصاویر، ویدیو و بنرهای صفحه‌ی عمومی
              </div>
            </div>
          </Link>
          <Link
            href={`/admin/seminars/${encodeURIComponent(seminar.slug)}/member-content`}
            className="rounded-2xl border border-[#e5eaf5] bg-[#f7fafd] hover:border-[#1b3c8a] hover:bg-[#eef4ff] transition p-4 flex items-center gap-3"
          >
            <Icon.Book width={20} height={20} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#010514]">
                مدیریت محتوای پنل خریداران
              </div>
              <div className="text-xs text-[#010514]/55">
                PDF، ویدیو، QR ورود، راهنما، اطلاعیه
              </div>
            </div>
          </Link>
          <Link
            href={`/admin/seminars/${encodeURIComponent(seminar.slug)}/registrations`}
            className="rounded-2xl border border-[#e5eaf5] bg-[#f7fafd] hover:border-[#1b3c8a] hover:bg-[#eef4ff] transition p-4 flex items-center gap-3"
          >
            <Icon.Users width={20} height={20} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#010514]">لیست ثبت‌نام‌ها</div>
              <div className="text-xs text-[#010514]/55">
                اطلاعات شناسنامه‌ای خریداران و QR
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
