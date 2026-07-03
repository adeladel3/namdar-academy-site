import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  deleteWallOfFameItem,
  getWallOfFameItem,
  upsertWallOfFameItem,
} from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const w = getWallOfFameItem(id);
  if (!w) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Partial<{
    kind: "image" | "video";
    url: string;
    posterUrl: string;
    caption: string;
    studentName: string;
    order: number;
    published: boolean;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  upsertWallOfFameItem({
    ...w,
    kind: body.kind === "image" || body.kind === "video" ? body.kind : w.kind,
    url: body.url?.trim() || w.url,
    posterUrl:
      body.posterUrl === undefined
        ? w.posterUrl
        : body.posterUrl?.trim() || undefined,
    caption:
      body.caption === undefined
        ? w.caption
        : body.caption?.trim() || undefined,
    studentName:
      body.studentName === undefined
        ? w.studentName
        : body.studentName?.trim() || undefined,
    order: typeof body.order === "number" ? body.order : w.order,
    published:
      typeof body.published === "boolean" ? body.published : w.published,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  deleteWallOfFameItem(id);
  return NextResponse.json({ success: true });
}
