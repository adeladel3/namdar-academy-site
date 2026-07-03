import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getCourse, getLesson } from "@/lib/db";
import { getLessonAnalytics } from "@/lib/analytics";
import { Card, CardHeader } from "@/components/admin/ui";
import StatCard from "@/components/admin/StatCard";
import { Icon } from "@/components/admin/Icons";
import { LineChart } from "@/components/admin/Charts";
import { faDigits, formatSeconds, percent } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function LessonAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const course = getCourse(slug);
  const lesson = getLesson(lessonId);
  if (!course || !lesson || lesson.courseSlug !== slug) notFound();

  const a = getLessonAnalytics(lessonId);

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2 flex-wrap">
        <Link
          href={`/admin/courses/${slug}/analytics`}
          className="hover:text-[#1b3c8a]"
        >
          آنالیتیکس دوره
        </Link>
        <span>/</span>
        <span className="text-[#010514]">{lesson.title}</span>
      </nav>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="بینندگان"
          value={a.viewers}
          icon={<Icon.Eye width={18} height={18} />}
        />
        <StatCard
          label="تکمیل شده"
          value={a.completed}
          hint={`${faDigits(percent(a.completed, Math.max(1, a.viewers)))}٪`}
          icon={<Icon.Check width={18} height={18} />}
        />
        <StatCard
          label="زمان متوسط مشاهده"
          value={formatSeconds(a.avgWatchSec)}
          icon={<Icon.Play width={18} height={18} />}
        />
        <StatCard
          label="مجموع رویدادها"
          value={a.eventsCount}
          icon={<Icon.Chart width={18} height={18} />}
        />
      </div>

      <Card>
        <CardHeader
          title="نمودار Drop-off"
          subtitle={`چند نفر به هر نقطه از ویدیو (در ${faDigits(
            20
          )} نقطه) رسیده‌اند`}
        />
        <div className="p-4">
          {a.dropoff.length === 0 ? (
            <div className="p-8 text-center text-[#010514]/55 text-sm">
              مدت ویدیو در اطلاعات درس ثبت نشده یا هنوز داده‌ای وجود ندارد.
            </div>
          ) : (
            <LineChart
              data={a.dropoff.map((d) => ({
                label: formatSeconds(d.t),
                value: d.viewers,
              }))}
              color="#136cb5"
              height={260}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
