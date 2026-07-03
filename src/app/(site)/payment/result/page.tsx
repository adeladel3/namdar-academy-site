import Link from "@/components/SafeLink";
import { faDigits, formatToman } from "@/lib/formatting";
import CopyBadge from "./CopyBadge";

export const metadata = {
  title: "نتیجه پرداخت — نامدار آکادمی",
  description: "نتیجه تراکنش درگاه بانکی و وضعیت سفارش شما در نامدار آکادمی.",
};

export const dynamic = "force-dynamic";

type Status = "success" | "failed" | "pending";

type SearchParams = {
  status?: string;
  orderId?: string;
  reason?: string;
  refNum?: string;
  amount?: string;
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const rawStatus = (sp.status || "").toLowerCase();
  const status: Status =
    rawStatus === "success"
      ? "success"
      : rawStatus === "failed"
      ? "failed"
      : "pending";

  const orderId = (sp.orderId || "").trim();
  const refNum = (sp.refNum || "").trim();
  const reason = sp.reason ? decodeURIComponent(sp.reason) : "";
  const amountNum = sp.amount ? Number(sp.amount) : NaN;
  const amountValid = Number.isFinite(amountNum) && amountNum > 0;

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0b1530 0%, #11245a 45%, #1b3c8a 100%)",
      }}
    >
      {/* Ambient glows — matches Contact / SiteFooter idiom */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 w-[620px] h-[620px] rounded-full opacity-60 blur-[160px]"
        style={{
          background:
            status === "failed"
              ? "radial-gradient(circle, #e06b7a, transparent 70%)"
              : status === "pending"
              ? "radial-gradient(circle, #7cc8ff, transparent 70%)"
              : "radial-gradient(circle, #49bbbd, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-52 -left-40 w-[620px] h-[620px] rounded-full opacity-40 blur-[160px]"
        style={{
          background:
            status === "failed"
              ? "radial-gradient(circle, #f59e9e, transparent 70%)"
              : status === "pending"
              ? "radial-gradient(circle, #f7cf5a, transparent 70%)"
              : "radial-gradient(circle, #f7cf5a, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-[780px] mx-auto px-4 md:px-8 py-14 md:py-20">
        {status === "success" && (
          <SuccessView
            orderId={orderId}
            refNum={refNum}
            amount={amountValid ? amountNum : null}
          />
        )}
        {status === "failed" && (
          <FailureView orderId={orderId} reason={reason} />
        )}
        {status === "pending" && <PendingView orderId={orderId} />}
      </div>
    </div>
  );
}

/* ──────────────── Success ──────────────── */

function SuccessView({
  orderId,
  refNum,
  amount,
}: {
  orderId: string;
  refNum: string;
  amount: number | null;
}) {
  return (
    <GlassCard accent="teal">
      <div className="text-center">
        <PillLabel tone="teal">PAYMENT SUCCESS</PillLabel>

        <div className="mx-auto mt-6 mb-6 relative w-24 h-24 md:w-28 md:h-28">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background:
                "radial-gradient(circle, #5ee7a0 0%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-1.5 rounded-full border border-[#5ee7a0]/40"
          />
          <span
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35) 0%, rgba(94,231,160,0.35) 45%, rgba(16,94,67,0.55) 100%)",
              border: "1px solid rgba(94,231,160,0.55)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.35), 0 18px 40px -10px rgba(94,231,160,0.45)",
            }}
          >
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="5 12 10 17 20 7" />
            </svg>
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3">
          پرداخت شما با{" "}
          <span
            style={{
              background:
                "linear-gradient(180deg, #f7cf5a 0%, #e8bc3a 60%, #d4a62a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            موفقیت
          </span>{" "}
          انجام شد
        </h1>
        <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto leading-8">
          دسترسی به دوره‌ها بلافاصله فعال شد. اطلاعات تراکنش را برای سوابق خود
          نگه دارید؛ رسید رسمی نیز در بخش سفارش‌های پنل قابل مشاهده است.
        </p>
      </div>

      <Divider />

      <div className="space-y-3">
        {amount !== null && (
          <InfoLine
            label="مبلغ پرداخت شده"
            value={
              <span className="text-white font-extrabold text-[15px] md:text-[17px] tabular-nums">
                {formatToman(amount)}
              </span>
            }
          />
        )}
        {orderId && (
          <CopyBadge
            label="شناسه سفارش"
            value={orderId}
            display={orderId}
            tone="neutral"
          />
        )}
        {refNum && (
          <CopyBadge
            label="شماره پیگیری بانک"
            value={refNum}
            display={faDigits(refNum)}
            tone="gold"
          />
        )}
      </div>

      <ActionRow>
        <PrimaryLink href="/dashboard/courses">
          ورود به دوره‌ها
          <ArrowRtl />
        </PrimaryLink>
        <SecondaryLink href="/">بازگشت به خانه</SecondaryLink>
      </ActionRow>

      <SupportNote />
    </GlassCard>
  );
}

/* ──────────────── Failure ──────────────── */

function FailureView({
  orderId,
  reason,
}: {
  orderId: string;
  reason: string;
}) {
  return (
    <GlassCard accent="rose">
      <div className="text-center">
        <PillLabel tone="rose">PAYMENT FAILED</PillLabel>

        <div className="mx-auto mt-6 mb-6 relative w-24 h-24 md:w-28 md:h-28">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background:
                "radial-gradient(circle, #f59e9e 0%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-1.5 rounded-full border border-rose-300/40"
          />
          <span
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, rgba(245,158,158,0.3) 45%, rgba(127,29,29,0.55) 100%)",
              border: "1px solid rgba(245,158,158,0.55)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 18px 40px -10px rgba(244,63,94,0.4)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3">
          پرداخت{" "}
          <span
            style={{
              background:
                "linear-gradient(180deg, #ffb4b4 0%, #f59e9e 60%, #e06b7a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ناموفق
          </span>{" "}
          بود
        </h1>
        <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto leading-8">
          تراکنش شما تکمیل نشد و سفارش ثبت نهایی نشده است. اگر مبلغی از حساب
          شما کسر شده باشد، طبق قوانین شاپرک طی حداکثر ۷۲ ساعت کاری به حساب‌تان
          بازگردانده می‌شود.
        </p>
      </div>

      <Divider />

      <div className="space-y-3">
        {reason && (
          <div className="p-4 rounded-2xl border border-rose-300/25 bg-rose-400/[0.08]">
            <div className="text-[10.5px] tracking-[0.22em] font-extrabold text-rose-200/80 mb-1.5">
              پاسخ درگاه بانک
            </div>
            <div className="text-white text-[14px] md:text-[15px] leading-8 font-bold">
              {reason}
            </div>
          </div>
        )}
        {orderId && (
          <CopyBadge
            label="شناسه سفارش برای پیگیری"
            value={orderId}
            display={orderId}
            tone="rose"
          />
        )}
      </div>

      <ActionRow>
        <PrimaryLink href="/cart">
          تلاش مجدد
          <ArrowRtl />
        </PrimaryLink>
        <SecondaryLink href="/contact">تماس با پشتیبانی</SecondaryLink>
      </ActionRow>

      <SupportNote />
    </GlassCard>
  );
}

/* ──────────────── Pending ──────────────── */

function PendingView({ orderId }: { orderId: string }) {
  return (
    <GlassCard accent="sky">
      <div className="text-center">
        <PillLabel tone="sky">PAYMENT PENDING</PillLabel>

        <div className="mx-auto mt-6 mb-6 relative w-24 h-24 md:w-28 md:h-28">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              background:
                "radial-gradient(circle, #7cc8ff 0%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-1.5 rounded-full border border-sky-300/40"
          />
          <span
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3) 0%, rgba(124,200,255,0.3) 45%, rgba(23,67,120,0.55) 100%)",
              border: "1px solid rgba(124,200,255,0.55)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 18px 40px -10px rgba(124,200,255,0.4)",
            }}
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3">
          پرداخت شما در{" "}
          <span
            style={{
              background:
                "linear-gradient(180deg, #9ed8ff 0%, #7cc8ff 60%, #4aa3ef 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            حال بررسی
          </span>{" "}
          است
        </h1>
        <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto leading-8">
          نتیجه نهایی تراکنش هنوز از سوی درگاه بانک اعلام نشده است. لطفاً چند
          دقیقه دیگر وضعیت سفارش خود را در پنل بررسی کنید. در صورت کسر وجه و
          عدم ثبت نهایی، مبلغ به صورت خودکار به حساب شما بازگردانده می‌شود.
        </p>
      </div>

      <Divider />

      {orderId && (
        <div className="space-y-3">
          <CopyBadge
            label="شناسه سفارش"
            value={orderId}
            display={orderId}
            tone="neutral"
          />
        </div>
      )}

      <ActionRow>
        <PrimaryLink href="/dashboard/orders">
          مشاهده وضعیت سفارش
          <ArrowRtl />
        </PrimaryLink>
        <SecondaryLink href="/">بازگشت به خانه</SecondaryLink>
      </ActionRow>

      <SupportNote />
    </GlassCard>
  );
}

/* ──────────────── Shared primitives ──────────────── */

function GlassCard({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: "teal" | "rose" | "sky";
}) {
  const accentGlow = {
    teal: "rgba(73,187,189,0.22)",
    rose: "rgba(244,63,94,0.22)",
    sky: "rgba(124,200,255,0.22)",
  }[accent];

  return (
    <div
      className="relative rounded-[2rem] p-6 md:p-10 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 80% 10%, ${accentGlow} 0%, rgba(255,255,255,0.03) 45%), rgba(255,255,255,0.06)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.28), 0 30px 70px -20px rgba(0,0,0,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-3 left-8 w-28 h-3 rounded-full bg-white/30 blur-sm pointer-events-none"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function PillLabel({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "teal" | "rose" | "sky";
}) {
  const map = {
    teal: {
      dot: "bg-[#5ee7a0] shadow-[0_0_10px_#5ee7a0]",
      text: "text-white",
    },
    rose: {
      dot: "bg-rose-300 shadow-[0_0_10px_#fda4af]",
      text: "text-white",
    },
    sky: {
      dot: "bg-sky-300 shadow-[0_0_10px_#7cc8ff]",
      text: "text-white",
    },
  }[tone];

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-[11px] tracking-[0.22em] font-extrabold ${map.text} backdrop-blur`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${map.dot}`} />
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      className="my-7 h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
      }}
    />
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
      <div className="text-[10.5px] tracking-[0.22em] font-extrabold text-white/50">
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}

function ActionRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {children}
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative flex-1 inline-flex items-center justify-center gap-2 h-12 md:h-[52px] px-6 rounded-full font-extrabold text-[13.5px] md:text-[14.5px] text-[#0b1530] overflow-hidden transition active:translate-y-[1px]"
      style={{
        background:
          "linear-gradient(180deg, #f7cf5a 0%, #e8bc3a 60%, #d4a62a 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 14px 30px -10px rgba(247,207,90,0.55)",
      }}
    >
      <span
        aria-hidden
        className="absolute top-1 left-6 w-16 h-2 rounded-full bg-white/55 blur-sm pointer-events-none"
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex-1 inline-flex items-center justify-center h-12 md:h-[52px] px-6 rounded-full font-extrabold text-[13.5px] md:text-[14.5px] text-white transition hover:bg-white/15 active:translate-y-[1px]"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {children}
    </Link>
  );
}

function ArrowRtl() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-hover:-translate-x-0.5"
      aria-hidden
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function SupportNote() {
  return (
    <div className="mt-6 pt-5 border-t border-white/10 text-center text-[12.5px] text-white/55 leading-7">
      نیاز به کمک دارید؟{" "}
      <Link
        href="/contact"
        className="font-extrabold text-[#f7cf5a] hover:text-white transition"
      >
        تماس با پشتیبانی نامدار آکادمی
      </Link>
    </div>
  );
}
