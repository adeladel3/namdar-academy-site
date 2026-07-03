import Link from "@/components/SafeLink";
import { getSetting, listArticles, listCourses, listWallOfFame } from "@/lib/db";
import { courseDetailHref } from "@/lib/course-links";
import { formatToman, LEVEL_LABELS, phoneToTelHref } from "@/lib/formatting";
import InlineVideo from "@/components/InlineVideo";
import ConsultationRequestButton from "@/components/ConsultationRequestButton";
import LeadForm from "@/components/LeadForm";

// Same instructor photo the desktop Figma hero uses (transparent PNG).
const HERO_INSTRUCTOR_PHOTO = "/figma/f7eff535b0ed407aa6c3e4d475e4fc741.png";

// Per-course brand logos — mirrors the desktop CoursesGrid so mobile cards
// use the same circular logo treatment as /courses instead of falling back to
// the generic FINVEST previewImage.
type BrandLogo = {
  src: string;
  glow: string;
  bg: string;
  imgStyle: React.CSSProperties;
};

const BRAND_LOGOS: Record<string, BrandLogo> = {
  mon: {
    src: "/figma/image1.png",
    glow: "radial-gradient(circle, rgba(255,176,75,0.55) 0%, rgba(255,176,75,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(255,220,160,0.25), rgba(35,20,10,0.9) 70%)",
    imgStyle: {
      left: "0%",
      top: "0%",
      width: "100%",
      height: "146%",
      objectFit: "cover",
      maxWidth: "none",
    },
  },
  nova: {
    src: "/figma/untitled1copy1.png",
    glow: "radial-gradient(circle, rgba(66,71,186,0.55) 0%, rgba(66,71,186,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(160,170,230,0.25), rgba(20,24,55,0.9) 70%)",
    imgStyle: {
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      padding: "6%",
    },
  },
  lq1: {
    src: "/figma/layer11.png",
    glow: "radial-gradient(circle, rgba(12,156,75,0.55) 0%, rgba(12,156,75,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(120,220,170,0.2), rgba(8,38,22,0.9) 70%)",
    imgStyle: {
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "contain",
      padding: "4%",
    },
  },
  finvest: {
    src: "/figma/finvestcopy1.png",
    glow: "radial-gradient(circle, rgba(18,18,18,0.45) 0%, rgba(18,18,18,0) 70%)",
    bg: "radial-gradient(circle at 30% 30%, rgba(150,150,150,0.12), rgba(10,10,12,0.95) 70%)",
    imgStyle: {
      left: "-38%",
      top: "-16%",
      width: "262%",
      height: "131%",
      maxWidth: "none",
    },
  },
};

function getBrandLogo(slug: string): BrandLogo | null {
  return BRAND_LOGOS[slug] ?? null;
}

/**
 * Mobile / tablet landing page. Mirrors the exact content, section order,
 * and copy used by the desktop `<Landing />` Figma export — only the layout
 * is reflowed to a single column so it renders properly below `lg`.
 */
export default function LandingMobile() {
  const heroPhoto =
    getSetting<string>("landing.heroPhoto") || HERO_INSTRUCTOR_PHOTO;
  const monPoster =
    getSetting<string>("landing.monPosterUrl") ||
    "/figma/screenshot00080208at1732541.png";
  const monVideoUrl = getSetting<string>("landing.monVideoUrl") || "";

  const contactPhone =
    getSetting<string>("site.contactPhone") || "021-9100-8222";
  const contactTelHref = phoneToTelHref(contactPhone);

  const allCourses = listCourses({ status: "published" });
  const investingHub = allCourses.find((c) => c.slug === "investing-hub");
  const courses = allCourses
    .filter((c) => c.slug !== "investing-hub")
    .slice(0, 5);
  const articles = listArticles({ publishedOnly: true })
    .sort(
      (a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt)
    )
    .slice(0, 3);

  // «دیوار افتخارات» — تصاویر و ویدئوهای موفقیت دانش‌پذیران
  const wallOfFameItems = listWallOfFame({ publishedOnly: true });

  // "Our Success" stats — admin-editable from /admin/settings/landing.
  // Defaults match the original Figma strip so a blank DB still looks right.
  const STAT_DEFAULTS = [
    { value: "15K+", label: "دانش پذیر" },
    { value: "75%", label: "موفقیت در ترید" },
    { value: "35", label: "دوره آموزشی حضوری و غیر حضوری" },
    { value: "26", label: "تجربه منتورینگ" },
    { value: "16", label: "سال تجربه آموزش" },
  ];
  const STATS = STAT_DEFAULTS.map((d, i) => {
    const idx = i + 1;
    return {
      value:
        getSetting<string>(`landing.stat${idx}.value`)?.trim() || d.value,
      label:
        getSetting<string>(`landing.stat${idx}.label`)?.trim() || d.label,
    };
  });

  return (
    <div dir="rtl" className="lg:hidden bg-white text-[#0e1a3d]">
      {/* ═══════════ HERO — instructor + tagline ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6efff] via-[#f0f6ff] to-white px-5 pt-8 pb-10">
        <div
          aria-hidden
          className="absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl opacity-60 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #136cb5 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #f7cf5a 0%, transparent 70%)",
          }}
        />

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-white px-3 py-1.5 text-[11px] font-bold text-[#1b3c8a] tracking-[0.1em] mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
            مرجع تخصصی آموزش بازارهای مالی در ایران
          </div>

          <h1 className="font-['Yekan_Bakh:Bold',sans-serif] text-[32px] leading-[1.22] font-black mb-3 text-[#06142f]">
            آموزش حرفه‌ای
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#f7cf5a,#d4a62a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ترید و خدمات سرمایه‌گذاری
            </span>
          </h1>

          <p className="text-[14.5px] leading-[1.95] text-[#0e1a3d]/75 mb-6">
            از مبتدی تا حرفه‌ای در{" "}
            <span
              className="font-black"
              style={{
                background: "linear-gradient(135deg,#f7cf5a,#d4a62a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              کریپتو، فارکس، طلا و بازار بورس
            </span>
            <br />زیر نظر{" "}
            <span className="font-extrabold text-[#1b3c8a]">
              استاد امیرحسین نام‌آور
            </span>
            .
          </p>

          {/* Instructor photo card — matches desktop feel */}
          <div
            className="relative mb-6 rounded-[28px] overflow-hidden aspect-[4/5]"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #e8f1ff 0%, #cddcf3 55%, #b8cceb 100%)",
              boxShadow:
                "0 24px 60px -22px rgba(14,26,61,0.45), inset 0 1px 0 rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.85)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 opacity-[0.18] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(transparent 88%, rgba(27,60,138,0.55) 88%, rgba(27,60,138,0.55) 100%), repeating-linear-gradient(90deg, transparent 0 36px, rgba(27,60,138,0.35) 36px 40px)",
              }}
            />
            <div
              aria-hidden
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl pointer-events-none"
              style={{
                background: "radial-gradient(circle, #f7cf5a 0%, transparent 70%)",
                opacity: 0.5,
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroPhoto}
              alt="استاد امیرحسین نام‌آور"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-auto max-w-none object-contain object-bottom opacity-55"
            />

            {/* Glass blur veil covering the whole photo — mobile only */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none backdrop-blur-md"
              style={{
                background:
                  "linear-gradient(180deg, rgba(230,239,255,0.45) 0%, rgba(230,239,255,0.25) 50%, rgba(14,26,61,0.22) 100%)",
              }}
            />

            {/* Three quick-access pills — overlaid on instructor photo */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[76%] flex flex-col gap-3.5 z-10">
              <Link
                href="/courses"
                className="flex items-center justify-between h-14 rounded-xl pl-2 pr-5 text-white font-extrabold text-[14.5px] transition active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg,#1b3c8a 0%,#136cb5 60%,#4fb3c9 100%)",
                  boxShadow:
                    "0 14px 28px -12px rgba(19,108,181,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span className="flex-1 text-right">
                  مشاهده آموزش‌های غیرحضوری
                </span>
                <span
                  aria-hidden
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/coaching"
                className="flex items-center justify-between h-14 rounded-xl pl-2 pr-5 text-[#0e1a3d] font-extrabold text-[14.5px] transition active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  border: "1px solid rgba(19,108,181,0.22)",
                  boxShadow:
                    "0 14px 28px -12px rgba(14,26,61,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <span className="flex-1 text-right">
                  کوچینگ حضوری ترید MON
                </span>
                <span
                  aria-hidden
                  className="relative w-10 h-10 rounded-full overflow-hidden shadow-[0_4px_10px_-2px_rgba(168,117,24,0.55)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/figma/image1.png"
                    alt=""
                    style={{
                      position: "absolute",
                      top: "-2px",
                      left: "-3px",
                      width: "46px",
                      height: "auto",
                      maxWidth: "none",
                    }}
                  />
                </span>

              </Link>

              <Link
                href="/investing"
                className="flex items-center justify-between h-14 rounded-xl pl-2 pr-5 text-[#2d1c03] font-extrabold text-[13.5px] transition active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg,#fde285 0%,#f7cf5a 55%,#e8b838 100%)",
                  boxShadow:
                    "0 14px 28px -12px rgba(168,117,24,0.55), inset 0 1px 0 rgba(255,255,255,0.55)",
                }}
              >
                <span className="flex-1 text-right leading-tight">
                  کریپتو، طلا و خدمات سرمایه‌گذاری
                </span>
                <span
                  aria-hidden
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black/10 text-[#2d1c03] font-black text-[16px]"
                >
                  $
                </span>
              </Link>
            </div>

            <div className="absolute inset-x-4 bottom-4 flex items-center justify-end gap-3 z-10">
              <div
                className="rounded-full px-3 py-1.5 text-[10.5px] font-extrabold tabular-nums"
                style={{
                  background:
                    "linear-gradient(135deg,#fde285,#f7cf5a,#d4a62a)",
                  color: "#2d1c03",
                  boxShadow: "0 8px 18px -6px rgba(247,207,90,0.6)",
                }}
              >
                +۱۶ سال تجربه
              </div>
            </div>
          </div>

          {/* Tagline — matches desktop line 368-372 */}
          <p className="text-[15px] text-[#06142f] leading-[1.9] mb-6 font-medium text-center">
            مرجع آموزش ترید و سرمایه‌گذاری با بیش از{" "}
            <span className="font-['Yekan_Bakh:Heavy',sans-serif] font-black">
              یک میلیون
            </span>{" "}
            کاربر فعال
          </p>

          {/* Primary CTA — opens consultation-request modal */}
          <ConsultationRequestButton />
        </div>
      </section>

      {/* ═══════════ MON COACHING HERO — جدیدترین سبک ترید الگوریتمیک ═══════════ */}
      <section
        className="relative overflow-hidden px-5 py-12 text-white"
        style={{
          background:
            "linear-gradient(180deg, #0b4a7a 0%, #1b3c8a 50%, #0e1a3d 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute -top-20 -right-16 w-64 h-64 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #f7cf5a 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span
              aria-hidden
              className="block h-px flex-1 max-w-[30px]"
              style={{
                background: "linear-gradient(90deg, #f7cf5a, transparent)",
              }}
            />
            <span className="text-[10px] tracking-[0.32em] font-extrabold text-[#f7cf5a]">
              NAMDAR · ALGORITHMIC TRADING
            </span>
          </div>

          <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[28px] font-black leading-[1.2] mb-2">
            جدیدترین سبک{" "}
            <span style={{ color: "#f7cf5a" }}>ترید الگوریتمیک</span>
            <span className="block text-center">در دنیا</span>
          </h2>
          <p className="text-[14px] text-white/80 leading-[1.85] mb-6">
            از مبتدی تا پیشرفته — برای ترید طلا، نفت، فارکس و کریپتو.
          </p>

          <div
            className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-6 bg-[#071e42]"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 22px 50px -18px rgba(0,0,0,0.55)",
            }}
          >
            <InlineVideo
              videoUrl={monVideoUrl}
              poster={monPoster}
              title="کوچینگ MON"
              variant="gold"
              buttonSize={72}
              className="absolute inset-0"
            />
          </div>

          <Link
            href="/coaching"
            className="flex items-center justify-center h-12 rounded-full font-bold text-[15px] transition active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, #fde285, #f7cf5a 45%, #d4a62a)",
              color: "#2d1c03",
              boxShadow: "0 12px 26px -10px rgba(247,207,90,0.6)",
            }}
          >
            جزئیات کوچینگ MON
          </Link>
        </div>
      </section>

      {/* ═══════════ STATS — Our Success ═══════════ */}
      <section className="px-5 py-10 bg-white">
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border border-[#e3e9f4] bg-gradient-to-br from-[#f7fafd] to-white px-4 py-5 text-center ${
                STATS.length % 2 !== 0 &&
                s === STATS[STATS.length - 1]
                  ? "col-span-2"
                  : ""
              }`}
            >
              <div
                className="font-['Buenos_Aires_Trial:Light',sans-serif] text-[44px] font-light leading-none mb-2 tabular-nums"
                style={{
                  background: "linear-gradient(135deg, #136cb5, #49bbbd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                dir="ltr"
              >
                {s.value}
              </div>
              <div className="font-['Yekan_Bakh:Bold',sans-serif] text-[13px] text-[#010514]/80 font-extrabold leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ COURSES — دوره های غیر حضوری ═══════════ */}
      <section className="px-5 py-12 bg-[#f7fafd]">
        <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[26px] font-black leading-[1.25] text-[#081738] mb-6">
          دوره‌های غیر حضوری
        </h2>
        <div className="space-y-4">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={courseDetailHref(c.slug)}
              className="group block rounded-2xl overflow-hidden bg-white border border-[#e3e9f4] transition active:scale-[0.99]"
              style={{
                boxShadow: "0 16px 36px -20px rgba(14,26,61,0.2)",
              }}
            >
              <div
                className="relative aspect-[16/10] flex items-center justify-center overflow-hidden"
                style={{
                  background: (() => {
                    const logo = getBrandLogo(c.slug);
                    return logo
                      ? logo.bg
                      : "linear-gradient(135deg,#eef2fb,#d6dfee)";
                  })(),
                }}
              >
                {(() => {
                  const logo = getBrandLogo(c.slug);
                  if (logo) {
                    return (
                      <div className="relative w-[220px] h-[220px] max-w-[75%] max-h-[92%]">
                        <div
                          aria-hidden
                          className="absolute -inset-6 rounded-full blur-2xl pointer-events-none"
                          style={{ background: logo.glow }}
                        />
                        <div
                          className="relative h-full w-full rounded-full overflow-hidden ring-1 ring-white/40 shadow-[0_18px_44px_-14px_rgba(0,0,0,0.55)]"
                          style={{ background: logo.bg }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logo.src}
                            alt=""
                            aria-hidden
                            draggable={false}
                            className="absolute pointer-events-none select-none"
                            style={logo.imgStyle}
                          />
                        </div>
                      </div>
                    );
                  }
                  return c.previewImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={c.previewImage}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null;
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[#1b3c8a] text-[10.5px] font-extrabold">
                  سطح {LEVEL_LABELS[c.level]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[16px] font-extrabold leading-tight mb-1.5">
                  {c.title}
                </h3>
                <p className="text-[12.5px] text-[#0e1a3d]/65 leading-relaxed line-clamp-2 mb-3">
                  {c.shortDesc}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    {c.isFree ? (
                      <div className="text-[15px] font-black text-emerald-600">
                        رایگان
                      </div>
                    ) : (
                      <>
                        {c.discountPrice && c.discountPrice < c.price && (
                          <div className="text-[10.5px] text-[#0e1a3d]/45 line-through">
                            {formatToman(c.price)}
                          </div>
                        )}
                        <div className="text-[15px] font-black text-[#1b3c8a] tabular-nums">
                          {formatToman(c.discountPrice ?? c.price)}
                        </div>
                      </>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1b3c8a] group-active:translate-x-0.5 transition">
                    ورود به دوره
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5" />
                      <path d="M12 19l-7-7 7-7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <Link
            href="/courses"
            className="block text-center py-3.5 rounded-full border-2 border-[#1b3c8a]/25 font-bold text-[14px] text-[#1b3c8a] bg-white active:scale-[0.98] transition"
          >
            مشاهده همه دوره‌ها ←
          </Link>
        </div>
      </section>

      {/* ═══════════ سرمایه‌گذاری + INVESTING HUB (unified block) ═══════════ */}
      <div
        className="relative border-t border-b border-[#e8d9a8]"
        style={{
          background:
            "linear-gradient(180deg, #fff8e4 0%, #fdf0c8 45%, #fbe8b4 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(247,207,90,0.8), transparent)",
          }}
        />
      {investingHub && (
        <section className="px-5 pt-12 pb-8">
          <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[24px] font-black leading-[1.35] text-[#081738] mb-1.5">
            پلتفرم سرمایه‌گذاری اینوستینگ هاب
          </h2>
          <p className="text-[13px] font-bold text-[#7a5a10] mb-6">
            طلا، نفت، کریپتو، فارکس، مسکن و …
          </p>

          <Link
            href={courseDetailHref(investingHub.slug)}
            className="group block rounded-2xl overflow-hidden bg-white border border-[#e8d9a8] transition active:scale-[0.99]"
            style={{
              boxShadow: "0 16px 36px -20px rgba(133,100,20,0.3)",
            }}
          >
            <div className="relative aspect-[16/9] bg-gradient-to-br from-[#e5eaf5] to-[#d6dfee]">
              {investingHub.previewImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={investingHub.previewImage}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-[#1b3c8a] text-[10.5px] font-extrabold">
                سطح {LEVEL_LABELS[investingHub.level]}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[16px] font-extrabold leading-tight mb-1.5">
                {investingHub.title}
              </h3>
              <p className="text-[12.5px] text-[#0e1a3d]/65 leading-relaxed line-clamp-2 mb-3">
                {investingHub.shortDesc}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  {investingHub.isFree ? (
                    <div className="text-[15px] font-black text-emerald-600">
                      رایگان
                    </div>
                  ) : (
                    <>
                      {investingHub.discountPrice &&
                        investingHub.discountPrice < investingHub.price && (
                          <div className="text-[10.5px] text-[#0e1a3d]/45 line-through">
                            {formatToman(investingHub.price)}
                          </div>
                        )}
                      <div className="text-[15px] font-black text-[#1b3c8a] tabular-nums">
                        {formatToman(
                          investingHub.discountPrice ?? investingHub.price
                        )}
                      </div>
                    </>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1b3c8a] group-active:translate-x-0.5 transition">
                  ورود به دوره
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ═══════════ INVESTING HUB — اینوستینگ هاب ═══════════ */}
      <section className="px-5 pt-6 pb-12">
        <div
          aria-hidden
          className="h-px w-24 mx-auto mb-8"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(184,140,30,0.6), transparent)",
          }}
        />
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <span
              aria-hidden
              className="block h-px w-[42px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(184,140,30,0.7))",
              }}
            />
            <span
              className="text-[11px] tracking-[0.32em] font-extrabold"
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: "#7a5a10",
              }}
            >
              INVESTING HUB
            </span>
            <span
              aria-hidden
              className="block h-px w-[42px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(184,140,30,0.7), transparent)",
              }}
            />
          </div>
          <h2 className="text-[#081738] text-[28px] font-black leading-tight font-['Yekan_Bakh:Bold',sans-serif]">
            توضیحات بیشتر
          </h2>
          <p className="mt-4 text-[13px] leading-[1.9] text-[#5a4610] font-medium">
            هیچ‌وقت همهٔ تخم‌مرغ‌هایت را در یک سبد نگذار — با فینوست، حرفه‌ای
            معامله کن؛ با نوا، سبد اختصاصی بچین. دو بالِ مکملِ مدیریتِ هوشمندِ
            سرمایه.
          </p>
        </div>

        <h3 className="mt-10 mb-5 text-center font-['Yekan_Bakh:Bold',sans-serif] text-[20px] font-black leading-[1.45] text-[#081738]">
          با اینوستینگ هاب چی به دست میاری؟
        </h3>

        <div className="space-y-4">
          {[
            {
              step: "۱",
              brand: "FINVEST",
              tagline: "FINVEST TRADING ASSISTANT",
              title: "دستیار معامله‌گری فینوست",
              desc: "سیگنال لحظه‌ای طلا، نفت و شاخص‌ها + تحلیل AI",
              color: "#f7cf5a",
              bg: "linear-gradient(135deg, #0a0e2f 0%, #1a1555 60%, #2a1a4a 100%)",
            },
            {
              step: "۲",
              brand: "NOVA",
              tagline: "NOVA PORTFOLIO CONSULTING",
              title: "مشاورهٔ سبدچینی نوا",
              desc: "سبد متناسب با سطح ریسک شما، با گزارش ماهانه",
              color: "#c74bff",
              bg: "linear-gradient(135deg, #120b2f 0%, #2a1055 55%, #3a0f66 100%)",
            },
          ].map((h) => (
            <div
              key={h.brand}
              className="relative rounded-3xl p-5 text-white overflow-hidden"
              style={{
                background: h.bg,
                boxShadow: `0 18px 40px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
                border: `1px solid ${h.color}33`,
              }}
            >
              <div
                aria-hidden
                className="absolute -top-16 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ background: h.color, opacity: 0.25 }}
              />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center font-['Yekan_Bakh:Bold',sans-serif] font-black text-[15px] tabular-nums shrink-0"
                    style={{
                      background: `${h.color}26`,
                      color: h.color,
                      border: `1.5px solid ${h.color}80`,
                      boxShadow: `0 0 16px -4px ${h.color}66, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }}
                  >
                    {h.step}
                  </span>
                  <span
                    className="text-[10px] font-extrabold tracking-[0.22em] px-2.5 py-1 rounded-full"
                    style={{
                      background: `${h.color}1f`,
                      color: h.color,
                      border: `1px solid ${h.color}4d`,
                    }}
                  >
                    {h.brand}
                  </span>
                </div>
                <p
                  className="text-[9.5px] font-bold tracking-[0.2em] mb-2"
                  style={{ color: `${h.color}cc` }}
                  dir="ltr"
                >
                  {h.tagline}
                </p>
                <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[17px] font-extrabold leading-tight mb-1.5">
                  {h.title}
                </h3>
                <p className="text-[12.5px] leading-[1.85] text-white/75 mb-4">
                  {h.desc}
                </p>
                <Link
                  href="/courses/investing-hub"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold"
                  style={{ color: h.color }}
                >
                  اطلاعات بیشتر
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" />
                    <path d="M12 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA — mirrors the desktop "مشاهده کامل Investing Hub"
            glass-gold pill so mobile users get the same entry point. */}
        <div className="px-5 pb-10 pt-2 flex justify-center">
          <Link
            href="/courses/investing-hub"
            aria-label="مشاهده کامل Investing Hub"
            className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-extrabold text-[#3a2405] relative active:scale-[0.98] transition"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,235,150,0.85) 0%, rgba(247,207,90,0.78) 45%, rgba(212,164,73,0.75) 100%)",
              backdropFilter: "blur(18px) saturate(1.6)",
              WebkitBackdropFilter: "blur(18px) saturate(1.6)",
              border: "1px solid rgba(255,230,140,0.9)",
              boxShadow:
                "0 14px 32px -8px rgba(212,164,73,0.55), inset 0 1.5px 0 rgba(255,250,220,0.85), inset 0 -1.5px 0 rgba(170,120,30,0.28), 0 0 18px rgba(247,207,90,0.28)",
              textShadow: "0 1px 2px rgba(255,245,200,0.5)",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-[3px] h-[40%] rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 85%)",
                filter: "blur(0.5px)",
              }}
            />
            <span className="relative">مشاهده کامل Investing Hub</span>
          </Link>
        </div>
      </section>
      </div>

      {/* ═══════════ CONSULTATION — درخواست مشاوره رایگان ═══════════ */}
      <section className="px-5 py-12 bg-white">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            border: "1px solid #e5eaf5",
            boxShadow: "0 28px 60px -24px rgba(14,26,61,0.25)",
          }}
        >
          <div
            aria-hidden
            className="h-1"
            style={{
              background: "linear-gradient(90deg,#f7cf5a,#e8bc3a,#d4a62a)",
            }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2 text-[10.5px] tracking-[0.28em] font-extrabold text-[#1b3c8a]/75 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
              ENTRY · MON
            </div>
            <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[22px] font-extrabold leading-tight text-[#0e1a3d] mb-2">
              درخواست مشاوره رایگان
            </h3>
            <p className="text-[13px] text-[#0e1a3d]/60 leading-[1.9] mb-5">
              ساعات پاسخ‌گویی در روزهای کاری:
              <br />
              شنبه تا چهارشنبه — ساعت ۹:۰۰ الی ۱۸:۰۰
              <br />
              پنجشنبه — ساعت ۹:۰۰ الی ۱۴:۰۰
            </p>

            <LeadForm
              source="landing-mobile-mon-hero"
              relatedCourseSlug="mon"
              relatedCourseTitle="کوچینگ MON"
              ctaLabel="درخواست مشاوره"
            />

            <div className="flex items-center gap-3 my-5">
              <span className="flex-1 h-px bg-[#e5eaf5]" />
              <span className="text-[11px] text-[#0e1a3d]/45 font-bold">یا</span>
              <span className="flex-1 h-px bg-[#e5eaf5]" />
            </div>

            <a
              href={contactTelHref}
              className="flex items-center gap-3 py-3 px-4 rounded-xl bg-[#f7cf5a]/10 border border-[#f7cf5a]/30 active:scale-[0.98] transition"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #fff4d6, #f7cf5a, #d4a62a)",
                  boxShadow: "0 6px 14px -4px rgba(212,166,42,0.6)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#2d1c03">
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                </svg>
              </span>
              <div className="flex-1 min-w-0" dir="ltr">
                <div className="text-[17px] font-extrabold text-[#0e1a3d] leading-none tabular-nums">
                  {contactPhone}
                </div>
                <div
                  className="text-[10.5px] text-[#0e1a3d]/60 mt-1 font-bold leading-[1.7]"
                  dir="rtl"
                >
                  ساعات پاسخ‌گویی در روزهای کاری:
                  <br />
                  شنبه تا چهارشنبه — ساعت ۹:۰۰ الی ۱۸:۰۰
                  <br />
                  پنجشنبه — ساعت ۹:۰۰ الی ۱۴:۰۰
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ EDITORIAL / BLOG ═══════════ */}
      {articles.length > 0 && (
        <section className="px-5 py-12 bg-[#f7fafd] border-t border-[#e3e9f4]">
          <div className="flex items-end justify-between pb-5 mb-6 border-b border-[#081738]/[0.08]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  aria-hidden
                  className="h-px w-[22px]"
                  style={{
                    background: "linear-gradient(90deg, #1b3c8a, transparent)",
                  }}
                />
                <span className="text-[10px] tracking-[0.38em] font-extrabold text-[#1b3c8a]/70">
                  NAMDAR · EDITORIAL
                </span>
              </div>
              <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[26px] font-black leading-none text-[#081738]">
                بلاگ
              </h2>
            </div>
            <Link href="/articles" className="text-[12px] font-bold text-[#1b3c8a]">
              مقالات بیشتر ←
            </Link>
          </div>

          <div className="space-y-4">
            {articles.map((a, i) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="group flex gap-3 items-start rounded-2xl p-3 hover:bg-white transition active:scale-[0.99]"
              >
                <div className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#eef2f9] to-[#dbe3f2]">
                  {a.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={a.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[28px] font-black text-[#1b3c8a]/20 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] tracking-[0.18em] font-extrabold text-[#1b3c8a]/60 mb-1">
                    /{String(i + 1).padStart(2, "0")} · {a.category}
                  </div>
                  <h3 className="font-['Yekan_Bakh:Bold',sans-serif] text-[14px] font-extrabold leading-tight line-clamp-2 mb-1">
                    {a.title}
                  </h3>
                  <p className="text-[11.5px] text-[#0e1a3d]/60 leading-[1.7] line-clamp-2">
                    {a.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Wall of Fame (mobile) ===== */}
      {wallOfFameItems.length > 0 && (
        <section className="px-4 py-10 bg-white" dir="rtl">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span
                aria-hidden
                className="h-px w-[28px]"
                style={{
                  background: "linear-gradient(90deg, #f7cf5a, transparent)",
                }}
              />
              <span className="text-[10px] tracking-[0.38em] font-extrabold text-[#1b3c8a]/70">
                NAMDAR · HONORS
              </span>
            </div>
            <h2 className="font-['Yekan_Bakh:Bold',sans-serif] text-[26px] font-black leading-none text-[#081738]">
              دیوار افتخارات
            </h2>
            <p className="mt-3 text-[13px] text-[#081738]/65 leading-[1.9]">
              لحظه‌های موفقیت دانش‌پذیران آکادمی نامدار.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {wallOfFameItems.map((w) => (
              <article
                key={w.id}
                className="relative rounded-2xl overflow-hidden bg-[#081738]/[0.03] border border-[#081738]/[0.06] aspect-[4/5]"
              >
                {w.kind === "video" ? (
                  <InlineVideo
                    videoUrl={w.url}
                    poster={w.posterUrl}
                    title={w.studentName ?? w.caption}
                    className="absolute inset-0 w-full h-full"
                    variant="gold"
                    buttonSize={52}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={w.url}
                    alt={w.caption ?? w.studentName ?? ""}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(8,23,56,0.85) 0%, rgba(8,23,56,0.2) 50%, transparent 75%)",
                  }}
                />
                {(w.studentName || w.caption) && (
                  <div className="absolute bottom-0 right-0 left-0 p-3 pointer-events-none">
                    {w.studentName && (
                      <h3
                        className="font-['Yekan_Bakh:Bold',sans-serif] text-white text-[13px] font-extrabold leading-tight"
                        dir="auto"
                      >
                        {w.studentName}
                      </h3>
                    )}
                    {w.caption && (
                      <p
                        className="text-white/80 text-[11px] mt-1 leading-[1.6] line-clamp-2"
                        dir="auto"
                      >
                        {w.caption}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
