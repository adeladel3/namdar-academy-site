import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { listCallbackRequests } from "@/lib/db";
import { csvCell, csvRow } from "@/lib/csv";

export async function GET(req: Request) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;

  const rows = listCallbackRequests();
  const header = [
    "id",
    "phone",
    "name",
    "topic",
    "preferred_time",
    "note",
    "source",
    "status",
    "created_at",
    "contacted_at",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      csvRow([
        r.id,
        r.phone,
        r.name ?? "",
        r.topic ?? "",
        r.preferredTime ?? "",
        r.note ?? "",
        r.source ?? "",
        r.status,
        new Date(r.createdAt).toISOString(),
        r.contactedAt ? new Date(r.contactedAt).toISOString() : "",
      ])
    );
  }
  const body = "\uFEFF" + lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="callback-requests-${Date.now()}.csv"`,
    },
  });
}
