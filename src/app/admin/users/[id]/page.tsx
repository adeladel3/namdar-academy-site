import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getCourse,
  getUser,
  listAllOrders,
  listCourses,
  listEnrollmentRecordsForUser,
  listProgressForUser,
  listWatchEventsForUser,
} from "@/lib/db";
import StatCard from "@/components/admin/StatCard";
import { Card, CardHeader } from "@/components/admin/ui";
import UserProfileActions from "./UserProfileActions";
import { Icon } from "@/components/admin/Icons";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  faDigits,
  formatDate,
  formatDateTime,
  formatPhone,
  formatRelative,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = getUser(id);
  if (!user) notFound();

  const session = await getSession();
  const viewer = session ? getUser(session.userId) : null;
  const viewerIsSuperAdmin = !!viewer?.isSuperAdmin;
  const viewerIsAdmin = session?.role === "admin";

  const enrollments = listEnrollmentRecordsForUser(id);
  const progress = listProgressForUser(id);
  const orders = listAllOrders().filter((o) => o.userId === id);
  const paidOrders = orders.filter((o) => o.status === "paid");
  const spent = paidOrders.reduce((s, o) => s + o.finalAmount, 0);
  const events = listWatchEventsForUser(id, 15);
  const allCourses = listCourses();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[#010514]/60 flex gap-2">
        <Link href="/admin/users" className="hover:text-[#1b3c8a]">
          کاربران
        </Link>
        <span>/</span>
        <span className="text-[#010514]">{user.name}</span>
      </nav>

      <Card className="p-6 flex items-center gap-5 flex-wrap">
        <span className="w-16 h-16 rounded-full bg-gradient-to-br from-[#136cb5] to-[#49bbbd] text-white font-bold text-2xl flex items-center justify-center shrink-0">
          {user.name.charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-lg md:text-xl font-bold text-[#010514]">
              {user.name}
            </h1>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${USER_ROLE_COLORS[user.role]}`}
            >
              {USER_ROLE_LABELS[user.role]}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                user.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {USER_STATUS_LABELS[user.status]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#010514]/60 flex-wrap">
            <span className="font-mono" dir="ltr">
              {formatPhone(user.phone)}
            </span>
            {user.email && <span>{user.email}</span>}
            <span>ثبت‌نام: {formatDate(user.createdAt)}</span>
            {user.lastLoginAt && (
              <span>آخرین ورود: {formatRelative(user.lastLoginAt)}</span>
            )}
          </div>
          {user.status === "disabled" && user.disabledReason && (
            <div className="mt-2 text-xs text-red-700 bg-red-50 rounded-lg p-2">
              دلیل غیرفعال‌سازی: {user.disabledReason}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/admin/users/${user.id}/permissions`}
            className="text-xs px-3 py-2 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold hover:bg-[#dfe7ff] transition"
          >
            مدیریت دسترسی‌ها
          </Link>
          <UserProfileActions
            user={user}
            courses={allCourses}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
            viewerIsAdmin={viewerIsAdmin}
          />
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="دوره‌های ثبت‌نام شده"
          value={enrollments.length}
          icon={<Icon.Book width={18} height={18} />}
        />
        <StatCard
          label="سفارش‌های موفق"
          value={paidOrders.length}
          icon={<Icon.Receipt width={18} height={18} />}
        />
        <StatCard
          label="مجموع پرداخت"
          value={formatTomanCompact(spent)}
          icon={<Icon.Money width={18} height={18} />}
        />
        <StatCard
          label="درس‌های تکمیل شده"
          value={progress.filter((p) => p.completed).length}
          hint={`از ${faDigits(progress.length)} شروع شده`}
          icon={<Icon.Check width={18} height={18} />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="دوره‌های کاربر" />
          {enrollments.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز در هیچ دوره‌ای ثبت‌نام نکرده است.
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {enrollments.map((e) => {
                const c = getCourse(e.courseSlug);
                return (
                  <li key={e.id} className="p-4 flex items-center gap-3">
                    {c && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.previewImage}
                          alt={c.title}
                          className="w-14 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#010514] truncate">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-[#010514]/55">
                            {e.source === "purchase"
                              ? "خرید"
                              : e.source === "grant"
                              ? "اعطا شده"
                              : "رایگان"}{" "}
                            · {formatDate(e.enrolledAt)}
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="سفارش‌ها" />
          {orders.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز سفارشی ثبت نکرده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f7fafd] text-[#010514]/65">
                  <tr>
                    <th className="text-right p-3">دوره</th>
                    <th className="text-right p-3">مبلغ</th>
                    <th className="text-right p-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const c = getCourse(o.courseSlug);
                    return (
                      <tr key={o.id} className="border-t border-[#eef2f7]">
                        <td className="p-3 truncate">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="hover:text-[#1b3c8a]"
                          >
                            {c?.title ?? o.courseSlug}
                          </Link>
                        </td>
                        <td className="p-3 font-bold text-[#1b3c8a]">
                          {formatToman(o.finalAmount)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${ORDER_STATUS_COLORS[o.status]}`}
                          >
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="فعالیت‌های اخیر (watch events)" />
        {events.length === 0 ? (
          <div className="p-10 text-center text-[#010514]/55 text-sm">
            هنوز رویدادی ثبت نشده است.
          </div>
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {events.map((e) => (
              <li
                key={e.id}
                className="px-4 py-3 flex items-center gap-3 text-sm"
              >
                <span className="text-xs text-[#010514]/45 font-mono" dir="ltr">
                  {formatDateTime(e.timestamp)}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold">
                  {e.type}
                </span>
                <span className="flex-1 truncate">درس {e.lessonId}</span>
                <span className="text-xs text-[#010514]/55" dir="ltr">
                  {faDigits(e.positionSec)} ثانیه
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
