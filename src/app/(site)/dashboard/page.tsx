import Link from "@/components/SafeLink";
import {
  getCourse,
  getLesson,
  listChapters,
  listEnrollments,
  listLessons,
  listLessonsByChapter,
  listOrdersByUser,
  listProgressForCourse,
  listProgressForUser,
  type OrderRecord,
} from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  faDigits,
  formatDateTime,
  formatToman,
  percent,
  USER_ROLE_LABELS,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = (await getSession())!;
  const sp = await searchParams;
  const payment = sp.payment;
  const orderId = sp.order;
  const reason = sp.reason;

  const enrolledSlugs = listEnrollments(session.userId);
  const enrolledCourses = enrolledSlugs
    .map((slug) => getCourse(slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const myOrders: OrderRecord[] = listOrdersByUser(session.userId);
  const paidOrders = myOrders.filter((o) => o.status === "paid");

  const allProgress = listProgressForUser(session.userId);
  const completedLessonsCount = allProgress.filter((p) => p.completed).length;
  const totalWatchedMin = Math.round(
    allProgress.reduce((s, p) => s + p.watchedSec, 0) / 60
  );

  // Continue-learning: most recently watched lesson (not yet completed if possible)
  const sortedProgress = [...allProgress].sort(
    (a, b) => b.lastWatchedAt - a.lastWatchedAt
  );
  const continueCandidate =
    sortedProgress.find((p) => !p.completed) ?? sortedProgress[0] ?? null;

  let continueLesson: {
    courseSlug: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
    progressPct: number;
    previewImage: string;
  } | null = null;

  if (continueCandidate) {
    const lesson = getLesson(continueCandidate.lessonId);
    const course = getCourse(continueCandidate.courseSlug);
    if (lesson && course) {
      const pct = lesson.videoDurationSec
        ? percent(
            continueCandidate.maxPositionSec,
            lesson.videoDurationSec
          )
        : continueCandidate.completed
        ? 100
        : 0;
      continueLesson = {
        courseSlug: course.slug,
        courseTitle: course.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        progressPct: pct,
        previewImage: course.previewImage,
      };
    }
  }

  // If no progress yet, fall back to first lesson of the first enrolled course
  if (!continueLesson && enrolledCourses.length > 0) {
    const firstCourse = enrolledCourses[0];
    const chapters = listChapters(firstCourse.slug);
    const firstLesson = chapters
      .flatMap((ch) => listLessonsByChapter(ch.id))
      .find(Boolean);
    if (firstLesson) {
      continueLesson = {
        courseSlug: firstCourse.slug,
        courseTitle: firstCourse.title,
        lessonId: firstLesson.id,
        lessonTitle: firstLesson.title,
        progressPct: 0,
        previewImage: firstCourse.previewImage,
      };
    }
  }

  // Course progress summary (for first 4 courses shown)
  const coursesWithProgress = enrolledCourses.slice(0, 4).map((c) => {
    const lessons = listLessons(c.slug);
    const progress = listProgressForCourse(session.userId, c.slug);
    const completed = progress.filter((p) => p.completed).length;
    const total = lessons.length;
    return {
      course: c,
      totalLessons: total,
      completedLessons: completed,
      pct: percent(completed, total),
    };
  });

  const recentOrders = myOrders.slice(0, 3);

  return (
    <div className="max-w-[1180px] mx-auto space-y-6 md:space-y-8">
      {/* ───────── Hero ───────── */}
      <section
        className="relative overflow-hidden rounded-[1.75rem] p-6 md:p-8 text-white"
        style={{
          background:
            "linear-gradient(120deg, #0b4a7a 0%, #1b3c8a 45%, #136cb5 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-64 h-64 rounded-full opacity-40 blur-[90px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #f7cf5a, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-25 blur-[90px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #49bbbd, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[11px] tracking-[0.2em] font-bold text-[#f7cf5a] mb-1.5">
              WELCOME BACK
            </div>
            <h1 className="text-2xl md:text-3xl font-black leading-tight">
              سلام {session.name}
            </h1>
            <p className="text-white/80 text-sm md:text-[15px] mt-2 leading-8 max-w-xl">
              به پنل شخصی نامدار آکادمی خوش آمدید. ادامهٔ مسیر یادگیری‌تان از اینجا شروع می‌شود.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-white/15 border border-white/25 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7]" />
              {USER_ROLE_LABELS[session.role]}
            </span>
          </div>
        </div>
      </section>

      {/* ───────── Payment banners ───────── */}
      {payment === "success" && orderId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
          <div className="text-[14px] leading-7 font-bold">
            پرداخت شما با موفقیت انجام شد. دوره به حساب شما اضافه شد.
          </div>
        </div>
      )}
      {payment === "failed" && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div className="text-[14px] leading-7 font-bold">
            پرداخت ناموفق بود
            {reason ? ` — ${decodeURIComponent(reason)}` : ""}. اگر مبلغی کسر شده باشد، طی ۷۲ ساعت برگشت داده می‌شود.
          </div>
        </div>
      )}

      {/* ───────── Stats ───────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="دوره‌های من"
          value={faDigits(enrolledCourses.length)}
          tint="blue"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
              <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
            </svg>
          }
        />
        <StatCard
          label="دقیقه تماشا"
          value={faDigits(totalWatchedMin)}
          tint="teal"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          }
        />
        <StatCard
          label="درس تکمیل شده"
          value={faDigits(completedLessonsCount)}
          tint="gold"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="سفارش موفق"
          value={faDigits(paidOrders.length)}
          tint="navy"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          }
        />
      </section>

      {/* ───────── Continue learning ───────── */}
      {continueLesson && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-black text-[#0e1a3d]">
              ادامهٔ یادگیری
            </h2>
          </div>
          <Link
            href={`/dashboard/learn/${continueLesson.courseSlug}/${continueLesson.lessonId}`}
            className="group block relative overflow-hidden rounded-3xl bg-white border border-[#e5eaf5] shadow-[0_16px_40px_-20px_rgba(14,26,61,0.22)] hover:shadow-[0_22px_50px_-22px_rgba(14,26,61,0.3)] transition"
          >
            <div className="grid md:grid-cols-[320px_1fr]">
              <div className="relative aspect-[16/9] md:aspect-auto md:h-full bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] overflow-hidden">
                {continueLesson.previewImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={continueLesson.previewImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/80 via-[#0e1a3d]/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#f7cf5a]/25 border border-[#f7cf5a]/60 backdrop-blur flex items-center justify-center shadow-[0_0_30px_-5px_#f7cf5a] group-hover:scale-110 transition">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#f7cf5a">
                      <polygon points="8 5 19 12 8 19 8 5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-7 flex flex-col gap-3">
                <div className="text-[11px] tracking-[0.18em] font-bold text-[#1b3c8a]">
                  ادامه از {continueLesson.courseTitle}
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-[#0e1a3d] leading-snug">
                  {continueLesson.lessonTitle}
                </h3>

                <div>
                  <div className="flex items-center justify-between text-[12px] text-[#0e1a3d]/65 mb-1.5">
                    <span className="font-bold">پیشرفت این درس</span>
                    <span className="font-black text-[#1b3c8a] tabular-nums">
                      {faDigits(continueLesson.progressPct)}٪
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef2f7] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${continueLesson.progressPct}%`,
                        background:
                          "linear-gradient(90deg, #f7cf5a, #d4a62a)",
                      }}
                    />
                  </div>
                </div>

                <div className="mt-auto pt-3 flex items-center gap-2 text-[13px] font-extrabold text-[#1b3c8a] group-hover:text-[#0e1a3d] transition">
                  ادامهٔ این درس
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ───────── Enrolled courses preview ───────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-black text-[#0e1a3d]">
            دوره‌های من
          </h2>
          {enrolledCourses.length > 0 && (
            <Link
              href="/dashboard/courses"
              className="text-[13px] font-extrabold text-[#1b3c8a] hover:text-[#0e1a3d] inline-flex items-center gap-1.5 transition"
            >
              مشاهدهٔ همه
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <EmptyState
            title="هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید"
            body="با مشاهدهٔ کاتالوگ، اولین دوره‌تان را انتخاب کنید."
            ctaLabel="مشاهدهٔ دوره‌ها"
            ctaHref="/courses"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coursesWithProgress.map((row) => (
              <CoursePreviewCard key={row.course.slug} {...row} />
            ))}
          </div>
        )}
      </section>

      {/* ───────── Recent orders ───────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-black text-[#0e1a3d]">
            سفارش‌های اخیر
          </h2>
          {myOrders.length > 0 && (
            <Link
              href="/dashboard/orders"
              className="text-[13px] font-extrabold text-[#1b3c8a] hover:text-[#0e1a3d] inline-flex items-center gap-1.5 transition"
            >
              مشاهدهٔ همه
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
        </div>

        {myOrders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-[#e5eaf5] text-center text-[#0e1a3d]/55 text-[14px]">
            هنوز سفارشی ثبت نشده.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((o) => {
              const course = getCourse(o.courseSlug);
              return (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl border border-[#e5eaf5] p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-[#0e1a3d] text-[14px] truncate">
                      {course?.title ?? o.courseSlug}
                    </div>
                    <div className="text-[12px] text-[#0e1a3d]/55 mt-1">
                      {formatDateTime(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-extrabold text-[#0e1a3d] text-[14px] tabular-nums">
                      {formatToman(o.finalAmount)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${ORDER_STATUS_COLORS[o.status]}`}
                    >
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* ══════════════ helpers ══════════════ */

function StatCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tint: "blue" | "teal" | "gold" | "navy";
}) {
  const tintMap = {
    blue: {
      ring: "border-[#dbe7fb]",
      bubble: "bg-[#eaf1fc] text-[#1b3c8a]",
    },
    teal: {
      ring: "border-[#cfeeef]",
      bubble: "bg-[#e0f5f6] text-[#0e8a8c]",
    },
    gold: {
      ring: "border-[#f5e1a1]",
      bubble: "bg-[#fdf4d4] text-[#8a6a14]",
    },
    navy: {
      ring: "border-[#dbe7fb]",
      bubble: "bg-[#e1e6f1] text-[#0e1a3d]",
    },
  }[tint];

  return (
    <div
      className={`bg-white rounded-2xl border ${tintMap.ring} p-4 md:p-5 flex items-center gap-3 md:gap-4`}
    >
      <div
        className={`shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl ${tintMap.bubble} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] md:text-[12px] text-[#0e1a3d]/60 font-bold mb-0.5 truncate">
          {label}
        </div>
        <div className="text-xl md:text-2xl font-black text-[#0e1a3d] tabular-nums leading-none">
          {value}
        </div>
      </div>
    </div>
  );
}

function CoursePreviewCard({
  course,
  totalLessons,
  completedLessons,
  pct,
}: {
  course: { slug: string; title: string; previewImage: string; instructor: string };
  totalLessons: number;
  completedLessons: number;
  pct: number;
}) {
  return (
    <Link
      href={`/dashboard/learn/${course.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-[#e5eaf5] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(14,26,61,0.25)] transition"
    >
      <div className="relative aspect-video bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.previewImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/70 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-black/55 backdrop-blur text-white text-[10px] font-bold tabular-nums">
          {faDigits(completedLessons)}/{faDigits(totalLessons)} درس
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-extrabold text-[#0e1a3d] text-[14px] leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#1b3c8a] transition">
          {course.title}
        </h3>
        <div className="text-[11.5px] text-[#0e1a3d]/55 mt-1 truncate">
          مدرس: {course.instructor}
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[#0e1a3d]/65 font-bold">پیشرفت</span>
            <span className="text-[#1b3c8a] font-black tabular-nums">
              {faDigits(pct)}٪
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#eef2f7] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #1b3c8a, #49bbbd)",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="p-8 md:p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
          <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
        </svg>
      </div>
      <h3 className="font-extrabold text-[#0e1a3d] text-[15px] mb-1.5">
        {title}
      </h3>
      <p className="text-[13px] text-[#0e1a3d]/60 mb-5 max-w-sm mx-auto leading-7">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1b3c8a] text-white font-extrabold text-[13.5px] hover:opacity-95 transition"
      >
        {ctaLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}
