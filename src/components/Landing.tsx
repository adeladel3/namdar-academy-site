import Link from "@/components/SafeLink";
import MonCoachingSection from "@/components/MonCoachingSection";
import MonActionBoxes from "@/components/MonActionBoxes";
import ExploreCoursesSection, {
  type LandingSlotOverride,
} from "@/components/ExploreCoursesSection";
import InvestmentServicesSection from "@/components/InvestmentServicesSection";
import InvestingHubDetails from "@/components/InvestingHubDetails";
import InlineVideo from "@/components/InlineVideo";
import LeadForm from "@/components/LeadForm";
import ConsultationRequestButton from "@/components/ConsultationRequestButton";
import { getCourseRating, getSetting, listArticles, listCourses, listWallOfFame } from "@/lib/db";
import { faDigits, phoneToTelHref } from "@/lib/formatting";

const imgUntitledPanorama8Copy1 = "/figma/untitledpanorama8copy1.png";
const imgRectangle33 = "/figma/rectangle33.png";
const imgRectangle34 = "/figma/rectangle34.png";
const imgRectangle37 = "/figma/rectangle37.png";
const imgLayer3 = "/figma/layer3.png";
const imgF7Eff535B0Ed407AA6C3E4D475E4Fc741 = "/figma/f7eff535b0ed407aa6c3e4d475e4fc741.png";
const imgImage1 = "/figma/image1.png";
const imgLayer11 = "/figma/layer11.png";
const imgFinvestCopy1 = "/figma/finvestcopy1.png";
const imgUntitled1Copy1 = "/figma/untitled1copy1.png";
const imgPortraitTeacherGivingOnlineClass2 = "/figma/portraitteachergivingonlineclass2.jpg";
const imgImage9 = "/figma/image9.png";
const imgImage10 = "/figma/image10.png";
const imgImage11 = "/figma/image11.png";
const imgImage13 = "/figma/image13.png";
const imgImage15 = "/figma/image15.png";
const imgImage17 = "/figma/image17.png";
const imgImage18 = "/figma/image18.png";
const imgRectangle4496 = "/figma/rectangle4496.jpg";
const imgRectangle4498 = "/figma/rectangle4498.jpg";
const img1 = "/figma/1.jpg";
const imgRectangle32 = "/figma/rectangle32.png";
const imgRectangle39 = "/figma/rectangle39.svg";
const imgHeaderPic = "/figma/headerpic.svg";
const imgLayer02 = "/figma/layer02.svg";
const imgEllipse2913 = "/figma/ellipse2913.svg";
const imgEllipse2912 = "/figma/ellipse2912.svg";
const imgSearch = "/figma/search.svg";
const imgEllipse19 = "/figma/ellipse19.svg";
const imgEllipse20 = "/figma/ellipse20.svg";
const imgEllipse21 = "/figma/ellipse21.svg";
const imgEllipse22 = "/figma/ellipse22.svg";
const imgGroup67 = "/figma/group67.svg";
const imgPortraitTeacherGivingOnlineClass1 = "/figma/portraitteachergivingonlineclass1.svg";
const imgPortraitTeacherGivingOnlineClass3 = "/figma/portraitteachergivingonlineclass3.svg";
const imgImage8 = "/figma/image8.svg";
const imgImage7 = "/figma/image7.svg";
const imgImage12 = "/figma/image12.svg";
const imgGroup70 = "/figma/group70.svg";
const imgEllipse105 = "/figma/ellipse105.svg";
const imgEllipse108 = "/figma/ellipse108.svg";
const imgEllipse106 = "/figma/ellipse106.svg";
const imgEllipse107 = "/figma/ellipse107.svg";
const imgGroup90 = "/figma/group90.svg";
const imgGroup88 = "/figma/group88.svg";
const imgImage14 = "/figma/image14.svg";
const imgImage16 = "/figma/image16.svg";
const imgEllipse104 = "/figma/ellipse104.svg";
const imgGroup12 = "/figma/group12.svg";
const imgLine6 = "/figma/line6.svg";
const imgLine7 = "/figma/line7.svg";
const imgLine8 = "/figma/line8.svg";
const imgEllipse118 = "/figma/ellipse118.svg";
const imgPolygon3 = "/figma/polygon3.svg";
const imgGroup68 = "/figma/group68.svg";
const imgPhone1 = "/figma/phone1.svg";
const imgImage19 = "/figma/image19.svg";
const imgPortraitTeacherGivingOnlineClass4 = "/figma/portraitteachergivingonlineclass4.svg";
const imgMaskGroup = "/figma/maskgroup.svg";
const imgPortraitTeacherGivingOnlineClass5 = "/figma/portraitteachergivingonlineclass5.svg";
const imgImage20 = "/figma/image20.svg";
const imgGroup102 = "/figma/group102.svg";
const imgLine9 = "/figma/line9.svg";
const imgGroup105 = "/figma/group105.svg";
const imgGroup1000001986 = "/figma/group1000001986.svg";
const imgGroup1000001987 = "/figma/group1000001987.svg";

export default function Landing() {
  const monVideoUrl = getSetting<string>("landing.monVideoUrl") || "";
  const monPosterUrl =
    getSetting<string>("landing.monPosterUrl") ||
    "/figma/screenshot00080208at1732541.png";

  const rollupVideo1 =
    getSetting<string>("landing.rollup1VideoUrl") || monVideoUrl;
  const rollupVideo2 =
    getSetting<string>("landing.rollup2VideoUrl") || monVideoUrl;
  const rollupVideo3 =
    getSetting<string>("landing.rollup3VideoUrl") || monVideoUrl;

  const contactPhone =
    getSetting<string>("site.contactPhone") || "021-9100-8222";
  const contactTelHref = phoneToTelHref(contactPhone);

  // «دیوار افتخارات» — تصاویر و ویدئوهای موفقیت دانش‌پذیران، در انتهای صفحه
  // فرود (زیر بخش بلاگ). از /admin/wall-of-fame اضافه می‌شود.
  const wallOfFameItems = listWallOfFame({ publishedOnly: true });

  // "Our Success" strip — 5 stat slots, editable from /admin/settings/landing.
  // Keep defaults inline so a fresh DB (or an admin clearing a field) still
  // shows the original numbers instead of an empty spot.
  const STAT_DEFAULTS: { value: string; label: string }[] = [
    { value: "15K+", label: "دانش پذیر" },
    { value: "75%", label: "موفقیت در ترید" },
    { value: "35", label: "دوره آموزشی حضوری و غیر حضوری" },
    { value: "26", label: "تجربه منتورینگ" },
    { value: "16", label: "سال تجربه آموزش" },
  ];
  const stats = STAT_DEFAULTS.map((d, i) => {
    const idx = i + 1;
    return {
      value:
        getSetting<string>(`landing.stat${idx}.value`)?.trim() || d.value,
      label:
        getSetting<string>(`landing.stat${idx}.label`)?.trim() || d.label,
    };
  });

  const blogArticles = listArticles({ publishedOnly: true })
    .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
    .slice(0, 3);

  // Build overrides for all 7 landing pills. Every slot comes from the DB —
  // nothing on this strip is hardcoded business content. If an admin pinned
  // a course to a slot via `landingSlot`, it wins; remaining slots are filled
  // with the most popular unpinned courses so the strip is always complete.
  const landingSlotOverrides: (LandingSlotOverride | null)[] = [
    null, null, null, null, null, null, null,
  ];
  const publishedCourses = listCourses({ status: "published" });

  function toOverride(c: (typeof publishedCourses)[number]): LandingSlotOverride {
    const priceText = c.isFree
      ? "رایگان"
      : faDigits(c.price.toLocaleString("en-US")) + " تومان";
    const levelLabel =
      c.level === "beginner"
        ? "سطح مقدماتی"
        : c.level === "intermediate"
        ? "سطح متوسط"
        : "سطح پیشرفته";
    // Prefer the real approved-review average; if nobody has rated yet, fall
    // back to the legacy-imported `rating` (some old courses carry an
    // aggregate from the previous CMS). Last-resort default keeps the stars
    // looking sensible until real reviews land.
    const liveRating = getCourseRating(c.slug);
    const legacyRating =
      typeof (c as unknown as { rating?: number }).rating === "number"
        ? (c as unknown as { rating: number }).rating
        : 0;
    const rating =
      liveRating.count > 0
        ? liveRating.avg
        : legacyRating > 0 && legacyRating <= 5
        ? legacyRating
        : 4.8;
    const o: LandingSlotOverride = {
      pillLabel: c.title,
      detailTitle: c.title,
      detailLevel: levelLabel,
      description: c.shortDesc,
      price: priceText,
      bannerTitle: c.bannerTitle || c.title,
      slug: c.slug,
      rating,
    };
    if (c.accentColor) o.color = c.accentColor;
    if (c.externalHref) o.href = c.externalHref;

    // عکس بنر: برای دوره MON از تصویر صفحه /coaching استفاده می‌شود
    // (همان عکسی که در /admin/settings/coaching تنظیم شده). برای سایر دوره‌ها
    // از previewImage خود دوره استفاده می‌شود تا هر کارت عکس واقعی خودش را
    // نشان دهد — نه تصویر مشترک LQ1.
    if (c.slug === "mon") {
      const coachingBanner = getSetting<string>("coaching.bannerImageUrl");
      if (coachingBanner) o.bannerImage = coachingBanner;
      else if (c.previewImage) o.bannerImage = c.previewImage;
    } else if (c.previewImage) {
      o.bannerImage = c.previewImage;
    }
    return o;
  }

  // 1) Pinned: admin-assigned landingSlot
  const pinnedSlugs = new Set<string>();
  for (const c of publishedCourses) {
    const s = c.landingSlot;
    if (typeof s !== "number" || s < 0 || s > 6) continue;
    if (landingSlotOverrides[s]) continue;
    landingSlotOverrides[s] = toOverride(c);
    pinnedSlugs.add(c.slug);
  }
  // 2) Auto-fill any remaining slots with the most popular unpinned courses
  const pool = publishedCourses
    .filter((c) => !pinnedSlugs.has(c.slug))
    .sort(
      (a, b) =>
        (b.studentsCount ?? 0) - (a.studentsCount ?? 0) ||
        (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt)
    );
  for (let i = 0; i < 7; i++) {
    if (landingSlotOverrides[i]) continue;
    const pick = pool.shift();
    if (pick) landingSlotOverrides[i] = toOverride(pick);
  }

  const faDate = (ts: number) => {
    try {
      return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(ts));
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white relative size-full" data-node-id="4:18" data-name="Landing">
      <div className="absolute h-[807px] left-[-27px] mix-blend-luminosity opacity-74 top-[1019px] w-[1944px]" data-node-id="4:19" data-name="Untitled_Panorama-8 copy 1">
        <div className="absolute inset-0 opacity-25 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[110.92%] left-0 max-w-none top-[-0.01%] w-full" src={imgUntitledPanorama8Copy1} />
        </div>
      </div>
      {/* ===== Editorial — Minimal Blog Grid ===== */}
      <div
        className="absolute left-[156px] right-[156px] top-[7678px]"
        data-node-id="4:52"
        data-name="Blog Editorial"
        dir="rtl"
      >
        {/* Header row */}
        <div className="flex items-end justify-between pb-7 mb-12 border-b border-[#081738]/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                aria-hidden
                className="h-px w-[34px]"
                style={{
                  background:
                    "linear-gradient(90deg, #1b3c8a, transparent)",
                }}
              />
              <span className="text-[10.5px] tracking-[0.42em] font-extrabold text-[#1b3c8a]/70 font-['Poppins:SemiBold',sans-serif]">
                NAMDAR · EDITORIAL
              </span>
            </div>
            <h2
              className="font-['Yekan_Bakh:Bold',sans-serif] text-[#081738] text-[56px] font-extrabold leading-none tracking-tight"
              dir="auto"
            >
              بلاگ
            </h2>
          </div>

          <Link
            href="/articles"
            className="group flex items-center gap-3 text-[14px] font-['Yekan_Bakh:Bold',sans-serif] font-extrabold text-[#081738] hover:text-[#1b3c8a] transition"
          >
            <span className="border-b border-dashed border-[#081738]/30 group-hover:border-[#1b3c8a] pb-0.5">
              مشاهده همهٔ مقالات
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#081738]/15 group-hover:border-[#1b3c8a]/50 group-hover:bg-[#1b3c8a]/[0.04] transition">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
          </Link>
        </div>

        {/* 3-column article grid — typography-first, minimal */}
        <div className="grid grid-cols-3 gap-10">
          {blogArticles.map((article, i) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group relative block"
            >
              {/* Numbered meta rail */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[11px] tracking-[0.3em] font-extrabold text-[#1b3c8a]/65 font-['Poppins:SemiBold',sans-serif] tabular-nums">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-[#081738]/10"
                />
                <span className="text-[10.5px] tracking-[0.22em] font-extrabold text-[#081738]/55 font-['Yekan_Bakh:Medium',sans-serif]">
                  {article.category}
                </span>
              </div>

              {/* Cover — image or gradient fallback */}
              <div
                className="relative aspect-[4/3] rounded-[14px] overflow-hidden mb-6 border border-[#081738]/[0.06]"
                style={{
                  background:
                    "linear-gradient(135deg, #eef2f9 0%, #e5eaf5 55%, #dde3ee 100%)",
                }}
              >
                {article.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                ) : (
                  // Typography fallback when no cover
                  <div className="absolute inset-0 flex items-end p-8">
                    <span
                      className="font-['Yekan_Bakh:Bold',sans-serif] text-[#1b3c8a]/15 text-[120px] font-extrabold leading-none"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
                {/* Gradient veil on hover */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, rgba(8,23,56,0.35) 100%)",
                  }}
                />
                {/* Subtle inline accent stripe — bottom */}
                <div
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-[width] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    background:
                      "linear-gradient(90deg, #f7cf5a, #d4a62a)",
                  }}
                />
              </div>

              {/* Title */}
              <h3
                className="font-['Yekan_Bakh:Bold',sans-serif] text-[#081738] text-[22px] font-extrabold leading-[1.5] group-hover:text-[#1b3c8a] transition-colors"
                dir="auto"
              >
                {article.title}
              </h3>

              {/* Meta footer: date · read minutes · arrow */}
              <div className="mt-4 flex items-center justify-between text-[12px] text-[#081738]/55 font-['Yekan_Bakh:Medium',sans-serif]">
                <div className="flex items-center gap-3">
                  <span>
                    {faDate(article.publishedAt || article.createdAt)}
                  </span>
                  <span
                    aria-hidden
                    className="w-1 h-1 rounded-full bg-[#081738]/25"
                  />
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                    {faDigits(article.readMinutes)} دقیقه
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[#1b3c8a] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-400 font-extrabold">
                  ادامه مطلب
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="absolute contents left-0 top-[-1px]" data-node-id="4:81" data-name="Header">
        <div className="absolute contents left-0 top-[-1px]" data-node-id="4:82" data-name="header-bg">
          <div className="absolute h-[1118px] left-0 top-[-1px] w-[1920px]" data-node-id="4:83" data-name="header-pic">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHeaderPic} />
          </div>
        </div>
      </div>
      {/* Landing header brand lockup removed — SiteHeader (in (site) layout) provides global brand+nav for all routes. */}
      <ExploreCoursesSection slotOverrides={landingSlotOverrides} />
      <div className="absolute contents left-[174px] top-[1533px]" data-node-id="4:125" data-name="Our Success">
        <div className="absolute content-stretch flex gap-[95px] items-start left-[174px] not-italic top-[1533px] whitespace-nowrap" data-node-id="4:126">
          {stats.map((s, i) => (
            <div
              key={i}
              className="content-stretch flex flex-col items-center relative shrink-0"
            >
              <p
                className="bg-clip-text bg-gradient-to-r font-['Buenos_Aires_Trial:Light',sans-serif] from-[#136cb5] leading-none relative shrink-0 text-[96px] text-[transparent] to-[#49bbbd]"
                dir="ltr"
              >
                {s.value}
              </p>
              <p
                className="font-['Yekan_Bakh:Bold',sans-serif] leading-[1.3] relative shrink-0 text-[32px] text-[rgba(1,5,20,0.8)]"
                dir="auto"
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute contents left-[9px] right-[-9px] top-[-1px]" data-node-id="4:146" data-name="Mask group">
        <div className="absolute aspect-[4096/2731] left-[-146px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[155px_52px] mask-size-[1920px_1118px] right-[-164px] top-[-53px]" data-node-id="4:158" style={{ maskImage: `url('${imgLayer02}')` }} data-name="Layer 0 2">
          <img alt="" className="absolute inset-0 max-w-none object-cover opacity-5 pointer-events-none size-full" src={imgLayer3} />
        </div>
        <div className="absolute h-[931px] left-[-66px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[66px_-123px] mask-size-[1920px_1118px] top-[122px] w-[970px]" data-node-id="4:159" style={{ maskImage: `url('${imgLayer02}')` }}>
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
            src={imgF7Eff535B0Ed407AA6C3E4D475E4Fc741}
            style={{
              maskImage: "linear-gradient(to bottom, black 70%, transparent 96%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 96%)",
            }}
          />
        </div>
      </div>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Medium',sans-serif] leading-[0] left-[calc(16.67%+1194px)] not-italic text-[#06142f] text-[48px] text-right top-[1212px] whitespace-nowrap" dir="auto" data-node-id="4:160">
        <span className="leading-[normal]">{`مرجع آموزش ترید و سرمایه گذاری با بیش از `}</span>
        <span className="font-['Yekan_Bakh:Heavy',sans-serif] leading-[normal]">یک میلیون</span>
        <span className="leading-[normal]">{` کاربر فعال`}</span>
      </p>
      {/* Brand circles — temporarily hidden. Flip SHOW_BRAND_CIRCLES to true to re-enable. */}
      {(() => {
        const SHOW_BRAND_CIRCLES = false;
        if (!SHOW_BRAND_CIRCLES) return null;
        const ROW_TOP = 560;
        const HALO_SIZE = 120;
        const LOGO_SIZE = 96;
        const LOGO_OFFSET = (HALO_SIZE - LOGO_SIZE) / 2;
        const GAP = 95;
        const RIGHT_EDGE = 1490;
        // RTL order: MON first (rightmost), then NOVA, LQ1, FINVEST
        // FINVEST source PNG is wider than tall with the circle on the left half,
        // so it needs special crop styling to match the others visually.
        const circles = [
          { img: imgImage1, bg: "radial-gradient(circle, rgba(255,176,75,0.55) 0%, rgba(255,176,75,0) 75%)", mon: true },
          { img: imgUntitled1Copy1, bg: "radial-gradient(circle, rgba(66,71,186,0.55) 0%, rgba(66,71,186,0) 75%)" },
          { img: imgLayer11, bg: "radial-gradient(circle, rgba(12,156,75,0.55) 0%, rgba(12,156,75,0) 75%)" },
          { img: imgFinvestCopy1, bg: "radial-gradient(circle, rgba(18,18,18,0.45) 0%, rgba(18,18,18,0) 75%)", finvest: true },
        ];
        return circles.map((c, i) => {
          const left = RIGHT_EDGE - HALO_SIZE - i * (HALO_SIZE + GAP);
          return (
            <div key={i}>
              <div
                className="absolute rounded-full"
                style={{
                  left,
                  top: ROW_TOP,
                  width: HALO_SIZE,
                  height: HALO_SIZE,
                  background: c.bg,
                }}
              />
              <div
                className="absolute rounded-full overflow-hidden pointer-events-none"
                style={{
                  left: left + LOGO_OFFSET,
                  top: ROW_TOP + LOGO_OFFSET,
                  width: LOGO_SIZE,
                  height: LOGO_SIZE,
                }}
              >
                {c.finvest ? (
                  <img
                    alt=""
                    className="absolute"
                    style={{ left: -36, top: -20, width: 252, height: 125, maxWidth: "none" }}
                    src={c.img}
                  />
                ) : c.mon ? (
                  // MON source PNG has "STUDENT REVIEWS" text under the sphere;
                  // render taller than the wrapper and clip bottom via overflow-hidden.
                  <img
                    alt=""
                    className="absolute"
                    style={{ left: 0, top: 0, width: 96, height: 141, maxWidth: "none" }}
                    src={c.img}
                  />
                ) : (
                  <img
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                    src={c.img}
                  />
                )}
              </div>
            </div>
          );
        });
      })()}
      {/* decorative ring kept near photo */}
      <div className="absolute left-[300px] size-[120px] top-[540px]" data-node-id="4:165">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse2913} />
      </div>
      {/* Search bar + category pills — temporarily hidden. Flip SHOW_SEARCH to true to re-enable. */}
      {(() => {
        const SHOW_SEARCH = false;
        if (!SHOW_SEARCH) return null;
        return (
          <>
            <div className="absolute backdrop-blur-[5.15px] bg-[rgba(217,217,217,0.31)] border border-solid border-white h-[64px] left-[calc(16.67%+254px)] rounded-[64px] top-[600px] w-[916px]" data-node-id="4:177" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[50px] left-[calc(58.33%+303px)] not-italic text-[#aeb6b6] text-[18px] text-right top-[607px] whitespace-nowrap" dir="auto" data-node-id="4:179">
              دوره مورد نظر خود را جستجو کن
            </p>
            <div className="absolute bg-[#1b3c8a] border border-solid border-white h-[64px] left-[calc(16.67%+255px)] rounded-bl-[40px] rounded-tl-[40px] top-[600px] w-[150px]" data-node-id="4:180" />
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(66.67%+84.28px)] rounded-[6px] top-[672px] w-[125.704px]" data-node-id="4:182" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(58.33%+334px)] not-italic text-[17px] text-right text-white top-[653px] w-[117px]" dir="auto" data-node-id="4:184">
              تکنیکال
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(58.33%+112.66px)] rounded-[6px] top-[672px] w-[125.704px]" data-node-id="4:185" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(58.33%+211px)] not-italic text-[17px] text-right text-white top-[653px] w-[87px]" dir="auto" data-node-id="4:186">
              فاندامنتال
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(25%+204px)] rounded-[6px] top-[672px] w-[125.704px]" data-node-id="4:187" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(25%+305px)] not-italic text-[17px] text-right text-white top-[654px] w-[93px]" dir="auto" data-node-id="4:188">
              فاندامنتال
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(33.33%+175.62px)] rounded-[6px] top-[672px] w-[260.282px]" data-node-id="4:189" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(33.33%+411px)] not-italic text-[17px] text-right text-white top-[654px] w-[253px]" dir="auto" data-node-id="4:190">
              موضوعات روان‌شناسی معاملات
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(50%+197.24px)] rounded-[6px] top-[672px] w-[69.507px]" data-node-id="4:191" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(50%+244px)] not-italic text-[17px] text-right text-white top-[653px] w-[45px]" dir="auto" data-node-id="4:192">
              طلا
            </p>
            <div className="absolute bg-[rgba(27,60,138,0.7)] h-[32px] left-[calc(50%+121.82px)] rounded-[6px] top-[672px] w-[69.507px]" data-node-id="4:193" />
            <p className="-translate-x-full absolute font-['Yekan_Bakh:Regular',sans-serif] h-[105px] leading-[71px] left-[calc(50%+166px)] not-italic text-[17px] text-right text-white top-[653px] w-[46px]" dir="auto" data-node-id="4:194">
              دلار
            </p>
          </>
        );
      })()}
      <div className="absolute h-[101px] left-[calc(33.33%+61px)] top-[1352px] w-[516px]" data-node-id="4:195">
        <ConsultationRequestButton
          source="landing-hero-desktop"
          triggerClassName="block w-full h-full rounded-xl bg-[#1b3c8a] hover:bg-[#254aa0] active:scale-[0.99] transition-colors text-white font-['Yekan_Bakh:Medium',sans-serif] text-[32px] whitespace-nowrap cursor-pointer"
          triggerStyle={{}}
          triggerLabel="درخواست ثبت مشاوره"
        />
      </div>
      <p className="-translate-x-full absolute font-['Yekan_Bakh:Bold',sans-serif] leading-[normal] left-[calc(41.67%+998px)] not-italic text-[#081738] text-[45px] text-right top-[4204px] w-[893px]" dir="auto" data-node-id="4:259">
        دوره های غیر حضوری
      </p>
      {/* Section heading — clearly marks entry to "Investing Hub" */}
      <div
        className="-translate-x-1/2 absolute left-[calc(50%-2.5px)] top-[5040px] w-[893px] flex flex-col items-center"
        data-node-id="4:260"
        dir="rtl"
      >
        {/* Eyebrow row — English label between hairlines */}
        <div className="flex items-center gap-4 mb-5">
          <span
            aria-hidden
            className="block h-px w-[80px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(27,60,138,0.55))",
            }}
          />
          <span
            className="text-[14px] tracking-[0.42em] font-extrabold uppercase"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#1b3c8a",
            }}
          >
            Investing Hub
          </span>
          <span
            aria-hidden
            className="block h-px w-[80px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(27,60,138,0.55), transparent)",
            }}
          />
        </div>
        {/* Persian title — IRANSans */}
        <p
          className="not-italic leading-none text-[#081738] text-[56px] text-center"
          style={{
            fontFamily: "var(--font-iransans), 'Yekan Bakh', sans-serif",
            fontWeight: 800,
          }}
          dir="auto"
        >
          اینوستینگ هاب
        </p>
        {/* One-line product description */}
        <p
          className="not-italic text-center text-[#3a4a6e] text-[18px] mt-5 leading-[1.7]"
          style={{
            fontFamily: "var(--font-iransans), 'Yekan Bakh', sans-serif",
            fontWeight: 500,
          }}
          dir="rtl"
        >
          هیچ‌وقت همهٔ تخم‌مرغ‌هایت را در یک سبد نگذار — با فینوست، حرفه‌ای معامله کن؛ با نوا، سبد اختصاصی بچین. دو بالِ مکملِ مدیریتِ هوشمندِ سرمایه.
        </p>
      </div>
      <InvestmentServicesSection />
      <InvestingHubDetails />

      <MonCoachingSection videoSrc={monVideoUrl} poster={monPosterUrl} />
      <MonActionBoxes contactPhone={contactPhone} />
      {/* ===== MON · Clean Hero Banner ===== */}
      <div
        className="absolute left-[-11px] top-[1892px] w-[1929px] h-[520px] overflow-hidden"
        data-node-id="4:291"
        data-name="MON Hero Banner"
        dir="rtl"
      >
        {/* Light premium base — frames the hero */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #f4f6fa 0%, #ffffff 45%, #eef2f7 100%)",
          }}
        />
        {/* Ambient glows (very soft) */}
        <div
          aria-hidden
          className="absolute top-0 right-[22%] w-[620px] h-[420px] rounded-full blur-[130px] pointer-events-none opacity-[0.32]"
          style={{
            background:
              "radial-gradient(circle, #f7cf5a, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-[20%] w-[520px] h-[320px] rounded-full blur-[110px] pointer-events-none opacity-[0.25]"
          style={{
            background:
              "radial-gradient(circle, #1b3c8a, transparent 70%)",
          }}
        />

        {/* ===== Centered content frame ===== */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full max-w-[1640px] px-[40px] py-[30px] flex items-stretch">
            <div className="w-full h-full grid grid-cols-[1fr_460px] gap-7">

              {/* ========== RIGHT (RTL first) — HERO WITH ANIMATED MON LOGO ========== */}
              <figure
                className="relative rounded-[28px] overflow-hidden border border-[#1b3c8a]/20 shadow-[0_28px_70px_-22px_rgba(14,26,61,0.45)]"
                data-slot="hero-media"
              >
                {/* Deep premium background */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 90% 80% at 55% 45%, #1b2d6e 0%, #0e1a3d 45%, #070c24 85%)",
                  }}
                />

                {/* Ambient gold glow behind logo */}
                <div
                  aria-hidden
                  className="absolute top-1/2 right-[30%] -translate-y-1/2 w-[560px] h-[560px] rounded-full blur-[120px] pointer-events-none opacity-70"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(247,207,90,0.28), transparent 65%)",
                    animation:
                      "coaching-aurora 4.4s ease-in-out infinite",
                  }}
                />

                {/* Subtle grid overlay (trading-desk feel) */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(247,207,90,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(247,207,90,0.4) 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent 90%)",
                    maskImage:
                      "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent 90%)",
                  }}
                />

                {/* Tiny twinkling stars */}
                {[
                  ["12%", "22%", "0s"],
                  ["82%", "18%", "1.2s"],
                  ["68%", "78%", "0.6s"],
                  ["22%", "80%", "1.8s"],
                  ["48%", "14%", "2.4s"],
                  ["92%", "54%", "0.9s"],
                  ["8%", "58%", "1.5s"],
                ].map(([top, left, delay], i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute w-[3px] h-[3px] rounded-full bg-[#f7cf5a] pointer-events-none"
                    style={{
                      top,
                      left,
                      boxShadow: "0 0 6px #f7cf5a",
                      animation: `coaching-star-twinkle 2.6s ease-in-out ${delay} infinite`,
                    }}
                  />
                ))}

                {/* TOP-RIGHT (RTL start): LIVE chip */}
                <div className="absolute top-6 right-6 inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] tracking-[0.3em] font-extrabold text-white font-['Poppins:SemiBold',sans-serif] z-20">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-[#f7cf5a] animate-ping opacity-70" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
                  </span>
                  در حال اجرا · فصل چهارم
                </div>

                {/* TOP-LEFT (RTL end): Chart deco */}
                <div
                  aria-hidden
                  className="absolute top-6 left-6 opacity-55 pointer-events-none z-20"
                >
                  <svg
                    width="140"
                    height="44"
                    viewBox="0 0 140 44"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="monChartGrad"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f7cf5a"
                          stopOpacity="0.45"
                        />
                        <stop
                          offset="100%"
                          stopColor="#f7cf5a"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 2 36 L 16 30 L 30 34 L 44 22 L 58 26 L 72 14 L 86 18 L 100 8 L 114 12 L 128 4"
                      stroke="#f7cf5a"
                      strokeWidth="1.6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 2 36 L 16 30 L 30 34 L 44 22 L 58 26 L 72 14 L 86 18 L 100 8 L 114 12 L 128 4 L 128 44 L 2 44 Z"
                      fill="url(#monChartGrad)"
                    />
                    {[
                      [16, 30],
                      [44, 22],
                      [72, 14],
                      [100, 8],
                    ].map(([cx, cy]) => (
                      <circle
                        key={`${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r="2"
                        fill="#f7cf5a"
                      />
                    ))}
                  </svg>
                </div>

                {/* ===== MAIN CONTENT: Logo + slogan, side by side ===== */}
                <div className="relative h-full flex items-center justify-between px-[64px] gap-10">
                  {/* --- Right (RTL first): Animated MON logo --- */}
                  <div
                    className="relative shrink-0 w-[300px] h-[300px]"
                    style={{ animation: "mon-drift 5s ease-in-out infinite" }}
                  >
                    {/* Pulsing rings — radiate from sphere */}
                    {[0, 1.4, 2.8].map((d) => (
                      <span
                        key={d}
                        aria-hidden
                        className="absolute inset-[40px] rounded-full border border-[#f7cf5a]/60 pointer-events-none"
                        style={{
                          animation: `mon-pulse-ring 4.2s ease-out ${d}s infinite`,
                        }}
                      />
                    ))}

                    {/* Outer orbital ring (dashed, slow CCW) */}
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-full border border-dashed border-[#f7cf5a]/35 pointer-events-none"
                      style={{
                        animation:
                          "mon-ring-spin 38s linear infinite reverse",
                      }}
                    >
                      <span
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f7cf5a]"
                        style={{
                          boxShadow: "0 0 12px #f7cf5a",
                        }}
                      />
                    </div>

                    {/* Middle orbital ring (thin solid, CW) */}
                    <div
                      aria-hidden
                      className="absolute inset-[22px] rounded-full border border-[#f7cf5a]/50 pointer-events-none"
                      style={{
                        animation: "mon-ring-spin 22s linear infinite",
                      }}
                    >
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"
                        style={{
                          boxShadow: "0 0 10px #ffffff",
                        }}
                      />
                      <span
                        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#f7cf5a]"
                        style={{
                          boxShadow: "0 0 10px #f7cf5a",
                        }}
                      />
                    </div>

                    {/* Main MON sphere — real logo PNG */}
                    <div
                      className="absolute inset-[50px] rounded-full overflow-hidden shadow-[0_22px_56px_-10px_rgba(247,207,90,0.6)]"
                      style={{
                        animation:
                          "coaching-planet-breathe 4s ease-in-out infinite",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/figma/image1.png"
                        alt="لوگوی MON"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: "center top" }}
                      />
                      {/* Subtle top highlight sheen */}
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(circle at 35% 22%, rgba(255,255,255,0.22), transparent 45%)",
                        }}
                      />
                      {/* Shimmer sweep overlay */}
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay"
                        style={{
                          backgroundImage:
                            "linear-gradient(100deg, transparent 38%, rgba(255,255,255,0.42) 50%, transparent 62%)",
                          backgroundSize: "220px 100%",
                          animation: "mon-shimmer 3.6s linear infinite",
                        }}
                      />
                    </div>

                    {/* Outer soft halo */}
                    <span
                      aria-hidden
                      className="absolute -inset-6 rounded-full blur-2xl pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(247,207,90,0.42), transparent 60%)",
                        animation:
                          "coaching-aurora 3.2s ease-in-out infinite",
                      }}
                    />
                  </div>

                  {/* --- Left (RTL last): Slogan text (minimal motion) --- */}
                  <div className="flex-1 text-right" dir="auto">
                    {/* Eyebrow — line grows + label fades in */}
                    <div className="mb-5 inline-flex items-center gap-3">
                      <span
                        aria-hidden
                        className="block h-px w-[34px] origin-right"
                        style={{
                          background:
                            "linear-gradient(90deg, #f7cf5a, transparent)",
                          animation:
                            "mon-line-grow 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s both",
                        }}
                      />
                      <span
                        className="text-[11.5px] tracking-[0.36em] font-extrabold text-[#f7cf5a] font-['Poppins:SemiBold',sans-serif]"
                        style={{
                          animation:
                            "mon-reveal-up 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s both",
                        }}
                      >
                        NAMDAR · ALGORITHMIC TRADING
                      </span>
                    </div>

                    {/* Headline — staggered reveal per line */}
                    <h2
                      className="font-['Yekan_Bakh:Bold',sans-serif] text-white leading-[1.15]"
                      dir="auto"
                    >
                      <span
                        className="block text-[44px] font-extrabold tracking-tight"
                        style={{
                          animation:
                            "mon-reveal-up 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both",
                        }}
                      >
                        جدیدترین سبک ترید{" "}
                        {/* Gold word with continuous shimmer sweep */}
                        <span
                          className="inline-block"
                          style={{
                            backgroundImage:
                              "linear-gradient(110deg, #d4a62a 0%, #f7cf5a 18%, #fff8e0 36%, #fff4d6 50%, #fff8e0 64%, #f7cf5a 82%, #d4a62a 100%)",
                            backgroundSize: "220% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter:
                              "drop-shadow(0 2px 12px rgba(247,207,90,0.4))",
                            animation:
                              "mon-gold-shimmer 4.2s linear infinite",
                          }}
                        >
                          الگوریتمیک
                        </span>
                      </span>
                      <span
                        className="block text-[44px] font-extrabold tracking-tight mt-1"
                        style={{
                          animation:
                            "mon-reveal-up 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both",
                        }}
                      >
                        در دنیا
                      </span>
                    </h2>

                    {/* Supporting line — fades in last */}
                    <p
                      className="mt-4 text-[19px] text-white/80 font-['Yekan_Bakh:Medium',sans-serif] leading-[1.8] flex items-center gap-3 justify-end"
                      dir="auto"
                      style={{
                        animation:
                          "mon-reveal-up 0.9s cubic-bezier(0.22,1,0.36,1) 0.75s both",
                      }}
                    >
                      <span>از مبتدی تا پیشرفته</span>
                      <span
                        aria-hidden
                        className="inline-block w-[28px] h-px origin-left"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, #f7cf5a)",
                          animation:
                            "mon-line-grow 0.9s cubic-bezier(0.22,1,0.36,1) 0.9s both",
                        }}
                      />
                    </p>
                  </div>
                </div>
              </figure>

              {/* ========== LEFT (RTL last) — ACTION CARD ========== */}
              <aside className="relative flex items-center">
                <div className="w-full bg-white rounded-[24px] border border-[#e5eaf5] shadow-[0_28px_70px_-22px_rgba(14,26,61,0.25)] overflow-hidden">
                  {/* Gold top accent line */}
                  <div
                    aria-hidden
                    className="h-[3px]"
                    style={{
                      background:
                        "linear-gradient(90deg, #f7cf5a, #e8bc3a, #d4a62a)",
                    }}
                  />

                  <div className="p-8">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-2 text-[11px] tracking-[0.32em] font-extrabold text-[#1b3c8a]/75 font-['Poppins:SemiBold',sans-serif] mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
                      ENTRY · MON
                    </div>

                    {/* Title */}
                    <h3
                      className="font-['Yekan_Bakh:Bold',sans-serif] text-[26px] font-extrabold text-[#0e1a3d] leading-tight"
                      dir="auto"
                    >
                      درخواست مشاوره رایگان
                    </h3>
                    <p
                      className="text-[13.5px] text-[#0e1a3d]/60 leading-[1.9] mt-2 mb-5"
                      dir="auto"
                    >
                      ساعات پاسخ‌گویی در روزهای کاری:
                      <br />
                      شنبه تا چهارشنبه — ساعت ۹:۰۰ الی ۱۸:۰۰
                      <br />
                      پنجشنبه — ساعت ۹:۰۰ الی ۱۴:۰۰
                    </p>

                    {/* Lead form — POSTs to /api/callback-requests with MON as related course */}
                    <LeadForm
                      source="landing-desktop-mon-hero"
                      relatedCourseSlug="mon"
                      relatedCourseTitle="کوچینگ MON"
                      ctaLabel="درخواست مشاوره"
                    />

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                      <span className="flex-1 h-px bg-[#e5eaf5]" />
                      <span className="text-[11px] text-[#0e1a3d]/45 font-bold">
                        یا
                      </span>
                      <span className="flex-1 h-px bg-[#e5eaf5]" />
                    </div>

                    {/* Direct phone card */}
                    <a
                      href={contactTelHref}
                      className="group flex items-center gap-3.5 py-[12px] px-4 rounded-xl bg-[#f7cf5a]/10 border border-[#f7cf5a]/30 hover:bg-[#f7cf5a]/16 hover:border-[#f7cf5a]/45 transition"
                    >
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(212,166,42,0.6)]"
                        style={{
                          background:
                            "linear-gradient(135deg, #fff4d6, #f7cf5a, #d4a62a)",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="#2d1c03"
                        >
                          <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                        </svg>
                      </span>
                      <div className="flex-1" dir="ltr">
                        <div className="text-[19px] font-extrabold text-[#0e1a3d] leading-none tabular-nums">
                          {contactPhone}
                        </div>
                        <div
                          className="text-[11px] text-[#0e1a3d]/60 mt-1 font-bold leading-[1.7]"
                          dir="rtl"
                        >
                          ساعات پاسخ‌گویی در روزهای کاری:
                          <br />
                          شنبه تا چهارشنبه — ساعت ۹:۰۰ الی ۱۸:۰۰
                          <br />
                          پنجشنبه — ساعت ۹:۰۰ الی ۱۴:۰۰
                        </div>
                      </div>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0e1a3d"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-30 group-hover:opacity-60 transition"
                      >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      {/* ===== /MON · Clean Hero Banner ===== */}
      {/* ===== Featured Videos Gallery — editorial, minimal ===== */}
      <div
        className="absolute left-[156px] right-[156px] top-[6760px]"
        data-node-id="4:525"
        data-name="Featured Videos"
        dir="rtl"
      >
        {/* Header row */}
        <div className="flex items-end justify-between pb-7 mb-10 border-b border-[#081738]/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                aria-hidden
                className="h-px w-[34px]"
                style={{
                  background:
                    "linear-gradient(90deg, #1b3c8a, transparent)",
                }}
              />
              <span className="text-[10.5px] tracking-[0.42em] font-extrabold text-[#1b3c8a]/70 font-['Poppins:SemiBold',sans-serif]">
                NAMDAR · FILM
              </span>
            </div>
            <h2
              className="font-['Yekan_Bakh:Bold',sans-serif] text-[#081738] text-[52px] font-extrabold leading-none tracking-tight"
              dir="auto"
            >
              ویدیوهای منتخب
            </h2>
          </div>

          <Link
            href="/articles"
            className="group flex items-center gap-3 text-[14px] font-['Yekan_Bakh:Bold',sans-serif] font-extrabold text-[#081738] hover:text-[#1b3c8a] transition"
          >
            <span className="border-b border-dashed border-[#081738]/30 group-hover:border-[#1b3c8a] pb-0.5">
              مشاهدهٔ همه
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#081738]/15 group-hover:border-[#1b3c8a]/50 group-hover:bg-[#1b3c8a]/[0.04] transition">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
          </Link>
        </div>

        {/* 3-column video grid (RTL: first item appears on right) */}
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              idx: 1,
              title: "معرفی دورهٔ کوچینگ MON",
              category: "کوچینگ",
              duration: "۵ دقیقه",
              poster: "/figma/1.jpg",
              videoUrl: rollupVideo2,
            },
            {
              idx: 2,
              title: "سخنرانی استاد امیرحسین نام‌آور",
              category: "سخنرانی",
              duration: "۱۲ دقیقه",
              poster: "/figma/rectangle4496.jpg",
              videoUrl: rollupVideo1,
            },
            {
              idx: 3,
              title: "مرور بازارهای جهانی و طلا",
              category: "تحلیل",
              duration: "۸ دقیقه",
              poster: "/figma/rectangle4498.jpg",
              videoUrl: rollupVideo3,
            },
          ].map((v) => (
            <article
              key={v.idx}
              className="group relative"
            >
              {/* Number rail */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[11px] tracking-[0.3em] font-extrabold text-[#1b3c8a]/65 font-['Poppins:SemiBold',sans-serif] tabular-nums">
                  /{String(v.idx).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-[#081738]/10"
                />
                <span className="text-[10.5px] tracking-[0.22em] font-extrabold text-[#081738]/55 font-['Yekan_Bakh:Medium',sans-serif]">
                  {v.category}
                </span>
              </div>

              {/* Video frame — portrait 3:4 */}
              <div
                className="relative aspect-[3/4] rounded-[16px] overflow-hidden"
                style={{
                  boxShadow:
                    "0 30px 70px -22px rgba(8,23,56,0.35), 0 0 0 1px rgba(8,23,56,0.06)",
                }}
              >
                <InlineVideo
                  videoUrl={v.videoUrl}
                  poster={v.poster}
                  title={v.title}
                  className="absolute inset-0 w-full h-full"
                  buttonSize={84}
                  variant="gold"
                  overlay={
                    <>
                      {/* Top-to-bottom gradient for chip/title readability */}
                      <div
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(8,15,42,0.4) 0%, transparent 30%, transparent 55%, rgba(8,15,42,0.9) 100%)",
                        }}
                      />
                      {/* Duration chip (RTL end = left) */}
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-extrabold text-white/90 font-['Yekan_Bakh:Medium',sans-serif] pointer-events-none">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <polyline points="12 7 12 12 15 14" />
                        </svg>
                        {v.duration}
                      </span>
                      {/* FILM · HD chip (RTL start = right) */}
                      <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 backdrop-blur-md border border-[#f7cf5a]/40 text-[10px] tracking-[0.28em] font-extrabold text-[#f7cf5a] font-['Poppins:SemiBold',sans-serif] pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
                        FILM · HD
                      </span>
                      {/* Title at bottom */}
                      <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                        <h3
                          className="font-['Yekan_Bakh:Bold',sans-serif] text-white text-[20px] font-extrabold leading-[1.55]"
                          dir="auto"
                          style={{
                            textShadow:
                              "0 2px 12px rgba(0,0,0,0.45)",
                          }}
                        >
                          {v.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-[11px] tracking-[0.22em] text-white/70 font-['Poppins:SemiBold',sans-serif] font-bold">
                          <span
                            aria-hidden
                            className="inline-block w-5 h-px bg-[#f7cf5a]"
                          />
                          WATCH NOW
                        </div>
                      </div>
                    </>
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ===== Wall of Fame — افتخارات دانش‌پذیران ===== */}
      {wallOfFameItems.length > 0 && (
        <div
          className="absolute left-[156px] right-[156px] top-[8420px]"
          data-name="Wall of Fame"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-end justify-between pb-7 mb-12 border-b border-[#081738]/[0.08]">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  aria-hidden
                  className="h-px w-[34px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #f7cf5a, transparent)",
                  }}
                />
                <span className="text-[10.5px] tracking-[0.42em] font-extrabold text-[#1b3c8a]/70 font-['Poppins:SemiBold',sans-serif]">
                  NAMDAR · HONORS
                </span>
              </div>
              <h2
                className="font-['Yekan_Bakh:Bold',sans-serif] text-[#081738] text-[56px] font-extrabold leading-none tracking-tight"
                dir="auto"
              >
                دیوار افتخارات
              </h2>
              <p className="mt-4 text-[16px] text-[#081738]/65 font-['Yekan_Bakh:Regular',sans-serif] max-w-[640px] leading-[1.9]">
                لحظه‌های موفقیت دانش‌پذیران آکادمی نامدار. هر تصویر یا ویدئو
                روایتی از مسیر رشد یک معامله‌گر است.
              </p>
            </div>
          </div>

          {/* 3-column gallery */}
          <div className="grid grid-cols-3 gap-8">
            {wallOfFameItems.map((w) => (
              <article
                key={w.id}
                className="group relative rounded-3xl overflow-hidden bg-[#081738]/[0.03] border border-[#081738]/[0.06]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  {w.kind === "video" ? (
                    <InlineVideo
                      videoUrl={w.url}
                      poster={w.posterUrl}
                      title={w.studentName ?? w.caption}
                      className="absolute inset-0 w-full h-full"
                      posterClassName="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                      variant="gold"
                      buttonSize={72}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.url}
                      alt={w.caption ?? w.studentName ?? ""}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]"
                    />
                  )}
                  {/* dark gradient overlay for caption legibility */}
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(8,23,56,0.85) 0%, rgba(8,23,56,0.25) 45%, transparent 70%)",
                    }}
                  />
                  {(w.studentName || w.caption) && (
                    <div className="absolute bottom-0 right-0 left-0 p-6 pointer-events-none">
                      {w.studentName && (
                        <h3
                          className="font-['Yekan_Bakh:Bold',sans-serif] text-white text-[22px] font-extrabold leading-tight"
                          dir="auto"
                          style={{
                            textShadow:
                              "0 2px 12px rgba(0,0,0,0.45)",
                          }}
                        >
                          {w.studentName}
                        </h3>
                      )}
                      {w.caption && (
                        <p
                          className="font-['Yekan_Bakh:Regular',sans-serif] text-white/85 text-[14px] mt-2 leading-[1.8]"
                          dir="auto"
                        >
                          {w.caption}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
