import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  enrollmentStore,
  orderStore,
  type OrderRecord,
} from "@/lib/otp-store";
import { COURSES, formatToman } from "@/data/courses";
import LogoutButton from "./LogoutButton";

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

  const enrolledSlugs = enrollmentStore.get(session.userId) ?? new Set<string>();
  const enrolledCourses = COURSES.filter((c) => enrolledSlugs.has(c.slug));

  const myOrders: OrderRecord[] = [...orderStore.values()]
    .filter((o) => o.userId === session.userId)
    .sort((a, b) => b.createdAt - a.createdAt);

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
          <LogoutButton />
        </div>

        {payment === "success" && orderId && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800">
            ✅ پرداخت شما با موفقیت انجام شد! دوره به حساب شما اضافه شد.
          </div>
        )}
        {payment === "failed" && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800">
            ❌ پرداخت ناموفق بود. اگر مبلغی از حساب شما کسر شده، طی ۷۲ ساعت
            برگردانده خواهد شد.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-3xl bg-white border border-[#e5eaf5]">
            <div className="text-sm text-[#010514]/60 mb-2">دوره‌های من</div>
            <div className="text-3xl font-bold text-[#1b3c8a]">
              {enrolledCourses.length.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-[#e5eaf5]">
            <div className="text-sm text-[#010514]/60 mb-2">سفارش‌های موفق</div>
            <div className="text-3xl font-bold text-[#1b3c8a]">
              {myOrders
                .filter((o) => o.status === "paid")
                .length.toLocaleString("fa-IR")}
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
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#010514] mb-1 line-clamp-1">
                      {c.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-[#010514]/60">
                      <span>{c.lessons} درس</span>
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
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map((o) => {
                    const course = COURSES.find((c) => c.slug === o.courseSlug);
                    return (
                      <tr key={o.id} className="border-t border-[#eef2f7]">
                        <td className="p-4">{course?.title ?? o.courseSlug}</td>
                        <td className="p-4">{formatToman(o.amount)}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              o.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : o.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {o.status === "paid"
                              ? "موفق"
                              : o.status === "pending"
                              ? "در انتظار پرداخت"
                              : "ناموفق"}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs" dir="ltr">
                          {o.refId ?? "—"}
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
