import Link from "@/components/SafeLink";
import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import {
  getCourse,
  isEnrolled,
  listChapters,
  listLessons,
  listLessonsByChapter,
  listProgressForCourse,
} from "@/lib/db";
import { faDigits, formatSeconds, percent } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function LearnOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/learn/${slug}`);

  const course = getCourse(slug);
  if (!course) notFound();

  // دوره‌های اسپات‌پلیر با پخش‌کننده داخلی ارائه نمی‌شوند؛ کاربر به صفحه
  // کد لایسنس هدایت می‌شود. این بررسی همه ورودی‌ها (لینک مستقیم، دکمه ورود
  // به دوره) را پوشش می‌دهد.
  if (course.spotPlayerCourseId?.trim()) {
    redirect(`/dashboard/license/${slug}`);
  }

  if (!isEnrolled(session.userId, slug) && !isStaff(session)) {
    redirect(`/courses/${slug}?not_enrolled=1`);
  }

  const chapters = listChapters(slug);
  const lessons = listLessons(slug);
  const progress = listProgressForCourse(session.userId, slug);
  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId)
  );
  const completedCount = completedIds.size;
  const total = lessons.length;
  const pct = percent(completedCount, total);

  const firstUnfinished =
    lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];

  return (
    <div className="bg-[#f7fafd] min-h-screen py-8 md:py-12 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <nav className="text-sm text-[#010514]/60 mb-4 flex gap-2">
          <Link href="/dashboard" className="hover:text-[#1b3c8a]">
            داشبورد
          </Link>
          <span>/</span>
          <span className="text-[#010514]">{course.title}</span>
        </nav>

        <div className="bg-gradient-to-l from-[#0f1f4a] via-[#1b3c8a] to-[#136cb5] text-white rounded-3xl p-6 md:p-10 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-white/80 max-w-2xl leading-relaxed mb-6">
            {course.shortDesc}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <div className="text-white/60">پیشرفت شما</div>
              <div className="font-bold mt-1">
                {faDigits(completedCount)} از {faDigits(total)} درس (
                {faDigits(pct)}٪)
              </div>
            </div>
            {firstUnfinished && (
              <Link
                href={`/dashboard/learn/${slug}/${firstUnfinished.id}`}
                className="inline-block px-6 py-3 rounded-full bg-[#f7cf5a] text-[#2d1c03] font-bold hover:brightness-105 transition"
              >
                {completedCount === 0 ? "شروع دوره" : "ادامه یادگیری"} ←
              </Link>
            )}
          </div>

          <div className="mt-6 h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f7cf5a] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {total === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5] text-[#010514]/60">
            هنوز درسی برای این دوره ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-5">
            {chapters.map((ch) => {
              const items = listLessonsByChapter(ch.id);
              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden"
                >
                  <div className="p-5 border-b border-[#eef2f7] font-bold text-[#010514]">
                    {ch.title}
                  </div>
                  <ul>
                    {items.map((l) => {
                      const done = completedIds.has(l.id);
                      return (
                        <li
                          key={l.id}
                          className="border-t border-[#eef2f7] first:border-t-0"
                        >
                          <Link
                            href={`/dashboard/learn/${slug}/${l.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-[#f7fafd] transition"
                          >
                            <span
                              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                                done
                                  ? "bg-green-100 text-green-700"
                                  : "bg-[#eef4ff] text-[#1b3c8a]"
                              }`}
                            >
                              {done ? "✓" : "▶"}
                            </span>
                            <span className="flex-1 text-[#010514]">
                              {l.title}
                            </span>
                            {l.videoDurationSec > 0 && (
                              <span
                                className="text-xs text-[#010514]/50 font-mono"
                                dir="ltr"
                              >
                                {formatSeconds(l.videoDurationSec)}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
