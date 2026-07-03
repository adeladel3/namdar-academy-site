import Link from "@/components/SafeLink";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getCourse,
  getTicket,
  getUser,
  listMessagesForTicket,
  markTicketReadByUser,
} from "@/lib/db";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_COLORS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_DOTS,
  TICKET_STATUS_LABELS,
  faDigits,
  formatDateTime,
  formatRelative,
} from "@/lib/formatting";
import {
  CloseTicketButton,
  RatingPanel,
  ReopenTicketButton,
  ReplyBox,
} from "./TicketActions";
import TicketAttachmentsView from "@/components/TicketAttachmentsView";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = (await getSession())!;

  const ticket = getTicket(id);
  if (!ticket) notFound();
  if (ticket.userId !== session.userId) {
    // Staff should use /admin/tickets — redirect them there for their own convenience
    redirect("/dashboard/tickets");
  }

  // Mark as read (user viewing their own ticket)
  markTicketReadByUser(id, session.userId);

  const messages = listMessagesForTicket(id, { includeInternal: false });
  const owner = getUser(ticket.userId);
  const relatedCourse = ticket.relatedCourseSlug
    ? getCourse(ticket.relatedCourseSlug)
    : null;

  const canReply = ticket.status !== "closed";
  const canRate = ticket.status === "solved" || ticket.status === "closed";

  return (
    <div className="max-w-[1180px] mx-auto">
      <div className="mb-5">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0e1a3d]/65 hover:text-[#1b3c8a] transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          بازگشت به تیکت‌ها
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 lg:gap-6">
        {/* Main column */}
        <div className="space-y-4 md:space-y-5 min-w-0">
          {/* Header */}
          <header className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
            <div className="flex items-start gap-3 mb-3">
              <span
                className={`shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${TICKET_STATUS_DOTS[ticket.status]}`}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-[#0e1a3d] leading-snug">
                  {ticket.subject}
                </h1>
                <div className="text-[11.5px] text-[#0e1a3d]/55 mt-1.5 font-mono" dir="ltr">
                  #{ticket.id.slice(4, 12)} · ایجاد: {formatDateTime(ticket.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-extrabold ${TICKET_STATUS_COLORS[ticket.status]}`}
              >
                {TICKET_STATUS_LABELS[ticket.status]}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold ${TICKET_PRIORITY_COLORS[ticket.priority]}`}
              >
                اولویت: {TICKET_PRIORITY_LABELS[ticket.priority]}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-[#f4f7fc] text-[#0e1a3d]/70">
                {TICKET_CATEGORY_LABELS[ticket.category]}
              </span>
            </div>
          </header>

          {/* Messages thread */}
          <section className="space-y-3">
            {messages.map((m) => {
              const isMe = m.authorRole === "user";
              const authorName = isMe
                ? owner?.name ?? "شما"
                : "تیم پشتیبانی نامدار";
              const initial = (authorName.trim() || "ن")[0];
              return (
                <article
                  key={m.id}
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[14px] ring-2 ring-white ${
                      isMe
                        ? ""
                        : "shadow-[0_8px_20px_-8px_rgba(247,207,90,0.5)]"
                    }`}
                    style={
                      isMe
                        ? {
                            background:
                              "linear-gradient(135deg, #1b3c8a, #136cb5 55%, #49bbbd)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, #fde285, #f7cf5a, #d4a62a)",
                            color: "#2d1c03",
                          }
                    }
                  >
                    {initial}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`flex-1 min-w-0 rounded-2xl p-4 md:p-5 border ${
                      isMe
                        ? "bg-[#eaf1fc] border-[#dbe7fb]"
                        : "bg-white border-[#f5e1a1]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-extrabold text-[#0e1a3d] text-[13px]">
                        {authorName}
                        {!isMe && (
                          <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#f7cf5a]/25 text-[#7a5a08] border border-[#d4a62a]/30">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3 6 6 .8-4.5 4.2 1 6.5L12 16l-5.5 3 1-6.5L3 8.8 9 8z" />
                            </svg>
                            کارشناس
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11px] text-[#0e1a3d]/50"
                        title={formatDateTime(m.createdAt)}
                      >
                        {formatRelative(m.createdAt)}
                      </div>
                    </div>
                    {m.body && (
                      <div className="text-[13.5px] md:text-[14px] text-[#0e1a3d]/85 leading-8 whitespace-pre-wrap break-words">
                        {m.body}
                      </div>
                    )}
                    <TicketAttachmentsView attachments={m.attachments} />
                  </div>
                </article>
              );
            })}
          </section>

          {/* Reply box */}
          <ReplyBox ticketId={ticket.id} disabled={!canReply} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 order-first lg:order-last">
          <div className="bg-white rounded-2xl border border-[#e5eaf5] p-5">
            <div className="font-extrabold text-[#0e1a3d] text-[13.5px] mb-3">
              جزئیات تیکت
            </div>
            <dl className="space-y-3 text-[12.5px]">
              <Row label="وضعیت">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${TICKET_STATUS_COLORS[ticket.status]}`}
                >
                  {TICKET_STATUS_LABELS[ticket.status]}
                </span>
              </Row>
              <Row label="اولویت">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold ${TICKET_PRIORITY_COLORS[ticket.priority]}`}
                >
                  {TICKET_PRIORITY_LABELS[ticket.priority]}
                </span>
              </Row>
              <Row label="دسته">{TICKET_CATEGORY_LABELS[ticket.category]}</Row>
              <Row label="تعداد پیام">{faDigits(messages.length)}</Row>
              <Row label="آخرین فعالیت">
                {formatRelative(ticket.lastMessageAt)}
              </Row>
              {relatedCourse && (
                <Row label="دورهٔ مرتبط">
                  <Link
                    href={`/courses/${relatedCourse.slug}`}
                    className="text-[#1b3c8a] font-bold hover:underline"
                  >
                    {relatedCourse.title}
                  </Link>
                </Row>
              )}
              {ticket.resolvedAt && (
                <Row label="حل شده در">
                  {formatDateTime(ticket.resolvedAt)}
                </Row>
              )}
            </dl>

            <div className="mt-4 pt-4 border-t border-[#eef2f7] flex flex-wrap gap-2">
              {ticket.status === "solved" && (
                <ReopenTicketButton ticketId={ticket.id} />
              )}
              {(ticket.status === "pending" || ticket.status === "solved") && (
                <CloseTicketButton ticketId={ticket.id} />
              )}
            </div>
          </div>

          {canRate && !ticket.rating && (
            <RatingPanel ticketId={ticket.id} />
          )}

          {ticket.rating && (
            <div className="bg-white rounded-2xl border border-[#e5eaf5] p-5">
              <div className="font-extrabold text-[#0e1a3d] text-[13.5px] mb-2">
                امتیاز شما
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={i <= (ticket.rating ?? 0) ? "#f7cf5a" : "none"}
                    stroke={i <= (ticket.rating ?? 0) ? "#d4a62a" : "#cbd5e1"}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="ms-2 text-[12px] font-extrabold text-[#0e1a3d]/70 tabular-nums">
                  {faDigits(ticket.rating ?? 0)} از ۵
                </span>
              </div>
              {ticket.ratingComment && (
                <p className="text-[12.5px] text-[#0e1a3d]/70 mt-2.5 leading-7">
                  {ticket.ratingComment}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[#0e1a3d]/55 font-bold shrink-0">{label}</dt>
      <dd className="text-[#0e1a3d] text-left">{children}</dd>
    </div>
  );
}
