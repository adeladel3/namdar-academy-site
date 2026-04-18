import Link from "next/link";
import {
  getGrowthSeries,
  getOrdersSeries,
  getOverviewStats,
  getRevenueSeries,
  getTopCourses,
} from "@/lib/analytics";
import {
  listAllOrders,
  listUsers,
  getCourse,
  getUser,
} from "@/lib/db";
import StatCard from "@/components/admin/StatCard";
import {
  DualLineChart,
  LineChart,
} from "@/components/admin/Charts";
import { Card, CardHeader } from "@/components/admin/ui";
import { Icon } from "@/components/admin/Icons";
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  faDigits,
  formatDateTime,
  formatRelative,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export default function AdminDashboard() {
  const stats = getOverviewStats();
  const revenueSeries = getRevenueSeries(30);
  const growthSeries = getGrowthSeries(30);
  const ordersSeries = getOrdersSeries(30);
  const topCourses = getTopCourses(5);

  const recentOrders = listAllOrders().slice(0, 8);
  const recentUsers = listUsers().slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            داشبورد مدیریت
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            نمای کلی عملکرد آکادمی در ۳۰ روز گذشته
          </p>
        </div>
      </div>

      {/* Row 1: 4 stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="درآمد ماه جاری"
          value={formatTomanCompact(stats.revenueMonth)}
          hint={`مجموع خالص: ${formatTomanCompact(stats.netRevenue)}`}
          icon={<Icon.Money width={18} height={18} />}
          deltaPct={stats.revenueGrowth}
          spark={revenueSeries.map((r) => r.revenue)}
        />
        <StatCard
          label="کاربران"
          value={stats.totalUsers}
          hint={`${faDigits(stats.newUsersMonth)} کاربر جدید این ماه`}
          icon={<Icon.Users width={18} height={18} />}
          spark={growthSeries.map((g) => g.added)}
        />
        <StatCard
          label="دوره‌های منتشر شده"
          value={stats.publishedCourses}
          hint={`از ${faDigits(stats.totalCourses)} دوره کل`}
          icon={<Icon.Book width={18} height={18} />}
        />
        <StatCard
          label="نرخ تبدیل"
          value={`${faDigits((stats.conversionRate * 100).toFixed(1))}٪`}
          hint={`${faDigits(stats.paidOrders)} از ${faDigits(stats.totalUsers)} کاربر خرید داشته‌اند`}
          icon={<Icon.Trend width={18} height={18} />}
        />
      </div>

      {/* Row 2: 3 small cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="سفارش‌های موفق ماه"
          value={stats.newPaidOrdersMonth}
          icon={<Icon.Check width={18} height={18} />}
          tone="success"
        />
        <StatCard
          label="سفارش‌های در انتظار"
          value={stats.pendingOrders}
          icon={<Icon.Receipt width={18} height={18} />}
          tone="warning"
        />
        <StatCard
          label="استردادها"
          value={formatTomanCompact(stats.totalRefunds)}
          icon={<Icon.Download width={18} height={18} />}
          tone="danger"
        />
      </div>

      {/* Row 3: Revenue chart */}
      <Card>
        <CardHeader
          title="درآمد ۳۰ روز گذشته"
          subtitle={`مجموع: ${formatToman(
            revenueSeries.reduce((s, r) => s + r.revenue, 0)
          )}`}
        />
        <div className="p-4">
          <LineChart
            data={revenueSeries.map((r) => ({
              label: r.label,
              value: r.revenue,
            }))}
            format="tomanCompact"
            color="#1b3c8a"
            height={260}
          />
        </div>
      </Card>

      {/* Row 4: 2-col grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="رشد کاربران" subtitle="تعداد کاربر جدید روزانه" />
          <div className="p-4">
            <LineChart
              data={growthSeries.map((g) => ({ label: g.label, value: g.added }))}
              color="#49bbbd"
              height={220}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="سفارش‌ها" subtitle="موفق / ناموفق روزانه" />
          <div className="p-4">
            <DualLineChart
              data={ordersSeries.map((o) => ({
                label: o.label,
                paid: o.paid,
                failed: o.failed,
              }))}
              keys={[
                { key: "paid", color: "#22c55e", name: "موفق" },
                { key: "failed", color: "#ef4444", name: "ناموفق" },
              ]}
              height={220}
            />
          </div>
        </Card>
      </div>

      {/* Row 5: Top courses + recent activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="پرفروش‌ترین دوره‌ها"
            right={
              <Link
                href="/admin/analytics/courses"
                className="text-sm text-[#1b3c8a] font-bold hover:underline"
              >
                همه دوره‌ها ←
              </Link>
            }
          />
          {topCourses.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            <div className="divide-y divide-[#eef2f7]">
              {topCourses.map((c) => (
                <Link
                  key={c.slug}
                  href={`/admin/courses/${c.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-[#f7fafd] transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-16 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#010514] truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-[#010514]/55">
                      {faDigits(c.enrolled)} ثبت‌نام
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[#1b3c8a]">
                      {formatTomanCompact(c.revenue)}
                    </div>
                    <div className="text-xs text-[#010514]/55">
                      {faDigits(c.sales)} فروش
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="کاربران جدید" />
          {recentUsers.length === 0 ? (
            <div className="p-10 text-center text-[#010514]/55 text-sm">
              هنوز کاربری نیست.
            </div>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {recentUsers.slice(0, 6).map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-9 h-9 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold text-sm flex items-center justify-center">
                    {u.name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{u.name}</div>
                    <div
                      className="text-[11px] text-[#010514]/55 font-mono"
                      dir="ltr"
                    >
                      {u.phone}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#010514]/50">
                    {formatRelative(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Row 6: Recent orders */}
      <Card>
        <CardHeader
          title="آخرین سفارش‌ها"
          right={
            <Link
              href="/admin/orders"
              className="text-sm text-[#1b3c8a] font-bold hover:underline"
            >
              همه سفارش‌ها ←
            </Link>
          }
        />
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-[#010514]/55 text-sm">
            هنوز سفارشی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65">
                <tr>
                  <th className="text-right p-4">کاربر</th>
                  <th className="text-right p-4">دوره</th>
                  <th className="text-right p-4">مبلغ</th>
                  <th className="text-right p-4">وضعیت</th>
                  <th className="text-right p-4">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const u = getUser(o.userId);
                  const c = getCourse(o.courseSlug);
                  return (
                    <tr key={o.id} className="border-t border-[#eef2f7]">
                      <td className="p-4">
                        <div className="text-sm">{u?.name ?? "—"}</div>
                        <div
                          className="text-[11px] text-[#010514]/55 font-mono"
                          dir="ltr"
                        >
                          {u?.phone}
                        </div>
                      </td>
                      <td className="p-4">{c?.title ?? o.courseSlug}</td>
                      <td className="p-4 font-bold text-[#1b3c8a]">
                        {formatToman(o.finalAmount)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[11px] font-bold ${ORDER_STATUS_COLORS[o.status]}`}
                        >
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[#010514]/55">
                        {formatDateTime(o.createdAt)}
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
  );
}
