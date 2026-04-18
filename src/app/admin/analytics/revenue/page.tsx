import { Card, CardHeader } from "@/components/admin/ui";
import {
  getOverviewStats,
  getRevenueSeries,
  groupOrdersByMonth,
} from "@/lib/analytics";
import { BarChart, LineChart } from "@/components/admin/Charts";
import StatCard from "@/components/admin/StatCard";
import { listAllOrders } from "@/lib/db";
import {
  faDigits,
  formatToman,
  formatTomanCompact,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default function RevenueAnalytics() {
  const stats = getOverviewStats();
  const last30 = getRevenueSeries(30);
  const last90 = getRevenueSeries(90);
  const monthly = groupOrdersByMonth(listAllOrders());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          تحلیل درآمد
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          عملکرد مالی از دیدگاه‌های مختلف
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="درآمد ماه جاری"
          value={formatTomanCompact(stats.revenueMonth)}
          deltaPct={stats.revenueGrowth}
        />
        <StatCard
          label="درآمد ماه قبل"
          value={formatTomanCompact(stats.revenuePrevMonth)}
        />
        <StatCard
          label="درآمد خالص کل"
          value={formatTomanCompact(stats.netRevenue)}
          hint={`- ${formatTomanCompact(stats.totalRefunds)} استرداد`}
        />
      </div>

      <Card>
        <CardHeader title="درآمد ۳۰ روز گذشته" />
        <div className="p-4">
          <LineChart
            data={last30.map((r) => ({ label: r.label, value: r.revenue }))}
            format="tomanCompact"
            color="#1b3c8a"
            height={260}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="درآمد ۹۰ روز گذشته" />
        <div className="p-4">
          <LineChart
            data={last90.map((r) => ({ label: r.label, value: r.revenue }))}
            format="tomanCompact"
            color="#49bbbd"
            height={260}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="درآمد ماهانه" subtitle="خلاصه هر ماه" />
        <div className="p-4">
          {monthly.length === 0 ? (
            <div className="py-10 text-center text-[#010514]/55 text-sm">
              داده‌ای ثبت نشده است.
            </div>
          ) : (
            <BarChart
              data={monthly.map((m) => ({ label: m.month, value: m.revenue }))}
              format="tomanCompact"
              color="#136cb5"
              height={280}
            />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="جدول فروش ماهانه" />
        {monthly.length === 0 ? (
          <div className="py-10 text-center text-[#010514]/55 text-sm">
            —
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65">
                <tr>
                  <th className="text-right p-3">ماه</th>
                  <th className="text-right p-3">تعداد فروش</th>
                  <th className="text-right p-3">درآمد</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month} className="border-t border-[#eef2f7]">
                    <td className="p-3 font-mono" dir="ltr">
                      {m.month}
                    </td>
                    <td className="p-3">{faDigits(m.count)}</td>
                    <td className="p-3 font-bold text-[#1b3c8a]">
                      {formatToman(m.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
