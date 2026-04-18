import { listNewsletterSubs } from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import { formatDateTime, faDigits } from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default function NewsletterPage() {
  const subs = listNewsletterSubs();
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            خبرنامه
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            {faDigits(subs.length)} ایمیل ثبت‌شده
          </p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          download
          className="px-4 py-2 rounded-full bg-[#1b3c8a] text-white text-sm font-bold hover:opacity-90 transition"
        >
          دانلود CSV
        </a>
      </div>

      <Card>
        <CardHeader title="لیست مشترکین" />
        {subs.length === 0 ? (
          <div className="py-14 text-center text-[#010514]/55 text-sm">
            هنوز کسی ایمیل خود را ثبت نکرده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65">
                <tr>
                  <th className="text-right p-3">ایمیل</th>
                  <th className="text-right p-3">تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr
                    key={s.email}
                    className="border-t border-[#eef2f7]"
                  >
                    <td className="p-3 font-mono text-xs" dir="ltr">
                      {s.email}
                    </td>
                    <td className="p-3 text-xs text-[#010514]/55">
                      {formatDateTime(s.subscribedAt)}
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
