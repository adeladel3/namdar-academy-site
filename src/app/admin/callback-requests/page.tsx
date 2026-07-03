import { listCallbackRequests, listCourses } from "@/lib/db";
import { Card, CardHeader } from "@/components/admin/ui";
import { faDigits } from "@/lib/formatting";
import CallbackRequestsTable from "./CallbackRequestsTable";

export const dynamic = "force-dynamic";

export default function CallbackRequestsPage() {
  const all = listCallbackRequests();
  const counts = {
    total: all.length,
    open: all.filter((r) => r.status === "new").length,
    contacted: all.filter((r) => r.status === "contacted").length,
    archived: all.filter((r) => r.status === "archived").length,
  };
  const coursesBySlug = Object.fromEntries(
    listCourses().map((c) => [c.slug, c.title])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
            درخواست‌های تماس
          </h1>
          <p className="text-sm text-[#010514]/55 mt-1">
            شماره‌های ثبت‌شده از باکس‌های مشاوره در سایت — برای تماس و پیگیری
          </p>
        </div>
        <a
          href="/api/admin/callback-requests/export"
          download
          className="px-4 py-2 rounded-full bg-[#1b3c8a] text-white text-sm font-bold hover:opacity-90 transition"
        >
          دانلود CSV
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="کل درخواست‌ها" value={counts.total} />
        <StatBox label="در انتظار تماس" value={counts.open} tone="accent" />
        <StatBox label="تماس گرفته‌شده" value={counts.contacted} tone="ok" />
        <StatBox label="بایگانی" value={counts.archived} tone="muted" />
      </div>

      <Card>
        <CardHeader
          title="لیست درخواست‌ها"
          subtitle="جدیدترین درخواست‌ها در ابتدای لیست"
        />
        {all.length === 0 ? (
          <div className="py-14 text-center text-[#010514]/55 text-sm">
            هنوز درخواست تماسی ثبت نشده است.
          </div>
        ) : (
          <CallbackRequestsTable initial={all} coursesBySlug={coursesBySlug} />
        )}
      </Card>
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
  tone?: "default" | "accent" | "ok" | "muted";
}) {
  const toneCx =
    tone === "accent"
      ? "bg-[#fff7e0] text-[#8a5f0e] border-[#f5d98a]"
      : tone === "ok"
      ? "bg-[#e6f7ec] text-[#0f6b35] border-[#bfe7cc]"
      : tone === "muted"
      ? "bg-[#f4f5f7] text-[#010514]/65 border-[#e5e7eb]"
      : "bg-white text-[#010514] border-[#e5eaf5]";
  return (
    <div className={`rounded-3xl border p-5 ${toneCx}`}>
      <div className="text-[11px] font-bold tracking-wide mb-1 opacity-75">
        {label}
      </div>
      <div className="text-2xl font-bold">{faDigits(value)}</div>
    </div>
  );
}
