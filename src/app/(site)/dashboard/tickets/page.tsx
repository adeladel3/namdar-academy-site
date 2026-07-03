import Link from "@/components/SafeLink";
import { getSession } from "@/lib/auth";
import { listMessagesForTicket, listTicketsForUser } from "@/lib/db";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_COLORS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_DOTS,
  TICKET_STATUS_LABELS,
  faDigits,
  formatRelative,
} from "@/lib/formatting";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const session = (await getSession())!;
  const tickets = listTicketsForUser(session.userId);

  const active = tickets.filter(
    (t) => t.status === "open" || t.status === "pending" || t.status === "solved"
  ).length;

  return (
    <div className="max-w-[1180px] mx-auto">
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0e1a3d]">
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-[#0e1a3d]/60 text-[14px] mt-1.5">
            {tickets.length > 0
              ? `${faDigits(tickets.length)} تیکت در مجموع · ${faDigits(active)} فعال`
              : "هنوز تیکتی ثبت نشده."}
          </p>
        </div>
        <Link
          href="/dashboard/tickets/new"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-white font-extrabold text-[13.5px] transition active:scale-[0.98] self-start sm:self-auto"
          style={{
            background: "linear-gradient(135deg,#1b3c8a,#136cb5 55%,#1b3c8a)",
            boxShadow: "0 12px 26px -10px rgba(19,108,181,0.55)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          تیکت جدید
        </Link>
      </header>

      {tickets.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-dashed border-[#e5eaf5]">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#eef4ff] text-[#1b3c8a] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-[#0e1a3d] text-[16px] mb-1.5">
            هنوز تیکتی ثبت نکرده‌اید
          </h3>
          <p className="text-[13px] text-[#0e1a3d]/60 mb-5 max-w-sm mx-auto leading-7">
            برای هر سوال یا درخواست، تیکت جدید باز کنید و پاسخ را در همین صفحه دریافت کنید.
          </p>
          <Link
            href="/dashboard/tickets/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1b3c8a] text-white font-extrabold text-[14px] hover:opacity-95 transition"
          >
            ثبت اولین تیکت
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const msgCount = listMessagesForTicket(t.id).length;
            return (
              <Link
                key={t.id}
                href={`/dashboard/tickets/${t.id}`}
                className="group block bg-white rounded-2xl border border-[#e5eaf5] p-4 md:p-5 hover:border-[#bcd9f4] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-20px_rgba(14,26,61,0.25)] transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`shrink-0 mt-1 w-2.5 h-2.5 rounded-full ${TICKET_STATUS_DOTS[t.status]}`}
                    title={TICKET_STATUS_LABELS[t.status]}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-extrabold text-[#0e1a3d] text-[15px] md:text-[16px] leading-snug group-hover:text-[#1b3c8a] transition line-clamp-2">
                        {t.subject}
                      </h3>
                      {t.unreadForUser > 0 && (
                        <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center tabular-nums">
                          {faDigits(t.unreadForUser)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-[#0e1a3d]/55 mt-1 font-mono" dir="ltr">
                      #{t.id.slice(4, 12)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${TICKET_STATUS_COLORS[t.status]}`}
                  >
                    {TICKET_STATUS_LABELS[t.status]}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${TICKET_PRIORITY_COLORS[t.priority]}`}
                  >
                    اولویت: {TICKET_PRIORITY_LABELS[t.priority]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f4f7fc] text-[#0e1a3d]/70">
                    {TICKET_CATEGORY_LABELS[t.category]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f4f7fc] text-[#0e1a3d]/70">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    {faDigits(msgCount)} پیام
                  </span>
                  <span className="mr-auto text-[11px] text-[#0e1a3d]/55">
                    آخرین فعالیت {formatRelative(t.lastMessageAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
