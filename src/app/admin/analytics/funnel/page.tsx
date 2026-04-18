import { Card, CardHeader } from "@/components/admin/ui";
import { FunnelChart } from "@/components/admin/Charts";
import { getFunnel } from "@/lib/analytics";
import { faDigits } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default function FunnelAnalytics() {
  const data = getFunnel();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          قیف تبدیل
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          مسیر حرکت کاربر از ثبت‌نام تا خرید موفق
        </p>
      </div>

      <Card>
        <CardHeader
          title="مراحل"
          subtitle="نرخ تبدیل هر مرحله نسبت به مرحله قبل"
        />
        <div className="p-6">
          <FunnelChart data={data} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold mb-3">تحلیل</h2>
        {data.length === 3 && (
          <ul className="space-y-3 text-sm leading-7 text-[#010514]/80">
            <li>
              {faDigits(data[0].value)} کاربر ثبت‌نام کرده‌اند.
            </li>
            <li>
              از این کاربران، {faDigits(data[1].value)} نفر سفارش شروع کرده‌اند (
              {data[0].value === 0
                ? "۰"
                : faDigits(
                    ((data[1].value / data[0].value) * 100).toFixed(1)
                  )}
              ٪).
            </li>
            <li>
              {faDigits(data[2].value)} کاربر پرداخت موفق داشته‌اند (
              {data[1].value === 0
                ? "۰"
                : faDigits(
                    ((data[2].value / data[1].value) * 100).toFixed(1)
                  )}
              ٪ از شروع‌کنندگان).
            </li>
          </ul>
        )}
      </Card>
    </div>
  );
}
