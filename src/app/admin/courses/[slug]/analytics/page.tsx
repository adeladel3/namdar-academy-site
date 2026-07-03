import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import {
  getCourse,
  listChapters,
  listEnrollmentRecordsForCourse,
  listLessons,
  listLessonsByChapter,
  listProgressForCourse,
  listProgressForLesson,
} from "@/lib/db";
import { getLessonAnalytics } from "@/lib/analytics";
import { Card, CardHeader } from "@/components/admin/ui";
import { Donut } from "@/components/admin/Charts";
import StatCard from "@/components/admin/StatCard";
import { Icon } from "@/components/admin/Icons";
import {
  faDigits,
  formatSeconds,
  percent,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const chapters = listChapters(slug);
  const lessons = listLessons(slug);
  const enrollments = listEnrollmentRecordsForCourse(slug);

  const totalViewers = new Set(
    lessons.flatMap((l) => listProgressForLesson(l.id).map((p) => p.userId))
  ).size;

  // Aggregate completion rate across all lessons/users
  let totalCompletions = 0;
  let totalPossible = 0;
  for (const e of enrollments) {
    const p = listProgressForCourse(e.userId, slug);
    totalCompletions += p.filter((x) => x.completed).length;
    totalPossible += lessons.length;
  }
  const completionRate = percent(totalCompletions, totalPossible);

  const totalWatchSec = lessons.reduce(
    (s, l) =>
      s +
      listProgressForLesson(l.id).reduce((acc, p) => acc + p.watchedSec, 0),
    0
  );

  const perLesson = lessons.map((l) => {
    const a = getLessonAnalytics(l.id);
    return { lesson: l, ...a };
  });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="کل بینندگان"
          value={totalViewers}
          icon={<Icon.Eye width={18} height={18} />}
        />
        <StatCard
          label="نرخ تکمیل کل"
          value={`${faDigits(completionRate)}٪`}
          icon={<Icon.Check width={18} height={18} />}
        />
        <StatCard
          label="مجموع زمان مشاهده"
          value={formatSeconds(totalWatchSec)}
          icon={<Icon.Play width={18} height={18} />}
        />
        <StatCard
          label="ثبت‌نام فعلی"
          value={enrollments.length}
          icon={<Icon.Users width={18} height={18} />}
        />
      </div>

      {chapters.map((ch) => {
        const items = listLessonsByChapter(ch.id);
        return (
          <Card key={ch.id}>
            <CardHeader
              title={ch.title}
              subtitle={`${faDigits(items.length)} درس`}
            />
            <div className="divide-y divide-[#eef2f7]">
              {items.map((l) => {
                const a = perLesson.find((x) => x.lesson.id === l.id);
                if (!a) return null;
                return (
                  <Link
                    key={l.id}
                    href={`/admin/courses/${slug}/analytics/lesson/${l.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-[#f7fafd] transition"
                  >
                    <Donut
                      value={Math.round(a.completionRate * 100)}
                      max={100}
                      size={48}
                      strokeWidth={6}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#010514] truncate">
                        {l.title}
                      </div>
                      <div className="text-xs text-[#010514]/55 flex items-center gap-3 mt-0.5">
                        <span>{faDigits(a.viewers)} بیننده</span>
                        <span>{faDigits(a.completed)} اتمام</span>
                        <span>زمان متوسط: {formatSeconds(a.avgWatchSec)}</span>
                      </div>
                    </div>
                    <Icon.ChevronLeft
                      width={16}
                      height={16}
                      className="text-[#010514]/40"
                    />
                  </Link>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
