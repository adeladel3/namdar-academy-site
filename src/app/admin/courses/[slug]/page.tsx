import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import {
  getCourse,
  listAllOrders,
  listChapters,
  listEnrollmentRecordsForCourse,
  listLessons,
} from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import StatCard from "@/components/admin/StatCard";
import { Icon } from "@/components/admin/Icons";
import {
  faDigits,
  formatMinutes,
  formatToman,
  formatTomanCompact,
  formatRelative,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const chapters = listChapters(slug);
  const lessons = listLessons(slug);
  const durationMin = Math.ceil(
    lessons.reduce((s, l) => s + l.videoDurationSec, 0) / 60
  );
  const enrolled = listEnrollmentRecordsForCourse(slug);
  const orders = listAllOrders().filter(
    (o) => o.courseSlug === slug && o.status === "paid"
  );
  const revenue = orders.reduce((s, o) => s + o.finalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="دانش‌پذیران"
          value={enrolled.length}
          icon={<Icon.Users width={18} height={18} />}
        />
        <StatCard
          label="درآمد این دوره"
          value={formatTomanCompact(revenue)}
          hint={`${faDigits(orders.length)} فروش موفق`}
          icon={<Icon.Money width={18} height={18} />}
        />
        <StatCard
          label="فصل و درس"
          value={`${faDigits(chapters.length)} / ${faDigits(lessons.length)}`}
          hint="فصل / درس"
          icon={<Icon.Book width={18} height={18} />}
        />
        <StatCard
          label="مدت کل ویدیو"
          value={durationMin > 0 ? formatMinutes(durationMin) : "—"}
          icon={<Icon.Play width={18} height={18} />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="آخرین دانش‌پذیران"
            right={
              <Link
                href={`/admin/courses/${slug}/students`}
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                همه ←
              </Link>
            }
          />
          {enrolled.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز کسی در این دوره ثبت‌نام نکرده است.
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {enrolled.slice(0, 8).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="w-8 h-8 rounded-full bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center font-bold text-xs">
                    ★
                  </span>
                  <span className="flex-1 truncate">
                    کاربر {e.userId.slice(-6)}
                  </span>
                  <span className="text-[11px] text-[#010514]/50">
                    {e.source === "grant"
                      ? "اعطا شده"
                      : e.source === "free"
                      ? "رایگان"
                      : "خرید"}{" "}
                    · {formatRelative(e.enrolledAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="اطلاعات سریع" />
          <div className="p-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#010514]/55">قیمت اصلی</span>
              <span className="font-bold">
                {course.isFree ? "رایگان" : formatToman(course.price)}
              </span>
            </div>
            {course.discountPrice && (
              <div className="flex items-center justify-between">
                <span className="text-[#010514]/55">قیمت با تخفیف</span>
                <span className="font-bold text-[#1b3c8a]">
                  {formatToman(course.discountPrice)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[#010514]/55">قابلیت خرید</span>
              <span className="font-bold">
                {course.allowPurchase ? "فعال" : "غیرفعال"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#010514]/55">ایجاد شده</span>
              <span>{formatRelative(course.createdAt)}</span>
            </div>
            {course.publishedAt && (
              <div className="flex items-center justify-between">
                <span className="text-[#010514]/55">منتشر شده</span>
                <span>{formatRelative(course.publishedAt)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
