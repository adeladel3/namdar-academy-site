import Link from "@/components/SafeLink";
import { getSession } from "@/lib/auth";
import {
  getSeminar,
  listSeminarRegistrationsByUser,
} from "@/lib/db";
import { faDigits, formatRelative } from "@/lib/formatting";

export const dynamic = "force-dynamic";

function formatEventDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString("fa-IR", { dateStyle: "full", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default async function MySeminarsPage() {
  const session = (await getSession())!;
  const registrations = listSeminarRegistrationsByUser(session.userId);
  const rows = registrations
    .map((r) => {
      const seminar = getSeminar(r.seminarSlug);
      if (!seminar) return null;
      return { registration: r, seminar };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="max-w-[1180px] mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
          سمینارهای من
        </h1>
        <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5">
          {rows.length > 0
            ? `${faDigits(rows.length)} سمینار حضوری ثبت‌شده`
            : "هنوز در هیچ سمینار حضوری ثبت‌نام نکرده‌اید."}
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v2a2 2 0 000 4v2a3 3 0 01-3 3H5a3 3 0 01-3-3v-2a2 2 0 000-4z" />
              <path d="M9 6v12" strokeDasharray="2 3" />
            </svg>
          </div>
          <h3 className="font-extrabold text-[#0e1a3d] text-[16px] mb-1.5">
            هنوز سمیناری ثبت‌نام نکرده‌اید
          </h3>
          <p className="text-[13px] text-[#0e1a3d]/60 mb-5 max-w-sm mx-auto leading-7">
            با مشاهده‌ی صفحه‌ی سمینارهای فعال، اولین صندلی خود را رزرو کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ registration, seminar }) => {
            const date = formatEventDate(seminar.eventDate);
            return (
              <Link
                key={registration.id}
                href={`/dashboard/seminars/${encodeURIComponent(seminar.slug)}`}
                className="group block relative overflow-hidden rounded-3xl bg-white border border-[#e5eaf5] shadow-[0_12px_30px_-18px_rgba(14,26,61,0.2)] hover:shadow-[0_18px_40px_-18px_rgba(14,26,61,0.28)] hover:-translate-y-0.5 transition"
              >
                <div className="grid md:grid-cols-[240px_1fr]">
                  <div className="relative aspect-video md:aspect-auto md:min-h-[180px] bg-gradient-to-br from-[#1b3c8a] to-[#49bbbd] overflow-hidden">
                    {seminar.heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seminar.heroImage}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a3d]/70 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur text-white text-[11px] font-bold">
                      سمینار حضوری
                    </span>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col gap-3">
                    <div>
                      <h3 className="font-black text-[#0e1a3d] text-[16px] md:text-[18px] leading-snug group-hover:text-[#1b3c8a] transition">
                        {seminar.title}
                      </h3>
                      {date && (
                        <div className="text-[12px] text-[#0e1a3d]/65 mt-2">
                          🗓 {date}
                        </div>
                      )}
                      {seminar.venueName && (
                        <div className="text-[12px] text-[#0e1a3d]/65 mt-1">
                          📍 {seminar.venueName}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-2 border-t border-[#eef2f7] flex items-center justify-between text-[12px]">
                      <span className="text-[#0e1a3d]/65">
                        ثبت‌نام {formatRelative(registration.registeredAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#1b3c8a] font-bold">
                        ورود به پنل
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
