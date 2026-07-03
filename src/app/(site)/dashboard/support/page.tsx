import { getSession } from "@/lib/auth";
import {
  getSetting,
  getUser,
  listCallbackRequests,
  listCourses,
} from "@/lib/db";
import {
  faDigits,
  formatDateTime,
  formatRelative,
  phoneToTelHref,
} from "@/lib/formatting";
import SalesLeadForm from "./SalesLeadForm";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  new: "در انتظار تماس",
  contacted: "پاسخ داده شده",
  archived: "بایگانی شده",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-emerald-100 text-emerald-700",
  archived: "bg-neutral-200 text-neutral-600",
};

function normalizePhone(p: string) {
  return p.replace(/\D/g, "");
}

export default async function SupportPage() {
  const session = (await getSession())!;
  const user = getUser(session.userId);
  const mine = listCallbackRequests()
    .filter((r) => normalizePhone(r.phone) === normalizePhone(session.phone))
    .sort((a, b) => b.createdAt - a.createdAt);

  const contactPhone = (getSetting("site.contactPhone") as string) ?? "";
  const contactEmail = (getSetting("site.contactEmail") as string) ?? "";

  const courseOptions = listCourses({ status: "published" }).map((c) => ({
    slug: c.slug,
    title: c.title,
  }));

  return (
    <div className="max-w-[1180px] mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#0e1a3d] leading-tight">
          پشتیبانی
        </h1>
        <p className="text-[#0e1a3d]/70 text-[16px] md:text-[17px] font-bold mt-2 leading-8">
          راه‌های ارتباط با تیم نامدار آکادمی و تاریخچهٔ درخواست‌های مشاورهٔ شما.
        </p>
      </header>

      {/* Contact channels */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
        {contactPhone && (
          <ChannelCard
            title="تماس تلفنی"
            desc="ساعات پاسخ‌گویی در روزهای کاری: شنبه تا چهارشنبه ۹:۰۰ الی ۱۸:۰۰ — پنجشنبه ۹:۰۰ الی ۱۴:۰۰"
            value={faDigits(contactPhone)}
            href={phoneToTelHref(contactPhone)}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.59 2.81.72a2 2 0 011.72 2z" />
              </svg>
            }
            tint="blue"
          />
        )}
        {contactEmail && (
          <ChannelCard
            title="ایمیل"
            desc="پاسخ طی ۲۴ ساعت کاری"
            value={contactEmail}
            href={`mailto:${contactEmail}`}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            tint="gold"
          />
        )}
      </section>

      {/* New sales / consultation request form */}
      <section className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-black text-[#0e1a3d] leading-tight">
            درخواست تماس و مشاوره فروش
          </h2>
          <p className="text-[15px] md:text-[16px] text-[#0e1a3d]/70 font-bold mt-2 leading-8">
            دوره یا سرویس مورد نظر را انتخاب کنید تا همکاران فروش با شما تماس
            بگیرند و راهنمایی لازم را ارائه دهند.
          </p>
        </div>
        <SalesLeadForm
          defaultPhone={session.phone}
          defaultName={user?.name ?? ""}
          courses={courseOptions}
        />
      </section>

      {/* My callback history */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-black text-[#0e1a3d] leading-tight">
            درخواست‌های مشاورهٔ من
          </h2>
        </div>

        {mine.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center mb-3">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-[15px] md:text-[16px] text-[#0e1a3d]/70 font-bold max-w-md mx-auto leading-8">
              هنوز درخواستی ثبت نکرده‌اید. از فرم بالا دوره مورد نظرتان را
              انتخاب و درخواست را ارسال کنید.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mine.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-[#e5eaf5] p-5 md:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-black text-[#0e1a3d] text-[16px] md:text-[17px] mb-1.5 leading-tight">
                      {r.topic || "درخواست مشاوره"}
                    </div>
                    <div className="text-[13px] text-[#0e1a3d]/60 font-bold">
                      {formatRelative(r.createdAt)} · {formatDateTime(r.createdAt)}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-block px-3 py-1 rounded-full text-[12.5px] font-black ${STATUS_COLORS[r.status] ?? ""}`}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>

                {(r.preferredTime || r.note) && (
                  <div className="pt-3 mt-3 border-t border-[#eef2f7] space-y-2 text-[14.5px] md:text-[15px] text-[#0e1a3d]/80 font-bold leading-8">
                    {r.preferredTime && (
                      <div>
                        <span className="font-black text-[#0e1a3d]/65 ml-1.5">
                          زمان مناسب:
                        </span>
                        {r.preferredTime}
                      </div>
                    )}
                    {r.note && (
                      <div>
                        <span className="font-black text-[#0e1a3d]/65 ml-1.5">
                          یادداشت:
                        </span>
                        {r.note}
                      </div>
                    )}
                  </div>
                )}

                {r.status === "contacted" && r.contactedAt && (
                  <div className="pt-3 mt-3 border-t border-[#eef2f7] text-[13px] text-emerald-700 font-black leading-7">
                    همکاران ما در {formatDateTime(r.contactedAt)} با شما تماس گرفتند.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ChannelCard({
  title,
  desc,
  value,
  href,
  icon,
  tint,
}: {
  title: string;
  desc: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  tint: "blue" | "teal" | "gold";
}) {
  const tintMap = {
    blue: "bg-[#eaf1fc] text-[#1b3c8a]",
    teal: "bg-[#e0f5f6] text-[#0e8a8c]",
    gold: "bg-[#fdf4d4] text-[#8a6a14]",
  }[tint];
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group bg-white rounded-2xl border border-[#e5eaf5] p-5 md:p-6 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(14,26,61,0.22)] transition"
    >
      <div
        className={`shrink-0 w-14 h-14 rounded-2xl ${tintMap} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-[#0e1a3d] text-[17px] md:text-[18px] mb-1 leading-tight">
          {title}
        </div>
        <div className="text-[13.5px] md:text-[14px] text-[#0e1a3d]/65 font-bold mb-2 leading-7">
          {desc}
        </div>
        <div
          className="font-mono text-[15px] md:text-[16px] font-extrabold text-[#1b3c8a] truncate group-hover:text-[#0e1a3d] transition"
          dir="ltr"
        >
          {value}
        </div>
      </div>
    </a>
  );
}
