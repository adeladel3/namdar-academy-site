import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { reorderLessons } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: { order?: { id: string; order: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!Array.isArray(body.order))
    return NextResponse.json({ error: "order must be array" }, { status: 400 });
  const map: Record<string, number> = {};
  for (const o of body.order) {
    if (o && typeof o.id === "string" && typeof o.order === "number") {
      map[o.id] = o.order;
    }
  }
  reorderLessons(id, map);
  return NextResponse.json({ success: true });
}
