import Link from "@/components/SafeLink";
import {
  getCourse,
  listEnrollmentRecordsForUser,
  listLessons,
  listProgressForCourse,
} from "@/lib/db";
import { getSession } from "@/lib/auth";
import { courseLearnHref } from "@/lib/course-links";
import {
  LEVEL_LABELS,
  faDigits,
  formatMinutes,
  formatRelative,
  percent,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const session = (await getSession())!;
  const enrollments = listEnrollmentRecordsForUser(session.userId);

  const rows = enrollments
    .map((e) => {
      const course = getCourse(e.courseSlug);
      if (!course) return null;
      const lessons = listLessons(course.slug);
      const progress = listProgressForCourse(session.userId, course.slug);
      const completed = progress.filter((p) => p.completed).length;
      const total = lessons.length;
      const totalMinutes = Math.round(
        lessons.reduce((s, l) => s + l.videoDurationSec, 0) / 60
      );
      const watchedMinutes = Math.round(
        progress.reduce((s, p) => s + p.watchedSec, 0) / 60
      );
      const pct = percent(completed, total);
      const lastWatchedAt = progress.reduce(
        (m, p) => Math.max(m, p.lastWatchedAt),
        0
      );
      return {
        enrollmentId: e.id,
        enrolledAt: e.enrolledAt,
        source: e.source,
        course,
        isSpotPlayer: !!course.spotPlayerCourseId?.trim(),
        totalLessons: total,
        completedLessons: completed,
        totalMinutes,
        watchedMinutes,
        pct,
        lastWatchedAt,
      };
    })
    .filter((r): r is NonNullable<typeof r> => !!r);

  return (
    <div className="max-w-[1180px] mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
          دوره‌های من
        </h1>
        <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5">
          {rows.length > 0
            ? `${faDigits(rows.length)} دوره در حال یادگیری`
            : "هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید."}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
              <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
            </svg>
          </div>
          <h3 className="font-extrabold text-[#0e1a3d] text-[16px] mb-1.5">
            هنوز دوره‌ای ندارید
          </h3>
          <p className="text-[13px] text-[#0e1a3d]/60 mb-5 max-w-sm mx-auto leading-7">
            با مشاهدهٔ کاتالوگ نامدار آکادمی، اولین دورهٔ خود را انتخاب کنید.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-extrabold text-[14px] hover:opacity-95 transition"
          >
            مشاهدهٔ دوره‌ها
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <Link
              key={r.enrollmentId}
              href={courseLearnHref(
                r.course.slug,
                r.course.externalHref,
                r.course.spotPlayerCourseId
              )}
              className="group block relative overflow-hidden rounded-3xl bg-white border border-[#e5eaf5] shadow-[0_12px_30px_-18px_rgba(14,26,61,0.2)] hover:shadow-[0_18px_40px_-18px_rgba(14,26,61,0.28)] hover:-translate-y-0.5 transition"
            >
              <div className="grid md:grid-cols-[240px_1fr]">
                {/* Thumbnail */}
                <div className="relative aspect-video md:aspect-auto md:min-h-[180px] bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.course.previewImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/70 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-white text-[11px] font-bold">
                    {LEVEL_LABELS[r.course.level]}
                  </span>
                  {r.pct === 100 && (
                    <span
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black text-[#2d1c03] backdrop-blur"
                      style={{
                        background: "linear-gradient(135deg, #fde285, #f7cf5a, #d4a62a)",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      تکمیل شده
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 flex flex-col gap-3 md:gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-black text-[#0e1a3d] text-[16px] md:text-[18px] leading-snug line-clamp-2 group-hover:text-[#1b3c8a] transition">
                        {r.course.title}
                      </h3>
                      <div className="text-[12px] text-[#0e1a3d]/55 mt-1 truncate">
                        مدرس: {r.course.instructor}
                      </div>
                    </div>
                    <span className="shrink-0 hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#eef4ff] text-[#1b3c8a] group-hover:bg-[#1b3c8a] group-hover:text-white transition">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                    </span>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 text-[11.5px]">
                    <Chip>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="13" rx="2" />
                        <circle cx="12" cy="12.5" r="2.4" />
                      </svg>
                      {faDigits(r.totalLessons)} درس
                    </Chip>
                    <Chip>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15 14" />
                      </svg>
                      {r.totalMinutes > 0 ? formatMinutes(r.totalMinutes) : "در حال تدوین"}
                    </Chip>
                    {r.lastWatchedAt > 0 && (
                      <Chip>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 109-9" />
                          <polyline points="3 4 3 12 11 12" />
                        </svg>
                        آخرین مشاهده {formatRelative(r.lastWatchedAt)}
                      </Chip>
                    )}
                    {r.source === "grant" && (
                      <Chip tint="gold">دسترسی اهدایی</Chip>
                    )}
                    {r.isSpotPlayer && <Chip tint="teal">اسپات‌پلیر</Chip>}
                  </div>

                  {/* Progress — for SpotPlayer courses there's no in-site
                      progress, so we surface the license CTA instead. */}
                  {r.isSpotPlayer ? (
                    <div className="mt-auto flex items-center gap-2 text-[13px] font-extrabold text-[#1b3c8a]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="7.5" cy="15.5" r="4.5" />
                        <path d="m10.5 12.5 7-7" />
                        <path d="m15 5 3 3" />
                        <path d="m18 8 2-2" />
                      </svg>
                      مشاهده کد لایسنس و راهنمای فعال‌سازی
                    </div>
                  ) : (
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <span className="text-[#0e1a3d]/65 font-bold">
                          {faDigits(r.completedLessons)} از {faDigits(r.totalLessons)} درس تکمیل شده
                        </span>
                        <span className="text-[#1b3c8a] font-black tabular-nums">
                          {faDigits(r.pct)}٪
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${r.pct}%`,
                            background:
                              r.pct === 100
                                ? "linear-gradient(90deg, #f7cf5a, #d4a62a)"
                                : "linear-gradient(90deg, #1b3c8a, #49bbbd)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  tint = "default",
}: {
  children: React.ReactNode;
  tint?: "default" | "gold" | "teal";
}) {
  const t = {
    default: "bg-[#f4f7fc] text-[#0e1a3d]/70",
    gold: "bg-[#fdf4d4] text-[#8a6a14]",
    teal: "bg-[#e3f6f6] text-[#0d6e70]",
  }[tint];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold ${t}`}
    >
      {children}
    </span>
  );
}
