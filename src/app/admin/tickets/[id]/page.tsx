import Link from "@/components/SafeLink";
import { notFound } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import {
  canViewerSeeTicket,
  getCourse,
  getOrder,
  getTicket,
  getUser,
  listMessagesForTicket,
  listUsers,
  markTicketReadByStaff,
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
  formatToman,
} from "@/lib/formatting";
import {
  AdminReplyBox,
  AssigneeSelect,
  PrioritySelect,
  StatusSelect,
} from "./AdminTicketControls";
import TicketAttachmentsView from "@/components/TicketAttachmentsView";

export const dynamic = "force-dynamic";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !isStaff(session)) {
    notFound();
  }

  const ticket = getTicket(id);
  if (!ticket) notFound();

  // Scope check: a category/course-scoped agent who knows a ticket ID can't
  // peek at someone else's lane.
  if (!canViewerSeeTicket(session.userId, ticket)) {
    notFound();
  }

  // Mark as read by staff
  markTicketReadByStaff(id);

  const messages = listMessagesForTicket(id, { includeInternal: true });
  const user = getUser(ticket.userId);
  const relatedCourse = ticket.relatedCourseSlug
    ? getCourse(ticket.relatedCourseSlug)
    : null;
  const relatedOrder = ticket.relatedOrderId
    ? getOrder(ticket.relatedOrderId)
    : null;
  const assignee = ticket.assigneeId ? getUser(ticket.assigneeId) : null;

  const staff = [
    ...listUsers({ role: "admin" }),
    ...listUsers({ role: "support" }),
  ].map((u) => ({ id: u.id, name: u.name }));

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#010514]/65 hover:text-[#1b3c8a] transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          بازگشت به inbox
        </Link>
      </div>

      <div className="grid xl:grid-cols-[1fr_340px] gap-5">
        {/* Main column */}
        <div className="space-y-4 min-w-0">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-[#e5eaf5] p-5 md:p-6">
            <div className="flex items-start gap-3 mb-3">
              <span
                className={`shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${TICKET_STATUS_DOTS[ticket.status]}`}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-[#010514] leading-snug">
                  {ticket.subject}
                </h1>
                <div className="text-[11.5px] text-[#010514]/55 mt-1.5 font-mono" dir="ltr">
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-[#f4f7fc] text-[#010514]/70">
                {TICKET_CATEGORY_LABELS[ticket.category]}
              </span>
              {assignee && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1" />
                  </svg>
                  {assignee.name}
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <section className="space-y-3">
            {messages.map((m) => {
              const isUser = m.authorRole === "user";
              const author = isUser ? user : getUser(m.authorId);
              const authorName = author?.name ?? (isUser ? "کاربر" : "پشتیبانی");
              const initial = (authorName.trim() || "ن")[0];

              if (m.internal) {
                return (
                  <article
                    key={m.id}
                    className="rounded-2xl p-4 md:p-5 bg-amber-50 border border-amber-200 border-dashed"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="inline-flex items-center gap-2 text-[12px] font-extrabold text-amber-800">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                        یادداشت داخلی — {authorName}
                      </div>
                      <div
                        className="text-[11px] text-amber-700/70"
                        title={formatDateTime(m.createdAt)}
                      >
                        {formatRelative(m.createdAt)}
                      </div>
                    </div>
                    {m.body && (
                      <div className="text-[13.5px] text-amber-900/90 leading-8 whitespace-pre-wrap break-words">
                        {m.body}
                      </div>
                    )}
                    <TicketAttachmentsView attachments={m.attachments} />
                  </article>
                );
              }

              return (
                <article
                  key={m.id}
                  className={`flex gap-3 ${isUser ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[14px] ring-2 ring-white"
                    style={
                      isUser
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
                  <div
                    className={`flex-1 min-w-0 rounded-2xl p-4 md:p-5 border ${
                      isUser
                        ? "bg-white border-[#e5eaf5]"
                        : "bg-[#f7fafd] border-[#dbe7fb]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-extrabold text-[#010514] text-[13px]">
                        {authorName}
                        {isUser ? (
                          <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf1fc] text-[#1b3c8a]">
                            کاربر
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#f7cf5a]/25 text-[#7a5a08] border border-[#d4a62a]/30">
                            کارشناس
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11px] text-[#010514]/50"
                        title={formatDateTime(m.createdAt)}
                      >
                        {formatRelative(m.createdAt)}
                      </div>
                    </div>
                    {m.body && (
                      <div className="text-[13.5px] md:text-[14px] text-[#010514]/85 leading-8 whitespace-pre-wrap break-words">
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
          <AdminReplyBox ticketId={ticket.id} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 order-first xl:order-last">
          {/* User info */}
          <div className="bg-white rounded-2xl border border-[#e5eaf5] p-5">
            <div className="font-extrabold text-[#010514] text-[13.5px] mb-3">
              کاربر
            </div>
            {user ? (
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ring-2 ring-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #1b3c8a, #136cb5 55%, #49bbbd)",
                  }}
                >
                  {(user.name?.trim() || "ن")[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-[#010514] text-[14px] truncate">
                    {user.name}
                  </div>
                  <div className="text-[11.5px] text-[#010514]/55 font-mono" dir="ltr">
                    {user.phone}
                  </div>
                  {user.email && (
                    <div className="text-[11.5px] text-[#010514]/55 truncate" dir="ltr">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[12.5px] text-[#010514]/55">
                کاربر در پایگاه داده یافت نشد
              </div>
            )}
            {user && (
              <Link
                href={`/admin/users?q=${encodeURIComponent(user.phone)}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1b3c8a] hover:underline"
              >
                مشاهدهٔ پروفایل
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-[#e5eaf5] p-5 space-y-4">
            <div className="font-extrabold text-[#010514] text-[13.5px]">
              مدیریت تیکت
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-[#010514]/70 mb-1.5">
                وضعیت
              </label>
              <StatusSelect ticketId={ticket.id} current={ticket.status} />
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-[#010514]/70 mb-1.5">
                اولویت
              </label>
              <PrioritySelect ticketId={ticket.id} current={ticket.priority} />
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-[#010514]/70 mb-1.5">
                تخصیص به
              </label>
              <AssigneeSelect
                ticketId={ticket.id}
                current={ticket.assigneeId}
                staff={staff}
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-[#e5eaf5] p-5">
            <div className="font-extrabold text-[#010514] text-[13.5px] mb-3">
              جزئیات
            </div>
            <dl className="space-y-2.5 text-[12px]">
              <Row label="دسته">{TICKET_CATEGORY_LABELS[ticket.category]}</Row>
              <Row label="تعداد پیام">{faDigits(messages.length)}</Row>
              <Row label="ایجاد">{formatDateTime(ticket.createdAt)}</Row>
              <Row label="آخرین فعالیت">{formatRelative(ticket.lastMessageAt)}</Row>
              {relatedCourse && (
                <Row label="دورهٔ مرتبط">
                  <Link
                    href={`/admin/courses/${relatedCourse.slug}`}
                    className="text-[#1b3c8a] font-bold hover:underline truncate inline-block max-w-[180px] align-bottom"
                  >
                    {relatedCourse.title}
                  </Link>
                </Row>
              )}
              {relatedOrder && (
                <Row label="سفارش مرتبط">
                  <Link
                    href="/admin/orders"
                    className="text-[#1b3c8a] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    {formatToman(relatedOrder.finalAmount)}
                  </Link>
                </Row>
              )}
              {ticket.resolvedAt && (
                <Row label="حل شده">{formatDateTime(ticket.resolvedAt)}</Row>
              )}
              {ticket.rating && (
                <Row label="امتیاز کاربر">
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill={i <= (ticket.rating ?? 0) ? "#f7cf5a" : "none"}
                        stroke={i <= (ticket.rating ?? 0) ? "#d4a62a" : "#cbd5e1"}
                        strokeWidth="1.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </span>
                </Row>
              )}
            </dl>
            {ticket.ratingComment && (
              <div className="mt-3 pt-3 border-t border-[#eef2f7] text-[12px] text-[#010514]/75 leading-7">
                «{ticket.ratingComment}»
              </div>
            )}
          </div>
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
      <dt className="text-[#010514]/55 font-bold shrink-0">{label}</dt>
      <dd className="text-[#010514] text-left">{children}</dd>
    </div>
  );
}
