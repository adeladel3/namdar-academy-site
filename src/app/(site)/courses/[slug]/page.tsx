import type { Metadata } from "next";
import Link from "@/components/SafeLink";
import { notFound, redirect } from "next/navigation";
import {
  getCourse,
  getCourseRating,
  isEnrolled,
  listChapters,
  listCourses,
  listLessons,
  listLessonsByChapter,
} from "@/lib/db";
import { getSession, isStaff } from "@/lib/auth";
import {
  LEVEL_LABELS,
  faDigits,
  formatMinutes,
  formatToman,
} from "@/lib/formatting";
import EnrollButton from "./EnrollButton";
import CourseReviewsSection from "@/components/CourseReviewsSection";
import RelatedCourses from "@/components/RelatedCourses";
import PreviewVideoButton from "@/components/PreviewVideoButton";
import FloatingSupportDock from "@/components/FloatingSupportDock";
import ExpandableProse from "@/components/ExpandableProse";
import {
  absUrl,
  breadcrumbJsonLd,
  courseJsonLd,
  SITE,
} from "@/lib/seo";

export function generateStaticParams() {
  return listCourses().map((c) => ({ slug: c.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "mon") {
    return { alternates: { canonical: "/coaching" } };
  }
  const course = getCourse(slug);
  if (!course) return { title: "دوره پیدا نشد" };
  const title = course.title;
  const description = course.shortDesc || course.longDesc?.slice(0, 160) || SITE.description;
  const image = course.previewImage ? absUrl(course.previewImage) : SITE.ogImage;
  return {
    title,
    description,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/courses/${slug}`,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Static content shared by every course page — mirrors coaching's cadence
// (benefits / faq / topics) so the visual template stays consistent.
// ─────────────────────────────────────────────────────────────────────────

const COURSE_BENEFITS: {
  title: string;
  body: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "دسترسی مادام‌العمر",
    body: "یک‌بار ثبت‌نام، استفادهٔ همیشگی از ویدیوها، جزوه‌ها و آپدیت‌های آینده.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: "پشتیبانی ۲۴ ساعته",
    body: "تیم پشتیبانی نامدار آکادمی همهٔ سؤالات آموزشی و فنی شما را پاسخ می‌دهد.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0118 0v6a2 2 0 01-2 2h-1v-7h3" />
        <path d="M3 18V12h3v8H5a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "گواهی پایان دوره",
    body: "پس از اتمام دوره، گواهی معتبر دیجیتال از نامدار آکادمی دریافت می‌کنید.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M9 13l-2 8 5-3 5 3-2-8" />
      </svg>
    ),
  },
  {
    title: "آپدیت مادام‌العمر محتوا",
    body: "با تغییر شرایط بازار، محتوا به‌روزرسانی می‌شود و شما رایگان به نسخه‌های جدید دسترسی دارید.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
  },
  {
    title: "گروه اختصاصی دانش‌پذیران",
    body: "دسترسی به انجمن آنلاین، هم‌مسیری با سایر دانش‌پذیران و شیر شدن تحلیل‌ها.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "ضمانت بازگشت وجه",
    body: "در صورت عدم رضایت از محتوای دوره در ۷ روز ابتدایی، کل مبلغ عودت داده می‌شود.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

const COURSE_FAQ: { q: string; a: string }[] = [
  {
    q: "آیا این دوره برای افراد مبتدی مناسب است؟",
    a: "سطح هر دوره در بخش «مدرس و مشخصات» قید شده. اگر سطح «مقدماتی» یا «پایه تا پیشرفته» باشد، نیازی به پیش‌زمینه ندارید. برای دوره‌های پیشرفته داشتن دانش اولیه بازارهای مالی توصیه می‌شود.",
  },
  {
    q: "چه مدت به محتوای دوره دسترسی خواهم داشت؟",
    a: "دسترسی به تمامی ویدیوها، جزوات و آپدیت‌های آینده به صورت مادام‌العمر برای شما فعال خواهد بود.",
  },
  {
    q: "آیا گواهی پایان دوره صادر می‌شود؟",
    a: "بله. پس از مشاهدهٔ کامل درس‌ها، گواهی دیجیتال معتبر نامدار آکادمی با کد رهگیری یکتا برای شما صادر می‌شود.",
  },
  {
    q: "امکان پرداخت اقساطی وجود دارد؟",
    a: "برای دوره‌های بالای ۱۰ میلیون تومان امکان پرداخت در ۳ یا ۶ قسط از طریق درگاه بانکی معتبر فراهم است. برای هماهنگی با پشتیبانی تماس بگیرید.",
  },
  {
    q: "اگر از دوره راضی نبودم چه می‌شود؟",
    a: "تا ۷ روز پس از خرید و در صورت عدم رضایت، با تیم پشتیبانی در تماس باشید؛ کل مبلغ بدون پرسش و پاسخ عودت داده می‌شود.",
  },
  {
    q: "پشتیبانی آموزشی چگونه است؟",
    a: "تیم آموزشی نامدار آکادمی به‌صورت ۲۴ ساعته پاسخگوی سؤالات شماست. همچنین دسترسی به گروه اختصاصی دانش‌پذیران برای هم‌فکری با سایر افراد فراهم است.",
  },
];

const HERO_BUBBLES: {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "intro",
    label: "معرفی",
    href: "#about-course",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "syllabus",
    label: "سرفصل‌ها",
    href: "#curriculum-detail",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" />
        <path d="M4 17.5A2.5 2.5 0 016.5 15H20" />
      </svg>
    ),
  },
  {
    id: "benefits",
    label: "مزیت‌ها",
    href: "#benefits",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5-5.5-3-5.5 3 1-6.5L3 8.8 9 8z" />
      </svg>
    ),
  },
  {
    id: "pricing",
    label: "قیمت و ثبت‌نام",
    href: "#pricing",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    id: "faq",
    label: "سؤالات متداول",
    href: "#course-faq",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 4" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "instructor",
    label: "مدرس",
    href: "#meet-instructor",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      </svg>
    ),
  },
  {
    id: "reviews",
    label: "نظرات",
    href: "#reviews",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12a8 8 0 10-14.9 4l-1.1 4 4-1.1A8 8 0 0020 12z" />
      </svg>
    ),
  },
  {
    id: "register",
    label: "ثبت‌نام",
    href: "#register",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
      </svg>
    ),
  },
];

/**
 * Split legacy HTML by <h2> so each heading and its following siblings
 * become one self-contained `<section class="about-chunk">`. When laid
 * out in a grid, each chunk stays together — unlike CSS columns which
 * let headings drift away from their own lists.
 *
 * Anything before the first <h2> is wrapped in its own leading chunk so
 * intro prose isn't orphaned.
 */
function groupHtmlByH2(html: string): string {
  // Split on <h2 …>…</h2>, keeping the delimiter. Case-insensitive; the
  // legacy CMS sometimes emits <H2>.
  const parts = html.split(/(<h2\b[^>]*>[\s\S]*?<\/h2>)/i);
  if (parts.length <= 1) {
    return `<section class="about-chunk">${html}</section>`;
  }

  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(`<section class="about-chunk">${trimmed}</section>`);
    current = "";
  };

  for (const part of parts) {
    if (/^<h2\b/i.test(part)) {
      flush();
      current = part;
    } else {
      current += part;
    }
  }
  flush();

  return chunks.join("");
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  // Courses that live on their own landing page (e.g. MON → /coaching) skip
  // the generic detail template entirely.
  if (course.externalHref) redirect(course.externalHref);

  const chapters = listChapters(slug);
  const allLessons = listLessons(slug);
  const totalMinutes = Math.ceil(
    allLessons.reduce((s, l) => s + l.videoDurationSec, 0) / 60
  );
  const rating = getCourseRating(slug);
  const session = await getSession();
  const userEnrolled = session ? isEnrolled(session.userId, slug) : false;
  const canReview = !!(session && (userEnrolled || isStaff(session)));

  // The About section accepts either plain text (split on blank lines) or
  // raw HTML (legacy-imported courses keep markup from the old CMS). Detect
  // HTML by the first '<' and hand it to dangerouslySetInnerHTML; otherwise
  // split into paragraphs so each blank line becomes a <p>.
  const longDescIsHtml = course.longDesc.includes("<");
  const introParagraphs = longDescIsHtml
    ? []
    : course.longDesc
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

  // Wrap each <h2> and the content that follows it (until the next <h2>) in
  // a <section class="about-chunk">. This lets us lay sections out in a CSS
  // grid so each heading always stays visually attached to its own list —
  // CSS multi-column flow couldn't guarantee that because siblings spill
  // freely between columns.
  const longDescHtmlGrouped = longDescIsHtml
    ? groupHtmlByH2(course.longDesc)
    : "";

  // Derive 6 curriculum "key topics" from chapters (or a generic set)
  const keyTopics: { label: string; icon: React.ReactNode }[] =
    chapters.length >= 6
      ? chapters.slice(0, 6).map((c, i) => ({
          label: c.title,
          icon: <TopicIcon idx={i} />,
        }))
      : [
          { label: "مبانی اولیه", icon: <TopicIcon idx={0} /> },
          { label: "مفاهیم پیشرفته", icon: <TopicIcon idx={1} /> },
          { label: "تمرین عملی", icon: <TopicIcon idx={2} /> },
          { label: "مطالعات موردی", icon: <TopicIcon idx={3} /> },
          { label: "منابع مکمل", icon: <TopicIcon idx={4} /> },
          { label: "پشتیبانی آموزشی", icon: <TopicIcon idx={5} /> },
        ];

  const jsonLd = [
    courseJsonLd({
      slug: course.slug,
      title: course.title,
      shortDesc: course.shortDesc,
      previewImage: course.previewImage,
      price: course.price,
      isFree: course.isFree,
      instructor: course.instructor,
      studentsCount: course.studentsCount,
      rating: rating && rating.count > 0 ? rating : null,
    }),
    breadcrumbJsonLd([
      { name: "خانه", url: "/" },
      { name: "دوره‌ها", url: "/courses" },
      { name: course.title, url: `/courses/${course.slug}` },
    ]),
  ];

  return (
    <div className="bg-[#f7fafd] min-h-screen" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ═════════════════ HERO ═════════════════
          Mirrors CoachingHero: sky→blue gradient, breadcrumb, title, meta,
          and 8 glass nav bubbles that smooth-scroll to in-page anchors. */}
      <section
        id="intro"
        className="relative overflow-hidden bg-gradient-to-l from-[#0b4a7a] via-[#1d88d1] to-[#64b5f6] text-white scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #f7cf5a 0, transparent 40%), radial-gradient(circle at 85% 80%, #49bbbd 0, transparent 45%)",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16 min-h-[560px] md:min-h-[720px] flex flex-col">
          <nav className="text-white/70 text-sm mb-6 flex gap-2">
            <Link href="/" className="hover:text-white transition">خانه</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white transition">دوره‌ها</Link>
            <span>/</span>
            <span className="text-white truncate">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm">
                  سطح {LEVEL_LABELS[course.level]}
                </span>
                {course.badge && (
                  <span className="px-3 py-1 rounded-full bg-[#f7cf5a] text-[#2d1c03] text-sm font-bold">
                    {course.badge}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-white/85 text-base md:text-lg leading-8 md:leading-9 max-w-2xl">
                {course.shortDesc}
              </p>

              {rating.count > 0 && (
                <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-[#f7cf5a]/30">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(rating.avg) ? "#f7cf5a" : "rgba(255,255,255,0.25)"}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#f7cf5a]">{faDigits(rating.avg.toFixed(1))}</span>
                  <span className="text-xs text-white/75">({faDigits(rating.count)} نظر)</span>
                </div>
              )}

              <div className="flex flex-wrap gap-6 mt-8 text-sm">
                <div>
                  <div className="text-white/60">مدرس</div>
                  <div className="font-bold mt-1">{course.instructor}</div>
                </div>
                <div>
                  <div className="text-white/60">مدت دوره</div>
                  <div className="font-bold mt-1">
                    {totalMinutes > 0 ? formatMinutes(totalMinutes) : "در حال تدوین"}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">تعداد درس</div>
                  <div className="font-bold mt-1">{faDigits(allLessons.length)}</div>
                </div>
                {!course.hideStudentsCount && (
                  <div>
                    <div className="text-white/60">دانش‌پذیران</div>
                    <div className="font-bold mt-1">{faDigits(course.studentsCount)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8 glass nav bubbles — same shape as coaching hero */}
          <div className="mt-auto pt-12 md:pt-16">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6 justify-items-center">
              {HERO_BUBBLES.map((b) => (
                <a
                  key={b.id}
                  href={b.href}
                  aria-label={b.label}
                  className="group relative flex flex-col items-center focus:outline-none"
                >
                  <div
                    className="relative w-[76px] h-[76px] md:w-[92px] md:h-[92px] rounded-full transition-all duration-500 ease-out group-hover:scale-[1.12] group-hover:-translate-y-1.5 will-change-transform"
                    style={{
                      background:
                        "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 38%), radial-gradient(circle at 78% 28%, rgba(255,180,220,0.38) 0%, transparent 45%), radial-gradient(circle at 70% 78%, rgba(120,220,255,0.48) 0%, transparent 48%), radial-gradient(circle at 30% 75%, rgba(255,220,150,0.32) 0%, transparent 50%), rgba(255,255,255,0.08)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.45)",
                      boxShadow:
                        "inset 0 0 26px rgba(255,255,255,0.22), 0 14px 32px -8px rgba(10,40,80,0.45), 0 0 18px rgba(255,255,255,0.18)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        left: "20%", top: "14%", width: "32%", height: "22%",
                        background: "radial-gradient(ellipse, rgba(255,255,255,0.85), rgba(255,255,255,0) 65%)",
                        filter: "blur(2px)",
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_5px_rgba(10,40,80,0.45)] transition-transform duration-500 group-hover:scale-110">
                      {b.icon}
                    </span>
                  </div>
                  <span className="mt-3 text-[11px] md:text-[13px] text-white/85 group-hover:text-white font-bold transition-colors whitespace-nowrap">
                    {b.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ BANNER ═════════════════ */}
      {/* Previously faded into #0e1a3d (dark navy) at the bottom, which
          looked like the start of a footer. Now it dissolves into the light
          blue of the About section (#dceefd) for a seamless continuation. */}
      <section className="relative bg-gradient-to-b from-[#64b5f6] via-[#a7d3f4] to-[#dceefd]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-2 md:pt-4 pb-10 md:pb-14">
          <div className="relative rounded-[1.75rem] overflow-hidden border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] aspect-[16/6] md:aspect-[16/5] bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#49bbbd]">
            {course.previewImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={course.previewImage}
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-5 bottom-4 md:inset-x-8 md:bottom-6 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 border border-white/15 backdrop-blur text-[11px] md:text-xs text-white/90 font-bold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f7cf5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                    {course.title}
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 text-center">
                <div className="text-base font-bold">بنر دوره</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═════════════════ ABOUT ═════════════════ */}
      <section
        id="about-course"
        className="relative bg-[#dceefd] text-[#010514] scroll-mt-24 overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute top-10 right-[-120px] w-[420px] h-[420px] rounded-full opacity-[0.30] blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-10 left-[-120px] w-[380px] h-[380px] rounded-full opacity-[0.28] blur-[110px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
        />

        <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mb-10 md:mb-12">
            <Eyebrow>ABOUT THE COURSE</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight text-[#0e1a3d]">
              دربارهٔ دورهٔ {course.title}
            </h2>
            <div className="mt-5 h-[3px] w-24 rounded-full bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a] shadow-[0_0_18px_rgba(247,207,90,0.55)]" />
          </div>

          <div className="flex flex-col gap-10 lg:gap-12 items-stretch">
            {/* Preview banner — full-width so the About text underneath can
                span the whole container and flow horizontally in 2–3
                columns instead of a single narrow stack. */}
            <div className="relative mx-auto w-full max-w-[820px]">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#f7cf5a]/40 via-[#d4a62a]/15 to-[#49bbbd]/40 blur-2xl opacity-70"
              />
              <div className="relative rounded-[1.75rem] overflow-hidden border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] aspect-video bg-black group">
                {course.previewImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={course.previewImage}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />

                {course.previewVideoUrl ? (
                  <PreviewVideoButton videoUrl={course.previewVideoUrl} title={course.title} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#f7cf5a]/25 backdrop-blur-md border border-[#f7cf5a]/60 flex items-center justify-center shadow-[0_0_40px_-5px_#f7cf5a]">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="#f7cf5a">
                        <polygon points="8 5 19 12 8 19 8 5" />
                      </svg>
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-5 bottom-5">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#f7cf5a]/30 backdrop-blur text-[11px] md:text-xs text-[#f7cf5a] font-bold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                    پیش‌نمایش دوره
                  </span>
                </div>
              </div>
            </div>

            {/* About card — wraps the description so legacy HTML and
                plain-text courses share one polished frame. Full-width
                with multi-column flow so long descriptions don't turn
                into a tall narrow scroll. */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-[#1b3c8a]/10 via-transparent to-[#49bbbd]/10 blur-xl opacity-60"
              />
              <article className="relative rounded-[1.5rem] bg-white border border-[#e5eaf5] shadow-[0_18px_50px_-18px_rgba(14,26,61,0.18)] p-7 md:p-10">
                <div
                  aria-hidden
                  className="absolute right-0 top-8 h-16 w-[3px] rounded-l-full bg-gradient-to-b from-[#1b3c8a] via-[#136cb5] to-[#49bbbd]"
                />
                <ExpandableProse collapsedHeight={260} fadeColor="rgba(255,255,255,1)">
                  {longDescIsHtml ? (
                    <div
                      className={[
                        "prose prose-lg max-w-none text-[#010514]/85",
                        // Grid of self-contained chunks (each chunk is an
                        // <h2> + its following siblings). Grid keeps each
                        // heading glued to its own list — unlike CSS columns
                        // which let siblings spill freely between columns.
                        "[&>.about-chunk]:mb-0",
                        "grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-2",
                        "prose-p:leading-[2] prose-p:text-justify prose-p:text-[#010514]/80 prose-p:mb-4",
                        "prose-headings:text-[#0e1a3d] prose-headings:font-extrabold prose-headings:tracking-tight",
                        "prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-5",
                        "prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-0 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-[#eef2f7]",
                        "prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-[#1b3c8a]",
                        "prose-strong:text-[#0e1a3d] prose-strong:font-bold",
                        "prose-a:text-[#1b3c8a] prose-a:no-underline hover:prose-a:underline",
                        "prose-ul:my-3 prose-ol:my-3 prose-li:my-1.5 prose-li:leading-8",
                        "prose-li:marker:text-[#1b3c8a] prose-li:marker:font-bold",
                        "prose-blockquote:border-r-4 prose-blockquote:border-r-[#1b3c8a]/30 prose-blockquote:border-l-0 prose-blockquote:bg-[#f7fafd] prose-blockquote:rounded-lg prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-[#0e1a3d]/80",
                        "prose-img:rounded-xl prose-img:shadow-md",
                        "prose-hr:border-[#eef2f7]",
                      ].join(" ")}
                      dangerouslySetInnerHTML={{ __html: longDescHtmlGrouped }}
                    />
                  ) : (
                    <div className="text-[#010514]/85 leading-[2] text-base md:text-lg text-justify grid gap-x-10 gap-y-5 md:grid-cols-2 [&>p]:mb-0">
                      {introParagraphs.length > 0
                        ? introParagraphs.map((p, i) => <p key={i}>{p}</p>)
                        : <p>{course.shortDesc}</p>}
                    </div>
                  )}
                </ExpandableProse>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ CURRICULUM DETAIL ═════════════════ */}
      {chapters.length > 0 && (
        <section
          id="curriculum-detail"
          className="relative bg-[#dceefd] text-[#010514] scroll-mt-24 overflow-hidden"
        >
          <div
            aria-hidden
            className="absolute top-20 right-[-100px] w-[420px] h-[420px] rounded-full opacity-[0.30] blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute bottom-20 left-[-100px] w-[380px] h-[380px] rounded-full opacity-[0.28] blur-[110px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
          />

          <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-10 md:mb-14">
              <Eyebrow>CURRICULUM DETAIL</Eyebrow>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
                سرفصل‌ها و ساختار دوره
              </h2>
              <p className="text-[#010514]/65 max-w-2xl mx-auto text-sm md:text-base leading-7">
                {faDigits(chapters.length)} فصل و {faDigits(allLessons.length)} درس ویدیویی — از مفاهیم پایه تا تکنیک‌های پیشرفته.
              </p>
            </div>

            <div className="grid lg:grid-cols-[420px_1fr] gap-6 lg:gap-10 items-start">
              {/* Key topics card */}
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-[#f7cf5a]/30 via-[#d4a62a]/10 to-[#49bbbd]/30 blur-2xl opacity-60"
                />
                <div className="relative rounded-3xl bg-gradient-to-br from-[#1b3c8a] via-[#1d5fa3] to-[#136cb5] border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] p-6 md:p-7 overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#f7cf5a]/15 blur-3xl pointer-events-none"
                  />
                  <div className="relative flex items-center justify-center gap-2 mb-6 text-center">
                    <span className="text-3xl md:text-4xl font-black text-[#f7cf5a] drop-shadow-[0_0_12px_rgba(247,207,90,0.6)]">
                      {faDigits(keyTopics.length)}
                    </span>
                    <h3 className="font-extrabold text-base md:text-lg leading-tight text-white">
                      محور اصلی دوره
                    </h3>
                  </div>
                  <div className="relative grid grid-cols-2 gap-3">
                    {keyTopics.map((t) => (
                      <div
                        key={t.label}
                        className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-4 text-center hover:bg-white/15 hover:-translate-y-0.5 transition group"
                      >
                        <div className="w-12 h-12 mx-auto rounded-xl bg-[#f7cf5a]/20 border border-[#f7cf5a]/40 text-[#f7cf5a] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                          {t.icon}
                        </div>
                        <div className="text-xs md:text-sm font-bold text-white/95 leading-tight line-clamp-2">
                          {t.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accordion: chapters → lessons */}
              <div className="space-y-3">
                {chapters.map((ch, i) => {
                  const lessons = listLessonsByChapter(ch.id);
                  return (
                    <details
                      key={ch.id}
                      open={i === 0}
                      className="group rounded-2xl bg-white border border-[#bcd9f4] shadow-[0_8px_24px_-12px_rgba(14,26,61,0.18)] overflow-hidden open:shadow-[0_16px_40px_-16px_rgba(14,26,61,0.28)] transition"
                    >
                      <summary className="list-none cursor-pointer flex items-center gap-4 px-5 py-4 hover:bg-[#f4faff] transition">
                        <span className="shrink-0 w-10 h-10 rounded-xl bg-[#f7cf5a]/25 border border-[#d4a62a]/40 text-[#7a5a08] flex items-center justify-center font-black text-sm tabular-nums">
                          {faDigits(i + 1)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-[#0e1a3d] text-sm md:text-base truncate">
                            {ch.title}
                          </div>
                          <div className="text-xs text-[#0e1a3d]/55 mt-0.5">
                            {faDigits(lessons.length)} درس
                          </div>
                        </div>
                        <span className="shrink-0 w-7 h-7 rounded-full bg-[#f7cf5a] text-[#2d1c03] flex items-center justify-center transition-transform group-open:rotate-180">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-5 pb-5 pt-1 border-t border-[#e2effb]">
                        <ul className="space-y-1.5 mt-3">
                          {lessons.map((l, j) => (
                            <li
                              key={l.id}
                              className="flex items-center gap-3 py-2.5 text-sm text-[#010514]/80 leading-7"
                            >
                              <span className="shrink-0 w-6 h-6 rounded-full bg-[#eef4ff] text-[#1b3c8a] text-[11px] font-bold flex items-center justify-center">
                                {faDigits(j + 1)}
                              </span>
                              <span className="flex-1">{l.title}</span>
                              {l.freePreview && (
                                <span className="text-[10.5px] text-green-700 bg-green-50 px-2.5 py-1 rounded-full font-bold border border-green-200">
                                  پیش‌نمایش رایگان
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═════════════════ BENEFITS ═════════════════ */}
      {/* Premium warm-cream background (was dark navy). Dark mid-page
          sections read as the footer and stopped users scrolling further. */}
      <section
        id="benefits"
        className="relative overflow-hidden bg-gradient-to-b from-[#fff9e7] via-[#fdf2d0] to-[#fdf5de] text-[#0e1a3d] scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-40 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 right-0 w-[420px] h-[420px] rounded-full opacity-25 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(14,26,61,0.35) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16">
            <Eyebrow variant="gold">GOLDEN BENEFITS</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              چرا {course.title}؟
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#d4a62a]/60" />
              <span className="text-[#7a5a08] text-sm md:text-base font-bold">مزیت‌های ویژهٔ دانش‌پذیران</span>
              <span className="h-px w-10 bg-[#d4a62a]/60" />
            </div>
            <p className="text-[#010514]/70 max-w-3xl mx-auto text-sm md:text-base leading-8">
              فراتر از ویدیوهای آموزشی — با ثبت‌نام در این دوره به اکوسیستم آموزشی نامدار آکادمی متصل می‌شوید.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSE_BENEFITS.map((b) => (
              <div
                key={b.title}
                className="relative rounded-2xl p-5 md:p-6 overflow-hidden hover:-translate-y-1 transition group bg-white"
                style={{
                  border: "1px solid rgba(212,166,42,0.25)",
                  boxShadow:
                    "0 10px 30px -14px rgba(14,26,61,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-[#f7cf5a]/20 blur-2xl pointer-events-none"
                />
                <div className="relative flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#f7cf5a] to-[#d4a62a] text-[#2d1c03] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_6px_14px_-4px_rgba(212,166,42,0.55)]">
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[#0e1a3d] text-[15px] md:text-base mb-1.5 leading-tight">
                      {b.title}
                    </h3>
                    <p className="text-[12.5px] md:text-[13px] text-[#010514]/65 leading-7">{b.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════ PRICING / ENROLL ═════════════════ */}
      {/* Was dark navy — now light pearl with gold accents. Keeps the
          premium "golden" feel without reading as a footer. */}
      <section
        id="pricing"
        className="relative overflow-hidden bg-gradient-to-b from-[#fdf5de] via-[#f7ecf8] to-[#eef4fb] text-[#0e1a3d] scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-32 right-1/3 w-[520px] h-[520px] rounded-full opacity-40 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 left-0 w-[420px] h-[420px] rounded-full opacity-30 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #a5d8ff, transparent 70%)" }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow variant="gold">ENROLL NOW</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              آمادهٔ شروع هستید؟
            </h2>
            <div className="inline-flex items-center gap-3 mt-2 mb-5">
              <span className="h-px w-10 bg-[#d4a62a]/60" />
              <span className="text-[#7a5a08] text-sm md:text-base font-bold">هزینه و شرایط ثبت‌نام</span>
              <span className="h-px w-10 bg-[#d4a62a]/60" />
            </div>
            <p className="text-[#010514]/70 max-w-3xl mx-auto text-sm md:text-base leading-8">
              با یک‌بار پرداخت، مالکیت مادام‌العمر محتوا — بدون اشتراک ماهانه، بدون هزینهٔ پنهان.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-6 lg:gap-8 items-start">
            {/* Pricing card — cream premium with gold border and gold glow */}
            <div
              className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-white"
              style={{
                border: "1.5px solid rgba(212,166,42,0.45)",
                boxShadow:
                  "0 22px 55px -18px rgba(212,166,42,0.35), 0 0 30px -8px rgba(247,207,90,0.3), inset 0 1px 0 rgba(255,255,255,0.95)",
              }}
            >
              <span
                aria-hidden
                className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#f7cf5a]/25 blur-2xl pointer-events-none"
              />

              <div className="flex items-center gap-4 mb-5">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f7cf5a] to-[#d4a62a] text-[#2d1c03] flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(212,166,42,0.55)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] font-bold text-[#7a5a08] mb-1">مبلغ ثبت‌نام</div>
                  {course.isFree ? (
                    <div className="font-black text-3xl md:text-4xl text-emerald-600">
                      رایگان
                    </div>
                  ) : course.discountPrice ? (
                    <>
                      <div className="text-sm text-[#010514]/45 line-through mb-1">{formatToman(course.price)}</div>
                      <div className="font-black text-3xl md:text-4xl text-[#0e1a3d] tabular-nums">
                        {formatToman(course.discountPrice)}
                      </div>
                    </>
                  ) : (
                    <div className="font-black text-3xl md:text-4xl text-[#0e1a3d] tabular-nums">
                      {formatToman(course.price)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                {course.allowPurchase ? (
                  <EnrollButton course={course} />
                ) : (
                  <div className="text-center py-3 rounded-full bg-[#f4f7fc] text-[#010514]/55 border border-[#e3e9f4]">
                    این دوره در حال حاضر قابل خرید نیست
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-[#eef2f7] grid grid-cols-2 gap-3 text-[12px] text-[#0e1a3d]">
                <InfoRow label="سطح دوره" value={LEVEL_LABELS[course.level]} />
                <InfoRow label="مدت دوره" value={totalMinutes > 0 ? formatMinutes(totalMinutes) : "—"} />
                <InfoRow label="تعداد درس" value={faDigits(allLessons.length)} />
                {!course.hideStudentsCount && (
                  <InfoRow label="دانش‌پذیران" value={faDigits(course.studentsCount)} />
                )}
              </div>
            </div>

            {/* Feature list — white cards on cream bg */}
            <div className="space-y-3.5">
              {COURSE_BENEFITS.slice(0, 5).map((b) => (
                <div
                  key={b.title}
                  className="relative rounded-2xl p-4 md:p-5 overflow-hidden bg-white"
                  style={{
                    border: "1px solid rgba(212,166,42,0.22)",
                    boxShadow:
                      "0 8px 24px -14px rgba(14,26,61,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#f7cf5a] to-[#d4a62a] text-[#2d1c03] flex items-center justify-center shadow-[0_4px_10px_-3px_rgba(212,166,42,0.45)]">
                      {b.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-[#0e1a3d] text-sm md:text-[15px] mb-1 leading-tight">
                        {b.title}
                      </h3>
                      <p className="text-[11px] md:text-xs text-[#010514]/65 leading-6">{b.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ FAQ ═════════════════ */}
      <section
        id="course-faq"
        className="relative overflow-hidden bg-[#dceefd] text-[#010514] scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute top-1/4 right-0 w-[480px] h-[480px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-1/4 left-0 w-[420px] h-[420px] rounded-full opacity-28 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow>COURSE FAQ</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              سؤالات متداول
            </h2>
            <p className="text-[#010514]/70 max-w-3xl mx-auto text-sm md:text-base leading-8">
              هر آنچه دربارهٔ ثبت‌نام، دسترسی و پشتیبانی باید بدانید.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {COURSE_FAQ.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group rounded-2xl bg-white border border-[#bcd9f4] shadow-[0_8px_24px_-12px_rgba(14,26,61,0.18)] overflow-hidden open:shadow-[0_16px_40px_-16px_rgba(14,26,61,0.28)] transition"
              >
                <summary className="list-none cursor-pointer flex items-center gap-4 px-5 py-4 hover:bg-[#f4faff] transition">
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-[#f7cf5a]/25 border border-[#d4a62a]/40 text-[#7a5a08] flex items-center justify-center font-extrabold text-sm tabular-nums">
                    {faDigits(i + 1)}
                  </span>
                  <span className="flex-1 font-extrabold text-[#0e1a3d] text-sm md:text-base leading-7">
                    {item.q}
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-[#f7cf5a] text-[#2d1c03] flex items-center justify-center transition-transform group-open:rotate-180">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1 border-t border-[#e2effb] mr-[3.25rem]">
                  <p className="text-sm md:text-[15px] text-[#010514]/75 leading-8 mt-3">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════ MEET INSTRUCTOR ═════════════════ */}
      <section
        id="meet-instructor"
        className="relative overflow-hidden bg-[#fdf2da] text-[#010514] scroll-mt-24"
      >
        <div
          aria-hidden
          className="absolute -top-32 right-0 w-[520px] h-[520px] rounded-full opacity-40 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 left-0 w-[420px] h-[420px] rounded-full opacity-30 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #d4a62a, transparent 70%)" }}
        />

        <div className="relative max-w-[1300px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow variant="navy">MEET YOUR MENTOR</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              با مدرس دوره آشنا شوید
            </h2>
            <div className="inline-flex items-center gap-3 mt-2">
              <span className="h-px w-10 bg-[#0e1a3d]/40" />
              <span className="text-[#7a5a08] text-sm md:text-base font-bold">مسیر حرفه‌ای در یک نگاه</span>
              <span className="h-px w-10 bg-[#0e1a3d]/40" />
            </div>
          </div>

          <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-center">
            <div className="relative mx-auto lg:mx-0">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-[#f7cf5a] via-[#d4a62a] to-[#0e1a3d] opacity-40 blur-2xl"
              />
              <div className="relative w-[300px] md:w-[360px] aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_30px_80px_-20px_rgba(14,26,61,0.45)] bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] flex items-center justify-center">
                <div className="text-white text-8xl font-black opacity-30">
                  {course.instructor.charAt(0)}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/85 via-transparent to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <div className="text-[10px] tracking-[0.2em] text-[#f7cf5a] font-bold mb-1">مدرس دوره</div>
                  <div className="font-extrabold text-white text-lg leading-tight">{course.instructor}</div>
                  <div className="text-xs text-white/80 mt-1">نامدار آکادمی</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative rounded-3xl bg-[#0e1a3d] text-white p-6 md:p-7 overflow-hidden shadow-[0_20px_50px_-20px_rgba(14,26,61,0.55)]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a]"
                />
                <div
                  aria-hidden
                  className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-[#f7cf5a]/10 blur-3xl pointer-events-none"
                />

                <div className="relative space-y-4 mb-5">
                  <p className="text-sm md:text-base leading-9 text-white/90">
                    {course.instructor} از مدرسان و تحلیل‌گران برجستهٔ نامدار آکادمی است که با سال‌ها تجربهٔ عملی در بازارهای مالی، محتوای این دوره را مستقیماً از تجربیات واقعی معامله‌گری به دانش‌پذیران منتقل می‌کند.
                  </p>
                  <p className="text-sm md:text-base leading-9 text-white/90">
                    رویکرد آموزشی این دوره بر پایهٔ سادگی، شفافیت و قابلیت اجرا است — نه تئوری‌های پیچیده، بلکه روش‌هایی که می‌توانید از همان روز اول به کار ببرید.
                  </p>
                </div>

                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    "تدریس عمیق و گام‌به‌گام",
                    "دسترسی به تجربیات عملی معامله‌گری",
                    "پشتیبانی آموزشی ۲۴ ساعته",
                    "پاسخ‌دهی مستقیم به سؤالات",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[#f7cf5a] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0e1a3d" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-xs md:text-[13px] text-white/90 leading-5 font-medium">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ REVIEWS ═════════════════ */}
      <section id="reviews" className="relative bg-[#f7fafd] py-16 md:py-24 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <Eyebrow>REVIEWS · RATINGS</Eyebrow>
            <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
              نظرات دانش‌پذیران
            </h2>
          </div>
          <CourseReviewsSection
            courseSlug={slug}
            canReview={canReview}
            authenticated={!!session}
          />
        </div>
      </section>

      {/* ═════════════════ RELATED COURSES ═════════════════ */}
      <RelatedCourses currentSlug={slug} categoryId={course.categoryId} />

      {/* ═════════════════ REGISTER CTA ═════════════════ */}
      {/* Final card — warm cream so it doesn't imitate the site footer. The
          actual site footer (dark) is rendered by the (site) layout after
          this section. */}
      <section
        id="register"
        className="bg-gradient-to-b from-[#fdf5de] via-[#fbf0c4] to-[#fdf5de] text-[#0e1a3d] py-16 md:py-24 scroll-mt-24"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-4 text-[#0e1a3d]">
              {course.isFree ? "الان ثبت‌نام رایگان کنید" : "همین حالا شروع کنید"}
            </h2>
            <p className="text-[#010514]/75 leading-8 mb-6">
              هر روز تأخیر، یک روز دیر حرفه‌ای‌تر شدن است. دسترسی مادام‌العمر، گواهی معتبر و پشتیبانی اختصاصی نامدار آکادمی در انتظار شماست.
            </p>
            <ul className="space-y-2 text-sm text-[#010514]/75">
              {[
                "پشتیبانی آموزشی ۲۴ ساعته",
                "ضمانت بازگشت وجه در ۷ روز ابتدایی",
                "امکان پرداخت اقساطی برای دوره‌های حرفه‌ای",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#f7cf5a] to-[#d4a62a] flex items-center justify-center shadow-[0_3px_8px_-2px_rgba(212,166,42,0.55)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2d1c03" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div
              className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-white"
              style={{
                border: "1.5px solid rgba(212,166,42,0.4)",
                boxShadow:
                  "0 24px 60px -20px rgba(212,166,42,0.3), 0 0 24px -6px rgba(247,207,90,0.25), inset 0 1px 0 rgba(255,255,255,0.95)",
              }}
            >
              <span
                aria-hidden
                className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#f7cf5a]/25 blur-2xl pointer-events-none"
              />
              <div className="relative mb-5">
                <div className="text-[11px] tracking-[0.2em] font-bold text-[#7a5a08] mb-2">مبلغ دوره</div>
                {course.isFree ? (
                  <div className="text-3xl md:text-4xl font-black text-emerald-600">رایگان</div>
                ) : course.discountPrice ? (
                  <>
                    <div className="text-sm text-[#010514]/45 line-through mb-1">{formatToman(course.price)}</div>
                    <div className="text-3xl md:text-4xl font-black text-[#0e1a3d] tabular-nums">{formatToman(course.discountPrice)}</div>
                  </>
                ) : (
                  <div className="text-3xl md:text-4xl font-black text-[#0e1a3d] tabular-nums">{formatToman(course.price)}</div>
                )}
              </div>
              <div className="relative">
                {course.allowPurchase ? (
                  <EnrollButton course={course} />
                ) : (
                  <div className="text-center py-3 rounded-full bg-[#f4f7fc] text-[#010514]/55 border border-[#e3e9f4]">
                    این دوره در حال حاضر قابل خرید نیست
                  </div>
                )}
              </div>
              <div className="relative mt-4 text-[12px] text-[#010514]/60 text-center">
                با ثبت‌نام، {userEnrolled ? "شما قبلاً عضو این دوره هستید." : "به بزرگ‌ترین خانوادهٔ تریدرهای ایران می‌پیوندید."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating support dock — stays pinned on scroll without entering the text column */}
      <FloatingSupportDock
        shareTitle={course.title}
        sharePath={`/courses/${slug}`}
        supportText={`برای مشاوره رایگان و اطلاعات بیشتر دربارهٔ دورهٔ «${course.title}»، با تیم پشتیبانی نامدار آکادمی در تماس باشید.`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

function Eyebrow({
  children,
  variant = "gold",
}: {
  children: React.ReactNode;
  variant?: "gold" | "gold-dark" | "navy";
}) {
  const styles = {
    gold: {
      bg: "bg-[#f7cf5a]/30",
      border: "border-[#d4a62a]/40",
      text: "text-[#7a5a08]",
      dot: "bg-[#d4a62a] shadow-[0_0_8px_#f7cf5a]",
    },
    "gold-dark": {
      bg: "bg-[#f7cf5a]/15",
      border: "border-[#f7cf5a]/40",
      text: "text-[#f7cf5a]",
      dot: "bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]",
    },
    navy: {
      bg: "bg-[#0e1a3d]/10",
      border: "border-[#0e1a3d]/20",
      text: "text-[#0e1a3d]",
      dot: "bg-[#0e1a3d]",
    },
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${styles.bg} border ${styles.border} text-[10px] md:text-[11px] tracking-[0.2em] font-extrabold ${styles.text} mb-4 backdrop-blur`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[#010514]/55 text-[11px]">{label}</span>
      <span className="font-bold text-[#0e1a3d] truncate">{value}</span>
    </div>
  );
}

function TopicIcon({ idx }: { idx: number }) {
  const icons = [
    <svg key="0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 3a3.5 3.5 0 00-3.45 4.07A3.5 3.5 0 005 14a3.5 3.5 0 003 3.46V20a2 2 0 002 2V3.5A.5.5 0 009.5 3z" />
      <path d="M14.5 3a3.5 3.5 0 013.45 4.07A3.5 3.5 0 0119 14a3.5 3.5 0 01-3 3.46V20a2 2 0 01-2 2V3.5a.5.5 0 01.5-.5z" />
    </svg>,
    <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-6 4 3 4-7 5 4" />
      <polyline points="3 21 21 21" />
    </svg>,
    <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2.4" />
    </svg>,
    <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 4 2 10l10 6 10-6z" />
      <path d="M6 12v5a6 6 0 0012 0v-5" />
    </svg>,
    <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>,
    <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
    </svg>,
  ];
  return icons[idx % icons.length];
}
