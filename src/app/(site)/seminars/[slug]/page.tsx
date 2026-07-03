import type { Metadata } from "next";
import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getSeminar,
  isRegisteredForSeminar,
  listSeminarRegistrationsBySeminar,
  listSeminars,
} from "@/lib/db";
import { faDigits, formatToman } from "@/lib/formatting";
import { absUrl, SITE } from "@/lib/seo";
import { resolveUploadUrl } from "@/lib/upload-url";
import PreviewVideoButton from "@/components/PreviewVideoButton";
import ReserveButton from "./ReserveButton";
import CountdownTimer from "./CountdownTimer";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listSeminars({ publishedOnly: true }).map((s) => ({ slug: s.slug }));
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = safeDecode(raw);
  const seminar = getSeminar(slug) ?? getSeminar(raw);
  if (!seminar) return { title: "سمینار پیدا نشد" };
  const title = seminar.title;
  const description = seminar.shortDesc || SITE.description;
  const image = seminar.heroImage ? absUrl(seminar.heroImage) : SITE.ogImage;
  return {
    title,
    description,
    alternates: { canonical: `/seminars/${seminar.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/seminars/${seminar.slug}`,
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

function formatEventDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    // فقط روز و ماه شمسی (مطابق PDF که نوشته «پنجشنبه / ۲۱ خرداد ماه»)
    return d.toLocaleString("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return iso;
  }
}

function formatEventDateLong(iso?: string): string | null {
  if (!iso) return null;
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

export default async function SeminarLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = safeDecode(raw);
  const seminar = getSeminar(slug) ?? getSeminar(raw);
  if (!seminar) notFound();
  if (seminar.status === "archived") notFound();

  const session = await getSession();
  const alreadyAuthed = !!session;
  const userRegistered = session
    ? isRegisteredForSeminar(session.userId, seminar.slug)
    : false;

  const registrations = listSeminarRegistrationsBySeminar(seminar.slug);
  const visibleLandingBlocks = (seminar.landingBlocks ?? [])
    .filter((b) => b.visible)
    .sort((a, b) => a.order - b.order);

  const priceLabel = formatToman(seminar.discountPrice ?? seminar.price);
  const dateShort = formatEventDate(seminar.eventDate);
  const dateLong = formatEventDateLong(seminar.eventDate);
  const remaining = seminar.capacity
    ? Math.max(0, seminar.capacity - registrations.length)
    : null;

  const painPoints = seminar.painPoints ?? [];
  const instructorStats = seminar.instructorStats ?? [];
  const beforeAfterRows = seminar.beforeAfter ?? [];

  return (
    <div className="bg-[#f7fafd] text-[#010514] min-h-screen overflow-hidden" dir="rtl">
      {/* ═════════════ HERO ═════════════ */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #64b5f6 0%, #3d92cf 35%, #1b3c8a 70%, #0e1a3d 100%)",
        }}
      >
        {/* لکه‌های نوری طلایی و آبی برای حس عمق — مشابه هیرو کوچینگ */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-30 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full opacity-35 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 pt-12 pb-12 md:pt-20 md:pb-16">
          {seminar.heroEyebrow && (
            <p className="text-center text-[#f7cf5a]/85 text-sm md:text-base font-bold mb-4 tracking-wide">
              {seminar.heroEyebrow}
            </p>
          )}

          {seminar.heroSubtitle && (
            <h1 className="text-center text-2xl md:text-4xl font-extrabold leading-snug md:leading-[1.4] mb-8 md:mb-10">
              {seminar.heroSubtitle.split("اصفهان").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="relative inline-block px-2 mx-1">
                      <span className="relative z-10 text-[#f7cf5a] drop-shadow-[0_0_18px_rgba(247,207,90,0.55)]">
                        اصفهان
                      </span>
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-[#f7cf5a]/25 blur-md"
                      />
                    </span>
                  )}
                </span>
              ))}
            </h1>
          )}

          {/* ────────── ویدیو هیرو ────────── */}
          <div className="relative mx-auto w-full max-w-[760px]">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#f7cf5a]/45 via-[#d4a62a]/20 to-[#49bbbd]/45 blur-2xl opacity-80"
            />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_30px_80px_-20px_rgba(14,26,61,0.6)] aspect-video bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#0e1a3d]">
              {seminar.heroImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resolveUploadUrl(seminar.heroImage)}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

              {/* پرده‌ی تیره برای خوانایی روی gradient آبی-navy کادر */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/30" />

              {seminar.heroVideoUrl ? (
                <PreviewVideoButton
                  videoUrl={seminar.heroVideoUrl}
                  title={seminar.title}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/85">
                  <span className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f7cf5a]/25 backdrop-blur-md border border-[#f7cf5a]/60 flex items-center justify-center shadow-[0_0_40px_-5px_#f7cf5a]">
                    <span aria-hidden className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f7cf5a]/10 animate-ping" />
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#f7cf5a" className="relative">
                      <polygon points="8 5 19 12 8 19 8 5" />
                    </svg>
                  </span>
                  <span className="text-xs text-white/60 mt-4">ویدیو</span>
                </div>
              )}

              <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur text-[11px] font-bold text-[#f7cf5a]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
                پیش‌نمایش سمینار
              </span>
            </div>
          </div>

          {/* ────────── عنوان پایین ویدیو ────────── */}
          <div className="text-center mt-10 mb-6">
            <span className="inline-block text-xs md:text-sm text-[#f7cf5a]/85 font-bold mb-2 tracking-[0.2em]">
              ( {seminar.title} )
            </span>
          </div>

          {seminar.heroPromise && (
            <p className="text-center text-white/85 text-sm md:text-base leading-8 md:leading-9 max-w-3xl mx-auto mb-10">
              {seminar.heroPromise}
            </p>
          )}

          {/* ────────── ساعت‌شمار ────────── */}
          {seminar.eventDate && (
            <div className="flex flex-col items-center gap-3 mb-10">
              <div className="text-xs md:text-sm text-[#f7cf5a]/85 font-bold tracking-wider">
                ساعت‌شمار تا روز برگزاری سمینار
              </div>
              <CountdownTimer targetIso={seminar.eventDate} />
            </div>
          )}

          {/* ────────── سالن + تاریخ + ظرفیت ────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto mb-8">
            {seminar.venueName && (
              <InfoPill
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
              >
                {seminar.venueName}
              </InfoPill>
            )}
            {dateShort && (
              <InfoPill
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              >
                {dateShort}
              </InfoPill>
            )}
          </div>

          {/* ────────── ظرفیت محدود + CTA ────────── */}
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs md:text-sm font-bold backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              ظرفیت محدود
              {seminar.showCapacityCounter && remaining !== null && remaining > 0 && (
                <>
                  <span className="opacity-50">·</span>
                  <span>{faDigits(remaining)} صندلی باقی‌مانده</span>
                </>
              )}
            </div>

            {userRegistered ? (
              <Link
                href={`/dashboard/seminars/${encodeURIComponent(seminar.slug)}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-500 text-white font-extrabold text-base md:text-lg shadow-[0_18px_40px_-14px_rgba(16,185,129,0.6)] hover:opacity-95 transition"
              >
                شما قبلاً ثبت‌نام کرده‌اید — ورود به پنل
              </Link>
            ) : (
              <ReserveButton
                variant="hero"
                seminarSlug={seminar.slug}
                seminarTitle={seminar.title}
                priceLabel={priceLabel}
                alreadyAuthed={alreadyAuthed}
                defaultName={session?.name}
                defaultPhone={session?.phone}
                disabled={!seminar.allowPurchase}
                disabledLabel="ثبت‌نام بسته است"
                label="رزرو صندلی"
              />
            )}
          </div>
        </div>
      </section>

      {/* ═════════════ PAIN POINTS ═════════════ */}
      {painPoints.length > 0 && (
        <section className="relative bg-[#0e1a3d] text-white overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 right-0 w-[420px] h-[420px] rounded-full opacity-25 blur-[140px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 left-0 w-[420px] h-[420px] rounded-full opacity-25 blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #136cb5, transparent 70%)" }}
          />
          <div className="relative max-w-[1000px] mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.25em] font-extrabold text-[#f7cf5a] mb-5 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
                WHY THIS SEMINAR
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-snug max-w-3xl mx-auto">
                {seminar.painPointsTitle ??
                  "اگر حداقل پاسخ دوتا از سؤال‌های زیر برات مهمه، این سمینار برای تو طراحی شده"}
              </h2>
              <div className="mt-5 mx-auto h-[3px] w-24 rounded-full bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a] shadow-[0_0_18px_rgba(247,207,90,0.55)]" />
            </div>

            <ul className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {painPoints.map((q, i) => (
                <li
                  key={i}
                  className="relative rounded-2xl p-5 md:p-6 group transition hover:-translate-y-0.5"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 40%), rgba(14,26,61,0.6)",
                    border: "1px solid rgba(247,207,90,0.25)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 30px -18px rgba(0,0,0,0.6)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[#2d1c03] font-black text-sm tabular-nums"
                      style={{
                        background:
                          "linear-gradient(135deg, #fde285 0%, #f7cf5a 50%, #d4a62a 100%)",
                        boxShadow: "0 6px 14px -4px rgba(247,207,90,0.55)",
                      }}
                    >
                      {faDigits(i + 1)}
                    </span>
                    <p className="flex-1 text-white/90 leading-8 text-sm md:text-base font-medium">
                      {q}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ═════════════ INSTRUCTOR ═════════════ */}
      {seminar.instructorName && (
        <section className="relative overflow-hidden bg-[#fdf2da] text-[#010514]">
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

          <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0e1a3d]/10 border border-[#0e1a3d]/20 text-[10px] md:text-[11px] tracking-[0.25em] font-extrabold text-[#0e1a3d] mb-4 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e1a3d]" />
                MEET YOUR INSTRUCTOR
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-3 text-[#0e1a3d]">
                {seminar.instructorName}
              </h2>
              <div className="inline-flex items-center gap-3 mt-2">
                <span className="h-px w-10 bg-[#0e1a3d]/40" />
                <span className="text-[#7a5a08] text-sm md:text-base font-bold">
                  مدرس و سخنران سمینار
                </span>
                <span className="h-px w-10 bg-[#0e1a3d]/40" />
              </div>
            </div>

            <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-12 items-start">
              {/* تصویر */}
              <div className="relative mx-auto lg:mx-0">
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-[#f7cf5a] via-[#d4a62a] to-[#0e1a3d] opacity-40 blur-2xl"
                />
                <div className="relative w-[300px] md:w-[360px] aspect-[3/4] rounded-[2rem] overflow-hidden border-4 border-white shadow-[0_30px_80px_-20px_rgba(14,26,61,0.45)]">
                  {seminar.instructorImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resolveUploadUrl(seminar.instructorImage)}
                      alt={seminar.instructorName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1b3c8a] via-[#136cb5] to-[#0e1a3d] flex flex-col items-center justify-center text-white/75">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" />
                      </svg>
                      <span className="text-xs mt-3 opacity-70">عکس مدرس</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="text-[10px] tracking-[0.2em] text-[#f7cf5a] font-bold mb-1">
                      مدرس سمینار
                    </div>
                    <div className="font-extrabold text-white text-lg leading-tight">
                      {seminar.instructorName}
                    </div>
                  </div>
                </div>
              </div>

              {/* بایو + شعار + آمار */}
              <div className="space-y-5">
                {seminar.instructorTagline && (
                  <div className="relative rounded-3xl bg-[#0e1a3d] text-white p-6 md:p-7 overflow-hidden shadow-[0_20px_50px_-20px_rgba(14,26,61,0.55)]">
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a]"
                    />
                    <div
                      aria-hidden
                      className="absolute -top-16 -left-10 w-40 h-40 rounded-full bg-[#f7cf5a]/10 blur-3xl pointer-events-none"
                    />
                    <blockquote className="relative text-base md:text-lg leading-9 text-white/95 font-bold">
                      {seminar.instructorTagline}
                    </blockquote>
                    {seminar.instructorBio && (
                      <p className="relative text-sm md:text-base leading-8 text-white/80 mt-4">
                        {seminar.instructorBio}
                      </p>
                    )}
                  </div>
                )}

                {!seminar.instructorTagline && seminar.instructorBio && (
                  <div className="relative rounded-3xl bg-[#0e1a3d] text-white p-6 md:p-7 overflow-hidden shadow-[0_20px_50px_-20px_rgba(14,26,61,0.55)]">
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a]"
                    />
                    <p className="relative text-sm md:text-base leading-9 text-white/90">
                      {seminar.instructorBio}
                    </p>
                  </div>
                )}

                {instructorStats.length > 0 && (
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {instructorStats.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-2xl bg-white border border-[#f3e3b3] px-4 py-3 shadow-[0_6px_18px_-10px_rgba(212,166,42,0.4)] hover:-translate-y-0.5 transition"
                      >
                        <span className="shrink-0 w-9 h-9 rounded-xl bg-[#f7cf5a]/25 border border-[#d4a62a]/40 text-[#7a5a08] flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="text-sm text-[#0e1a3d] font-bold leading-7 flex-1">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ BEFORE / AFTER ═════════════ */}
      {beforeAfterRows.length > 0 && (
        <section className="relative bg-[#dceefd] text-[#010514] overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 right-1/2 w-[480px] h-[480px] rounded-full opacity-30 blur-[140px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full opacity-35 blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, #7ec8f5, transparent 70%)" }}
          />

          <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/30 border border-[#d4a62a]/40 text-[10px] md:text-[11px] tracking-[0.25em] font-extrabold text-[#7a5a08] mb-4 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a62a] shadow-[0_0_8px_#f7cf5a]" />
                BEFORE — AFTER
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#0e1a3d] leading-tight">
                {seminar.beforeAfterTitle ?? "تغییری که این سمینار در ذهن شما ایجاد می‌کند"}
              </h2>
              <div className="mt-5 mx-auto h-[3px] w-24 rounded-full bg-gradient-to-l from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a] shadow-[0_0_18px_rgba(247,207,90,0.55)]" />
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white shadow-[0_30px_80px_-30px_rgba(14,26,61,0.35)] bg-white">
              <table className="w-full">
                <thead>
                  <tr className="text-center text-xs md:text-sm">
                    <th
                      className="px-4 md:px-6 py-4 font-extrabold text-rose-700"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(244,63,94,0.12) 0%, rgba(244,63,94,0.04) 100%)",
                        borderBottom: "1px solid rgba(244,63,94,0.20)",
                      }}
                    >
                      قبل سمینار
                    </th>
                    <th
                      className="px-4 md:px-6 py-4 font-extrabold text-emerald-700"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.04) 100%)",
                        borderBottom: "1px solid rgba(16,185,129,0.22)",
                      }}
                    >
                      بعد سمینار
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {beforeAfterRows.map((row, i) => (
                    <tr key={i} className="text-center text-sm md:text-base">
                      <td
                        className="px-4 md:px-6 py-5 md:py-6 align-middle"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(244,63,94,0.04) 0%, rgba(244,63,94,0.01) 100%)",
                          borderTop:
                            i === 0 ? undefined : "1px solid rgba(14,26,61,0.06)",
                        }}
                      >
                        <span className="inline-flex items-center gap-2 text-rose-800 font-bold leading-8">
                          <span className="text-rose-500/80">✕</span>
                          {row.before}
                        </span>
                      </td>
                      <td
                        className="px-4 md:px-6 py-5 md:py-6 align-middle"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(16,185,129,0.04) 0%, rgba(16,185,129,0.01) 100%)",
                          borderTop:
                            i === 0 ? undefined : "1px solid rgba(14,26,61,0.06)",
                        }}
                      >
                        <span className="inline-flex items-center gap-2 text-emerald-800 font-bold leading-8">
                          <span className="text-emerald-600/85">✓</span>
                          {row.after}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ EXTRA ADMIN BLOCKS ═════════════ */}
      {visibleLandingBlocks.length > 0 && (
        <section className="relative bg-[#f7fafd] text-[#010514]">
          <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/30 border border-[#d4a62a]/40 text-[10px] md:text-[11px] tracking-[0.25em] font-extrabold text-[#7a5a08] mb-4 backdrop-blur">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a62a] shadow-[0_0_8px_#f7cf5a]" />
                MORE FROM THIS SEMINAR
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e1a3d]">
                محتوای تکمیلی
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {visibleLandingBlocks.map((b) => (
                <article
                  key={b.id}
                  className="rounded-3xl bg-white border border-[#e5eaf5] shadow-[0_12px_30px_-18px_rgba(14,26,61,0.2)] overflow-hidden flex flex-col"
                >
                  {b.kind === "image" && b.url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={b.url}
                      alt={b.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  {b.kind === "video" && b.url && (
                    <video
                      controls
                      poster={b.posterUrl}
                      className="w-full aspect-video bg-black object-contain"
                    >
                      <source src={b.url} />
                    </video>
                  )}
                  {b.kind === "embed" && b.url && (
                    <div
                      className="aspect-video bg-black [&>iframe]:w-full [&>iframe]:h-full"
                      dangerouslySetInnerHTML={{ __html: b.url }}
                    />
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-[#0e1a3d] text-base mb-1.5">
                      {b.title}
                    </h3>
                    {b.description && (
                      <p className="text-sm text-[#0e1a3d]/65 leading-7">
                        {b.description}
                      </p>
                    )}
                    {(b.kind === "link" || b.kind === "file") && b.url && (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-auto pt-4 text-[#1b3c8a] font-bold text-sm hover:underline"
                      >
                        {b.kind === "file" ? "دانلود فایل" : "مشاهده"}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ FINAL CTA ═════════════ */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #0e1a3d 0%, #0b1635 50%, #050d24 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute -top-32 right-1/2 w-[520px] h-[520px] rounded-full opacity-25 blur-[140px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #f7cf5a, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full opacity-30 blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #49bbbd, transparent 70%)" }}
        />

        <div className="relative max-w-[800px] mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7cf5a]/15 border border-[#f7cf5a]/40 text-[10px] md:text-[11px] tracking-[0.25em] font-extrabold text-[#f7cf5a] mb-5 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f7cf5a] shadow-[0_0_8px_#f7cf5a]" />
            RESERVE YOUR SEAT
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4">
            {seminar.finalCtaTitle ?? "رزرو نهایی صندلی سمینار"}
          </h2>
          <p className="text-white/80 leading-9 max-w-xl mx-auto mb-8 text-sm md:text-base">
            {seminar.finalCtaDescription ??
              "ظرفیت سالن این رویداد به‌شدت محدود است. فرم زیر را تکمیل کنید تا ثبت‌نام شما نهایی شود."}
          </p>

          {dateLong && (
            <p className="text-[#f7cf5a] text-xs md:text-sm font-bold mb-6">
              🗓 {dateLong}
            </p>
          )}

          <div className="flex flex-col items-center gap-5">
            {userRegistered ? (
              <Link
                href={`/dashboard/seminars/${encodeURIComponent(seminar.slug)}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-500 text-white font-extrabold text-base md:text-lg shadow-lg hover:opacity-95 transition"
              >
                ورود به پنل سمینار
              </Link>
            ) : (
              <ReserveButton
                variant="hero"
                seminarSlug={seminar.slug}
                seminarTitle={seminar.title}
                priceLabel={priceLabel}
                alreadyAuthed={alreadyAuthed}
                defaultName={session?.name}
                defaultPhone={session?.phone}
                disabled={!seminar.allowPurchase}
                disabledLabel="ثبت‌نام بسته است"
                label="رزرو صندلی"
              />
            )}

            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(247,207,90,0.15) 0%, rgba(247,207,90,0.04) 100%)",
                border: "1px solid rgba(247,207,90,0.45)",
                boxShadow: "0 0 24px -8px rgba(247,207,90,0.4)",
              }}
            >
              <span className="text-xs text-white/70">مبلغ ثبت‌نام:</span>
              <span className="text-xl md:text-2xl font-black text-[#f7cf5a] tabular-nums">
                {priceLabel}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold text-white/95 backdrop-blur"
      style={{
        background:
          "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%), rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <span className="text-[#f7cf5a]">{icon}</span>
      {children}
    </span>
  );
}
