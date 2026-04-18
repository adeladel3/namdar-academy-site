import { getUser, listAudit } from "@/lib/db";
import AuditLogTable, { type AuditRow } from "./AuditLogTable";

export const dynamic = "force-dynamic";

export default function AuditLogPage() {
  const entries = listAudit({ limit: 500 });
  const rows: AuditRow[] = entries.map((e) => {
    const u = getUser(e.actorId);
    return {
      id: e.id,
      actorName: u?.name ?? e.actorId.slice(0, 8),
      actorId: e.actorId,
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId,
      timestamp: e.timestamp,
      metadata: e.metadata,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          لاگ عملیات ادمین
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          تاریخچه تغییرات حساس — ویرایش، حذف، استرداد، تغییر نقش و مانند آن
        </p>
      </div>
      <AuditLogTable rows={rows} />
    </div>
  );
}
