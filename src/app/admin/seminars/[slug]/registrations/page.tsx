import { notFound } from "next/navigation";
import {
  getOrder,
  getSeminar,
  getUser,
  listSeminarRegistrationsBySeminar,
} from "@/lib/db";
import { Card, CardHeader, Empty } from "@/components/admin/ui";
import {
  faDigits,
  formatRelative,
  formatToman,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function SeminarRegistrationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) notFound();

  const registrations = listSeminarRegistrationsBySeminar(seminar.slug);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="فهرست ثبت‌نام‌ها"
          subtitle={`${faDigits(registrations.length)} نفر${
            seminar.capacity ? ` از ${faDigits(seminar.capacity)}` : ""
          }`}
        />
        {registrations.length === 0 ? (
          <Empty
            title="هنوز کسی ثبت‌نام نکرده"
            description="با فروش اولین صندلی، ثبت‌نام‌ها در این لیست ظاهر می‌شوند."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f7fafd] text-[#010514]/65 text-xs">
                <tr>
                  <th className="px-4 py-3 text-right font-bold">#</th>
                  <th className="px-4 py-3 text-right font-bold">نام و نام خانوادگی</th>
                  <th className="px-4 py-3 text-right font-bold">کد ملی</th>
                  <th className="px-4 py-3 text-right font-bold">شماره موبایل</th>
                  <th className="px-4 py-3 text-right font-bold">QR ورود</th>
                  <th className="px-4 py-3 text-right font-bold">مبلغ پرداختی</th>
                  <th className="px-4 py-3 text-right font-bold">منبع</th>
                  <th className="px-4 py-3 text-right font-bold">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f7]">
                {registrations.map((r, i) => {
                  const user = getUser(r.userId);
                  const order = r.orderId ? getOrder(r.orderId) : undefined;
                  return (
                    <tr key={r.id} className="hover:bg-[#f7fafd] transition">
                      <td className="px-4 py-3 text-[#010514]/65 font-mono" dir="ltr">
                        {faDigits(i + 1)}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#010514]">
                        <div>{r.fullName}</div>
                        {user && user.name !== r.fullName && (
                          <div className="text-[11px] text-[#010514]/55 mt-0.5">
                            حساب کاربری: {user.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#010514]/85" dir="ltr">
                        {r.nationalId}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#010514]/85" dir="ltr">
                        {r.phone}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#010514]/65" dir="ltr">
                        {r.qrCode ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[#1b3c8a] font-bold">
                        {order ? formatToman(order.finalAmount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#010514]/85">
                        {r.source === "purchase" ? "خرید مستقیم" : "اعطا توسط ادمین"}
                      </td>
                      <td className="px-4 py-3 text-[#010514]/65 text-xs">
                        {formatRelative(r.registeredAt)}
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
