import { faDigits, formatPhone } from "@/lib/formatting";

export type AgentClientRow = {
  userId: string;
  name: string;
  phone: string;
  referredAt: number | null;
  linkLabel: string | null;
  totalOrders: number;
  paidOrders: number;
  totalSpent: number;
  totalCommission: number;
};

export default function AgentClients({ rows }: { rows: AgentClientRow[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-extrabold text-[#0e1a3d] text-[15px]">
          مشتریان معرفی‌شده توسط شما
        </h2>
        <p className="text-[12px] text-[#0e1a3d]/55 mt-0.5">
          همهٔ کاربرانی که با لینک‌های شما ثبت‌نام کرده‌اند — حتی اگر هنوز خرید
          نکرده باشند.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fafbfe] text-[#0e1a3d]/55 text-[12px] font-bold">
              <tr>
                <th className="text-right p-3">کاربر</th>
                <th className="text-right p-3">از طریق</th>
                <th className="text-right p-3">تاریخ ثبت‌نام</th>
                <th className="text-right p-3">سفارش‌ها</th>
                <th className="text-right p-3">جمع خرید</th>
                <th className="text-right p-3">کمیسیون شما</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = r.referredAt ? new Date(r.referredAt) : null;
                return (
                  <tr
                    key={r.userId}
                    className="border-t border-[#eef2fb] hover:bg-[#fafbfe] transition"
                  >
                    <td className="p-3">
                      <div className="font-bold text-[#0e1a3d] text-[13px]">
                        {r.name}
                      </div>
                      <div
                        className="text-[11px] text-[#0e1a3d]/55 font-mono"
                        dir="ltr"
                      >
                        {formatPhone(r.phone)}
                      </div>
                    </td>
                    <td className="p-3">
                      {r.linkLabel ? (
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#1b3c8a] font-bold border border-[#dfe9ff]">
                          {r.linkLabel}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#0e1a3d]/40">—</span>
                      )}
                    </td>
                    <td
                      className="p-3 text-[12px] text-[#0e1a3d]/70 font-mono"
                      dir="ltr"
                    >
                      {d ? d.toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="p-3 text-[#0e1a3d]/85 text-[13px]">
                      <span className="font-mono">
                        {faDigits(r.paidOrders.toString())}
                      </span>
                      <span className="text-[10px] text-[#0e1a3d]/40">
                        {" "}
                        / {faDigits(r.totalOrders.toString())}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[12px] text-[#0e1a3d]/85">
                      {faDigits(r.totalSpent.toLocaleString("en-US"))}
                    </td>
                    <td className="p-3 font-mono text-[12px] text-emerald-700 font-bold">
                      {faDigits(r.totalCommission.toLocaleString("en-US"))}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-[#0e1a3d]/55 text-sm"
                  >
                    هنوز هیچ کاربری با لینک‌های شما ثبت‌نام نکرده.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
