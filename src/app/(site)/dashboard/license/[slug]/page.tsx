import Link from "@/components/SafeLink";
import { notFound, redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { getCourse, getEnrollment } from "@/lib/db";
import {
  ensureLicenseForEnrollment,
  SPOTPLAYER_DOWNLOADS,
} from "@/lib/spotplayer";
import LicenseCodeBox from "./LicenseCodeBox";
import RetryLicenseButton from "./RetryLicenseButton";

export const dynamic = "force-dynamic";

export default async function CourseLicensePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/license/${slug}`);

  const course = getCourse(slug);
  if (!course) notFound();

  // دوره‌های بدون کد اسپات‌پلیر با پخش‌کننده داخلی ارائه می‌شوند.
  if (!course.spotPlayerCourseId?.trim()) {
    redirect(`/dashboard/learn/${slug}`);
  }

  const enrollment = getEnrollment(session.userId, slug);

  // کاربری که در دوره ثبت‌نام نکرده لایسنسی ندارد. مدیران/پشتیبان‌ها هم چون
  // ثبت‌نام ندارند، نمی‌توانند لایسنس شخصی ببینند — پیام مناسب نشان می‌دهیم.
  if (!enrollment) {
    if (isStaff(session)) {
      return (
        <Shell course={course}>
          <Notice
            tone="info"
            title="پیش‌نمایش مدیر"
            body="کد لایسنس مخصوص هر کاربر است و تنها برای کاربری که در دوره ثبت‌نام کرده ساخته می‌شود. شما در این دوره ثبت‌نام نکرده‌اید، بنابراین کد شخصی‌ای برای نمایش وجود ندارد."
          />
        </Shell>
      );
    }
    redirect(`/courses/${slug}?not_enrolled=1`);
  }

  const result = await ensureLicenseForEnrollment(enrollment.id);

  return (
    <Shell course={course}>
      {/* ۱) بنر سبز موفقیت */}
      <div
        className="rounded-3xl p-6 md:p-7 text-white flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #157347 0%, #1f9d57 100%)",
          boxShadow: "0 18px 40px -18px rgba(31,157,87,0.6)",
        }}
      >
        <span className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 border border-white/30">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-black leading-tight">
            دسترسی شما فعال شد!
          </h1>
          <p className="text-white/85 text-[13px] md:text-[14px] mt-1 leading-7">
            دوره «{course.title}» به حساب شما اضافه شد.
          </p>
        </div>
      </div>

      {/* ۲) باکس کد لایسنس */}
      <section className="rounded-3xl bg-white border border-[#e5eaf5] p-5 md:p-6 shadow-[0_12px_30px_-18px_rgba(14,26,61,0.2)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#eef4ff] text-[#1b3c8a]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="4.5" />
                <path d="m10.5 12.5 7-7" />
                <path d="m15 5 3 3" />
                <path d="m18 8 2-2" />
              </svg>
            </span>
            <h2 className="font-black text-[#0e1a3d] text-[16px] md:text-[17px]">
              کد لایسنس اسپات‌پلیر
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#1b3c8a]/10 text-[#1b3c8a] text-[12px] font-bold truncate max-w-[45%]">
            {course.title}
          </span>
        </div>

        {result.status === "ready" ? (
          <>
            <LicenseCodeBox licenseKey={result.license.key} />
            <p className="mt-3 flex items-center gap-2 text-[13px] text-[#0e1a3d]/65 font-bold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              این کد فقط روی یک دستگاه قابل فعال‌سازی است.
            </p>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 md:p-5 space-y-3">
            <p className="text-[14px] text-[#8a6a14] font-bold leading-7">
              کد لایسنس شما هنوز آماده نشده است. این معمولاً به‌خاطر در دسترس
              نبودن لحظه‌ای سرویس اسپات‌پلیر است. روی دکمه زیر بزنید تا دوباره
              تلاش کنیم.
            </p>
            <RetryLicenseButton slug={slug} />
            <p className="text-[12px] text-[#8a6a14]/80 leading-6">
              اگر باز هم موفق نشد، چند دقیقه بعد دوباره به این صفحه سر بزنید یا
              با{" "}
              <Link href="/contact" className="font-black underline">
                پشتیبانی نامدار آکادمی
              </Link>{" "}
              تماس بگیرید.
            </p>
          </div>
        )}
      </section>

      {/* ۳) راهنمای سه‌مرحله‌ای فعال‌سازی */}
      <section className="rounded-3xl bg-white border border-[#e5eaf5] p-5 md:p-6">
        <h2 className="font-black text-[#0e1a3d] text-[16px] md:text-[17px] mb-5 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3c8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 12H3M11 6H3M11 18H3" />
            <path d="m15 9 3 3-3 3" />
          </svg>
          مراحل فعال‌سازی
        </h2>
        <ol className="space-y-4">
          <Step n={1} title="اسپات‌پلیر را نصب کنید" desc="نسخه مناسب سیستم‌عامل خود را از پایین همین صفحه دانلود و نصب کنید." />
          <Step n={2} title="کد بالا را کپی کنید" desc="روی دکمه «کپی کد» در باکس بالا بزنید." />
          <Step n={3} title="کد را در اپ وارد کنید" desc="در اسپات‌پلیر، کد را در کادر مربوطه بچسبانید (Paste) و تأیید کنید." />
        </ol>
      </section>

      {/* ۴) لینک‌های دانلود */}
      <section className="rounded-3xl bg-white border border-[#e5eaf5] p-5 md:p-6">
        <h2 className="font-black text-[#0e1a3d] text-[16px] md:text-[17px] mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3c8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          دانلود اپ اسپات‌پلیر
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPOTPLAYER_DOWNLOADS.map((d) => (
            <a
              key={d.os}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-[#e5eaf5] bg-[#f7fafd] hover:border-[#1b3c8a]/40 hover:bg-[#eef4ff] transition"
            >
              <PlatformIcon os={d.os} />
              <span className="font-extrabold text-[13px] text-[#0e1a3d] group-hover:text-[#1b3c8a]">
                {d.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ۵) هشدار یک‌دستگاه */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 md:p-5 flex items-start gap-3">
        <svg className="shrink-0 mt-0.5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-[13.5px] text-[#8a6a14] leading-7">
          <b className="text-[#7a5d10]">نکته مهم:</b> برنامه‌های ضبط صفحه مانند
          Game Bar یا AnyDesk را قبل از اجرای اسپات‌پلیر ببندید یا حذف کنید تا با
          خطا مواجه نشوید. همچنین به یاد داشته باشید که هر کد فقط روی یک دستگاه
          فعال می‌شود.
        </p>
      </div>
    </Shell>
  );
}

/* ──────────────── primitives ──────────────── */

function Shell({
  course,
  children,
}: {
  course: { slug: string; title: string };
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[820px] mx-auto space-y-5 md:space-y-6">
      <nav className="text-[13px] text-[#0e1a3d]/55 flex items-center gap-2">
        <Link href="/dashboard/courses" className="hover:text-[#1b3c8a]">
          دوره‌های من
        </Link>
        <span>/</span>
        <span className="text-[#0e1a3d] truncate">{course.title}</span>
      </nav>
      {children}
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1b3c8a] text-white font-black text-[14px] tabular-nums">
        {n}
      </span>
      <div className="pt-0.5">
        <div className="font-extrabold text-[#0e1a3d] text-[14.5px]">
          {title}
        </div>
        <p className="text-[13px] text-[#0e1a3d]/60 leading-7 mt-0.5">{desc}</p>
      </div>
    </li>
  );
}

function Notice({
  tone,
  title,
  body,
}: {
  tone: "info" | "warn";
  title: string;
  body: string;
}) {
  const c =
    tone === "warn"
      ? "border-amber-300 bg-amber-50 text-[#8a6a14]"
      : "border-[#bcd4ff] bg-[#eef4ff] text-[#1b3c8a]";
  return (
    <div className={`rounded-2xl border p-5 ${c}`}>
      <h3 className="font-black text-[15px] mb-1.5">{title}</h3>
      <p className="text-[13.5px] leading-7 opacity-90">{body}</p>
    </div>
  );
}

function PlatformIcon({ os }: { os: "windows" | "mac" | "android" | "web" }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#1b3c8a",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (os === "windows") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="8" height="7" rx="0.5" />
        <rect x="13" y="4" width="8" height="7" rx="0.5" />
        <rect x="3" y="13" width="8" height="7" rx="0.5" />
        <rect x="13" y="13" width="8" height="7" rx="0.5" />
      </svg>
    );
  }
  if (os === "mac") {
    return (
      <svg {...common}>
        <path d="M12 7c0-2 1.5-3.5 3.5-3.5C15.5 5.5 14 7 12 7z" />
        <path d="M16.5 12c0-2 1.5-3 2.5-3.2-1-1.4-2.6-1.8-3.5-1.8-1.4 0-2 .8-3.5.8s-2.2-.8-3.6-.8C7 7 5 8.4 5 11.6 5 14.8 7.3 19 9 19c.9 0 1.4-.7 3-.7s2 .7 3 .7c1.7 0 3.4-3.6 3.6-5.2-.9-.4-2.1-1.2-2.1-1.6z" />
      </svg>
    );
  }
  if (os === "android") {
    return (
      <svg {...common}>
        <rect x="6" y="8" width="12" height="10" rx="2" />
        <path d="M8 8 6.5 5M16 8l1.5-3" />
        <path d="M9 18v2.5M15 18v2.5" />
        <circle cx="9.5" cy="11.5" r="0.6" fill="#1b3c8a" stroke="none" />
        <circle cx="14.5" cy="11.5" r="0.6" fill="#1b3c8a" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </svg>
  );
}
