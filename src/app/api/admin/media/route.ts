import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { listMedia, type MediaAsset } from "@/lib/db";

export async function GET(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as MediaAsset["kind"] | null;
  const q = url.searchParams.get("q") ?? undefined;
  const items = listMedia({
    kind: kind && ["image", "video", "file"].includes(kind) ? kind : undefined,
    q,
  });
  return NextResponse.json({ items });
}
