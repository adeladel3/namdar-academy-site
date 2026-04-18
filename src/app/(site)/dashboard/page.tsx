import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import {
  getCourse,
  listEnrollments,
  listOrdersByUser,
  type OrderRecord,
} from "@/lib/db";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  faDigits,
  formatDateTime,
  formatToman,
} from "@/lib/formatting";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const sp = await searchParams;
  const payment = sp.payment;
  const orderId = sp.order;
  const reason = sp.reason;

  const enrolledSlugs = listEnrollments(session.userId);
  const enrolledCourses = enrolledSlugs
    .map((slug) => getCourse(slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const myOrders: OrderRecord[] = listOrdersByUser(session.userId);

  return (
    <div className="bg-[#f7fafd] min-h-screen py-10 md:py-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#010514]">
              سلام {session.name} 👋
            </h1>
            <p className="text-[#010514]/65 text-sm mt-1">
              به پنل شخصی نامدار آکادمی خوش آمدید.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isStaff(session) && (
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-full bg-[#1b3c8a] text-white font-bold text-sm hover:opacity-90 transition"
              >
                پنل مدیریت
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {payment === "success" && orderId && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800">
            ✅ پرداخت شما با موفقیت انجام شد! دوره به حساب شما اضافه شد.
          </div>
        )}
        {payment === "failed" && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800">
            ❌ پرداخت ناموفق بود{reason ? ` — ${decodeURIComponent(reason)}` : ""}.
            اگر مبلغی از حساب شما کسر شده، طی ۷۲ ساعت برگردانده خواهد شد.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-white border border-[#e5eaf5]">
            <div className="text-sm text-[#010514]/60 mb-2">دوره‌های من</div>
            <div className="text-3xl font-bold text-[#1b3c8a]">
              {faDigits(enrolledCourses.length)}
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#e5eaf5]">
            <div className="text-sm text-[#010514]/60 mb-2">سفارش‌های موفق</div>
            <div className="text-3xl font-bold text-[#1b3c8a]">
              {faDigits(myOrders.filter((o) => o.status === "paid").length)}
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#e5eaf5]">
            <div className="text-sm text-[#010514]/60 mb-2">شماره موبایل</div>
            <div
              className="text-xl font-bold text-[#1b3c8a] font-mono"
              dir="ltr"
            >
              {session.phone}
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#010514]">
              دوره‌های من
            </h2>
            <Link
              href="/courses"
              className="text-sm text-[#1b3c8a] font-bold hover:underline"
            >
              مشاهده همه دوره‌ها ←
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-[#010514]/65 mb-5">
                هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.
              </p>
              <Link
                href="/courses"
                className="inline-block px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-bold hover:opacity-90 transition"
              >
                مشاهده دوره‌ها
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((c) => (
                <Link
                  key={c.slug}
                  href={`/dashboard/learn/${c.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition border border-[#e5eaf5]"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-[#136cb5] to-[#49bbbd]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.previewImage}
                      alt=""
                      aria-hidden
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#010514] mb-1 line-clamp-1">
                      {c.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-[#010514]/60">
                      <span>{c.instructor}</span>
                      <span className="text-[#1b3c8a] font-bold group-hover:gap-2 inline-flex gap-1 transition-all">
                        ورود به دوره <span>←</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[#010514] mb-4">
            تاریخچه سفارش‌ها
          </h2>
          {myOrders.length === 0 ? (
            <div className="p-6 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5] text-[#010514]/60">
              هنوز سفارشی ثبت نکرده‌اید.
            </div>
          ) : (
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e5eaf5]">
              <table className="w-full text-sm">
                <thead className="bg-[#f7fafd] text-[#010514]/65">
                  <tr>
                    <th className="text-right p-4">دوره</th>
                    <th className="text-right p-4">مبلغ</th>
                    <th className="text-right p-4">وضعیت</th>
                    <th className="text-right p-4">کد پیگیری</th>
                    <th className="text-right p-4">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((o) => {
                    const course = getCourse(o.courseSlug);
                    return (
                      <tr key={o.id} className="border-t border-[#eef2f7]">
                        <td className="p-4">{course?.title ?? o.courseSlug}</td>
                        <td className="p-4">{formatToman(o.finalAmount)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[o.status]}`}
                          >
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs" dir="ltr">
                          {o.refNum ?? "—"}
                        </td>
                        <td className="p-4 text-[#010514]/55 text-xs">
                          {formatDateTime(o.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
