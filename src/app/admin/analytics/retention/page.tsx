import { Card, CardHeader } from "@/components/admin/ui";
import { getRetention } from "@/lib/analytics";
import { faDigits } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default function RetentionAnalytics() {
  const data = getRetention();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          Retention ماهانه
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          چند درصد از کاربران هر ماه، حداقل یک خرید موفق داشته‌اند
        </p>
      </div>

      <Card>
        <CardHeader title="کوهورت‌ها" />
        {data.length === 0 ? (
          <div className="py-10 text-center text-[#010514]/55 text-sm">
            هنوز داده‌ای جمع‌آوری نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65">
                <tr>
                  <th className="text-right p-3">ماه ثبت‌نام</th>
                  <th className="text-right p-3">تعداد کاربر</th>
                  <th className="text-right p-3">خرید موفق</th>
                  <th className="text-right p-3">نرخ</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.month} className="border-t border-[#eef2f7]">
                    <td className="p-3 font-mono">{r.month}</td>
                    <td className="p-3">{faDigits(r.size)}</td>
                    <td className="p-3">{faDigits(r.retained)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-[#f7fafd] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1b3c8a]"
                            style={{ width: `${Math.round(r.rate * 100)}%` }}
                          />
                        </div>
                        <span className="font-bold">
                          {faDigits((r.rate * 100).toFixed(1))}٪
                        </span>
                      </div>
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
