import Link from "@/components/SafeLink";
import { getSession } from "@/lib/auth";
import {
  getTicketCounts,
  getTicketViewerScope,
  getUser,
  listAllTickets,
  listMessagesForTicket,
  type TicketStatus,
} from "@/lib/db";
import { Card } from "@/components/admin/ui";
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

type StatusFilter = TicketStatus | "all" | "unread";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "unread", label: "خوانده‌نشده" },
  { key: "open", label: "باز" },
  { key: "pending", label: "منتظر کاربر" },
  { key: "solved", label: "حل شده" },
  { key: "closed", label: "بسته" },
];

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const session = (await getSession())!;
  const statusFilter = (sp.status as StatusFilter | undefined) ?? "all";
  const q = (sp.q ?? "").trim();
  const priority = sp.priority;

  const scope = getTicketViewerScope(session.userId);

  const baseList = listAllTickets({
    q: q || undefined,
    priority:
      priority === "low" || priority === "normal" || priority === "high" || priority === "urgent"
        ? priority
        : undefined,
    viewerId: session.userId,
  });

  const filtered =
    statusFilter === "all"
      ? baseList
      : statusFilter === "unread"
      ? baseList.filter((t) => t.unreadForStaff > 0)
      : baseList.filter((t) => t.status === statusFilter);

  const counts = getTicketCounts(session.userId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            مدیریت و پاسخ به درخواست‌های دانش‌پذیران
          </p>
        </div>
      </div>

      <ScopeBanner scope={scope} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <StatBox label="کل تیکت‌ها" value={counts.total} />
        <StatBox label="خوانده‌نشده" value={counts.unreadForStaff} tone="accent" />
        <StatBox label="باز" value={counts.open} tone="amber" />
        <StatBox label="منتظر کاربر" value={counts.pending} tone="sky" />
        <StatBox label="حل شده" value={counts.solved + counts.closed} tone="ok" />
      </div>

      {/* Search + filters */}
      <Card>
        <form className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-[#eef2f7]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="جست‌وجو در موضوع تیکت‌ها..."
            className="flex-1 h-11 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13.5px] text-[#010514] px-4 focus:outline-none focus:border-[#136cb5] focus:bg-white transition"
          />
          <select
            name="priority"
            defaultValue={priority ?? ""}
            className="h-11 rounded-2xl bg-[#f4f7fc] border border-[#e3e9f4] text-[13px] text-[#010514] px-3 focus:outline-none focus:border-[#136cb5] focus:bg-white transition"
          >
            <option value="">همهٔ اولویت‌ها</option>
            <option value="urgent">فوری</option>
            <option value="high">زیاد</option>
            <option value="normal">معمولی</option>
            <option value="low">کم</option>
          </select>
          <input type="hidden" name="status" value={statusFilter} />
          <button
            type="submit"
            className="h-11 px-5 rounded-full bg-[#1b3c8a] text-white text-[13px] font-bold hover:opacity-90 transition"
          >
            اعمال فیلتر
          </button>
        </form>

        {/* Status tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-[#eef2f7] overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            const params = new URLSearchParams();
            if (tab.key !== "all") params.set("status", tab.key);
            if (q) params.set("q", q);
            if (priority) params.set("priority", priority);
            const href = params.toString()
              ? `/admin/tickets?${params.toString()}`
              : "/admin/tickets";
            const tabCount =
              tab.key === "all"
                ? counts.total
                : tab.key === "unread"
                ? counts.unreadForStaff
                : counts[tab.key as keyof typeof counts];
            return (
              <Link
                key={tab.key}
                href={href}
                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-bold transition ${
                  active
                    ? "bg-[#1b3c8a] text-white"
                    : "bg-[#f4f7fc] text-[#010514]/70 hover:bg-[#eef2f7]"
                }`}
              >
                {tab.label}
                <span
                  className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-black flex items-center justify-center tabular-nums ${
                    active
                      ? "bg-white/25 text-white"
                      : tab.key === "unread" && tabCount > 0
                      ? "bg-rose-500 text-white"
                      : "bg-[#e3e9f4] text-[#010514]/60"
                  }`}
                >
                  {faDigits(tabCount ?? 0)}
                </span>
              </Link>
            );
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#010514]/55 text-sm">
            تیکتی با این فیلتر پیدا نشد.
          </div>
        ) : (
          <div className="divide-y divide-[#eef2f7]">
            {filtered.map((t) => {
              const user = getUser(t.userId);
              const msgCount = listMessagesForTicket(t.id, { includeInternal: true }).length;
              const unread = t.unreadForStaff > 0;
              return (
                <Link
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
                  className={`block px-5 py-4 hover:bg-[#f9fbfe] transition ${
                    unread ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status dot */}
                    <span
                      className={`shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full ${TICKET_STATUS_DOTS[t.status]}`}
                      title={TICKET_STATUS_LABELS[t.status]}
                    />

                    {/* User avatar */}
                    <div
                      className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-[12px] ring-2 ring-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #1b3c8a, #136cb5 55%, #49bbbd)",
                      }}
                    >
                      {(user?.name?.trim() || "ن")[0]}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-extrabold text-[#010514] text-[13px] truncate">
                              {user?.name ?? "—"}
                            </span>
                            <span className="text-[11px] text-[#010514]/45 font-mono truncate" dir="ltr">
                              {user?.phone}
                            </span>
                          </div>
                          <h3
                            className={`text-[14px] leading-snug line-clamp-1 ${
                              unread ? "font-black text-[#010514]" : "font-bold text-[#010514]/85"
                            }`}
                          >
                            {t.subject}
                          </h3>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {unread && (
                            <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[10.5px] font-black flex items-center justify-center tabular-nums">
                              {faDigits(t.unreadForStaff)}
                            </span>
                          )}
                          <span className="text-[10.5px] text-[#010514]/50 whitespace-nowrap">
                            {formatRelative(t.lastMessageAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${TICKET_STATUS_COLORS[t.status]}`}
                        >
                          {TICKET_STATUS_LABELS[t.status]}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TICKET_PRIORITY_COLORS[t.priority]}`}
                        >
                          {TICKET_PRIORITY_LABELS[t.priority]}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f7fc] text-[#010514]/60">
                          {TICKET_CATEGORY_LABELS[t.category]}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f7fc] text-[#010514]/60">
                          {faDigits(msgCount)} پیام
                        </span>
                        <span className="text-[10.5px] text-[#010514]/40 font-mono mr-auto" dir="ltr">
                          #{t.id.slice(4, 12)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function ScopeBanner({
  scope,
}: {
  scope: ReturnType<typeof getTicketViewerScope>;
}) {
  if (scope.unrestricted) {
    return (
      <div className="rounded-2xl px-4 py-3 text-[12.5px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
        دسترسی کامل — همهٔ تیکت‌های سیستم را می‌بینید.
      </div>
    );
  }
  const parts: string[] = [];
  if (scope.categories.length > 0) {
    const labels: Record<string, string> = {
      technical: "فنی",
      billing: "مالی",
      course: "دوره‌ها",
      account: "حساب کاربری",
      other: "سایر",
    };
    parts.push(
      "دسته‌بندی: " + scope.categories.map((c) => labels[c] ?? c).join("، ")
    );
  }
  if (scope.courseSlugs.length > 0) {
    parts.push(`${scope.courseSlugs.length} دورهٔ تحت مدیریت`);
  }
  return (
    <div className="rounded-2xl px-4 py-3 text-[12.5px] font-bold bg-amber-50 border border-amber-200 text-amber-900 flex flex-wrap items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      دسترسی محدود — فقط تیکت‌های مربوط به شما نمایش داده می‌شود
      {parts.length > 0 && (
        <span className="text-amber-700/85 font-normal">({parts.join(" · ")})</span>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "accent" | "ok" | "amber" | "sky";
}) {
  const toneCx =
    tone === "accent"
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : tone === "ok"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : tone === "sky"
      ? "bg-sky-50 text-sky-800 border-sky-200"
      : "bg-white text-[#010514] border-[#e5eaf5]";
  return (
    <div className={`rounded-2xl border p-4 ${toneCx}`}>
      <div className="text-[11px] font-bold tracking-wide mb-1 opacity-80">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums">{faDigits(value)}</div>
    </div>
  );
}
