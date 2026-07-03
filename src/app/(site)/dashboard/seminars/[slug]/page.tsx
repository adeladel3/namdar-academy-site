import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getSeminar,
  getSeminarRegistration,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function formatEventDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString("fa-IR", { dateStyle: "full", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default async function MySeminarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) notFound();

  const session = (await getSession())!;
  const registration = getSeminarRegistration(session.userId, seminar.slug);
  if (!registration) {
    // کاربر هنوز ثبت‌نام نکرده — بفرستیمش به صفحه‌ی لندینگ
    return (
      <div className="max-w-[800px] mx-auto p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
        <h2 className="text-xl font-extrabold text-[#0e1a3d] mb-2">
          هنوز ثبت‌نام نشده‌اید
        </h2>
        <p className="text-sm text-[#0e1a3d]/65 mb-5 leading-7">
          برای دسترسی به پنل این سمینار، ابتدا روی صفحه‌ی سمینار اقدام به رزرو
          صندلی کنید.
        </p>
        <Link
          href={`/seminars/${encodeURIComponent(seminar.slug)}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-extrabold text-sm hover:opacity-95"
        >
          مشاهده صفحه‌ی سمینار
        </Link>
      </div>
    );
  }

  const blocks = (seminar.memberBlocks ?? [])
    .filter((b) => b.visible)
    .sort((a, b) => a.order - b.order);
  const date = formatEventDate(seminar.eventDate);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* هدر سمینار با QR و اطلاعات حضور */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-l from-[#0b4a7a] via-[#1d88d1] to-[#64b5f6] text-white">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f7cf5a] text-[#2d1c03] text-xs font-extrabold mb-3">
                ثبت‌نام شما تأیید شده است
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
                {seminar.title}
              </h1>
              {date && (
                <div className="text-sm text-white/90 mt-3 flex items-center gap-2">
                  <span>🗓</span>
                  <span>{date}</span>
                </div>
              )}
              {seminar.venueName && (
                <div className="text-sm text-white/90 mt-1 flex items-center gap-2">
                  <span>📍</span>
                  <span>{seminar.venueName}</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-4 min-w-[200px]">
              <div className="text-xs text-white/75 mb-2">کد ورود شما</div>
              <div className="font-mono text-base font-extrabold tracking-wider" dir="ltr">
                {registration.qrCode ?? "—"}
              </div>
              <div className="mt-3 text-[11px] text-white/80 leading-5">
                این کد را روز سمینار به همراه کارت ملی به همراه داشته باشید.
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
            <InfoTile label="نام شناسنامه‌ای">{registration.fullName}</InfoTile>
            <InfoTile label="کد ملی">
              <span dir="ltr" className="font-mono">{registration.nationalId}</span>
            </InfoTile>
            <InfoTile label="موبایل">
              <span dir="ltr" className="font-mono">{registration.phone}</span>
            </InfoTile>
          </div>
        </div>
      </div>

      {/* اطلاعات لوکیشن و راهنما */}
      {(seminar.venueAddress || seminar.venueMapUrl) && (
        <div className="rounded-3xl bg-white p-6 border border-[#e5eaf5]">
          <h2 className="font-extrabold text-[#0e1a3d] mb-3">آدرس و راهنمای حضور</h2>
          {seminar.venueAddress && (
            <p className="text-[#010514]/80 leading-8">{seminar.venueAddress}</p>
          )}
          {seminar.venueMapUrl && (
            <a
              href={seminar.venueMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-[#1b3c8a] font-bold text-sm hover:underline"
            >
              مشاهده روی نقشه
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* بلوک‌های محتوای پنل کاربر — کاملاً داینامیک از ادمین */}
      {blocks.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 border border-dashed border-[#e5eaf5] text-center text-sm text-[#010514]/55">
          هنوز محتوایی توسط مدیریت اضافه نشده است. به‌محض آپلود فایل‌ها،
          ویدیوها و راهنماهای پیش‌از‌حضور، در همین صفحه نمایش داده خواهد شد.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {blocks.map((b) => (
            <article
              key={b.id}
              className="rounded-3xl bg-white border border-[#e5eaf5] shadow-[0_10px_30px_-18px_rgba(14,26,61,0.2)] overflow-hidden flex flex-col"
            >
              {b.kind === "image" && b.url && (
                // eslint-disable-next-line @next/next/no-img-element
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
                  <p className="text-sm text-[#010514]/65 leading-7">
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
      )}

      {/* پشتیبانی */}
      {(seminar.supportPhone || seminar.supportTelegram) && (
        <div className="rounded-3xl bg-[#fdf5de] p-6 border border-[#f0d989]">
          <h2 className="font-extrabold text-[#0e1a3d] mb-3">پشتیبانی</h2>
          <div className="space-y-2 text-sm text-[#0e1a3d]/85 leading-8">
            {seminar.supportPhone && (
              <p>
                تلفن:{" "}
                <a href={`tel:${seminar.supportPhone}`} className="font-mono font-bold text-[#1b3c8a]" dir="ltr">
                  {seminar.supportPhone}
                </a>
              </p>
            )}
            {seminar.supportTelegram && (
              <p>
                تلگرام:{" "}
                <a
                  href={`https://t.me/${seminar.supportTelegram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-[#1b3c8a]"
                  dir="ltr"
                >
                  @{seminar.supportTelegram.replace(/^@/, "")}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur px-4 py-3">
      <div className="text-[11px] text-white/70 mb-1">{label}</div>
      <div className="font-bold text-sm">{children}</div>
    </div>
  );
}
