import Link from "next/link";
import { Card, CardHeader } from "@/components/admin/ui";
import { getTopCourses } from "@/lib/analytics";
import {
  COURSE_STATUS_COLORS,
  COURSE_STATUS_LABELS,
  faDigits,
  formatToman,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default function CourseAnalyticsOverview() {
  const data = getTopCourses(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          تحلیل دوره‌ها
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          مقایسه فروش و ثبت‌نام میان همه دوره‌ها
        </p>
      </div>

      <Card>
        <CardHeader title={`${faDigits(data.length)} دوره`} />
        {data.length === 0 ? (
          <div className="py-10 text-center text-[#010514]/55 text-sm">
            هنوز دوره‌ای ایجاد نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65">
                <tr>
                  <th className="text-right p-3">دوره</th>
                  <th className="text-right p-3">وضعیت</th>
                  <th className="text-right p-3">ثبت‌نام</th>
                  <th className="text-right p-3">فروش موفق</th>
                  <th className="text-right p-3">درآمد</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.slug} className="border-t border-[#eef2f7]">
                    <td className="p-3">
                      <Link
                        href={`/admin/courses/${c.slug}/analytics`}
                        className="flex items-center gap-3 hover:text-[#1b3c8a]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-14 h-9 rounded-lg object-cover"
                        />
                        <span className="font-medium">{c.title}</span>
                      </Link>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${COURSE_STATUS_COLORS[c.status]}`}
                      >
                        {COURSE_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="p-3">{faDigits(c.enrolled)}</td>
                    <td className="p-3">{faDigits(c.sales)}</td>
                    <td className="p-3 font-bold text-[#1b3c8a]">
                      {formatToman(c.revenue)}
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
