import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { generateId, upsertWallOfFameItem } from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let body: {
    kind?: "image" | "video";
    url?: string;
    posterUrl?: string;
    caption?: string;
    studentName?: string;
    order?: number;
    published?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const kind = body.kind === "video" ? "video" : "image";
  const url = body.url?.trim();
  if (!url)
    return NextResponse.json(
      { error: "آدرس فایل الزامی است" },
      { status: 400 }
    );

  const id = generateId("w");
  upsertWallOfFameItem({
    id,
    kind,
    url,
    posterUrl: body.posterUrl?.trim() || undefined,
    caption: body.caption?.trim() || undefined,
    studentName: body.studentName?.trim() || undefined,
    order: body.order ?? 0,
    published: body.published !== false,
    createdAt: Date.now(),
  });
  return NextResponse.json({ success: true, id });
}
