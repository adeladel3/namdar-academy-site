import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { generateId, listTags, upsertTag } from "@/lib/db";

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  return NextResponse.json({ items: listTags() });
}

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "نام الزامی است" }, { status: 400 });
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-|-$/g, "");
  const existing = listTags().find((t) => t.name === name);
  if (existing) return NextResponse.json({ success: true, id: existing.id });
  const id = generateId("tag");
  upsertTag({ id, name, slug });
  return NextResponse.json({ success: true, id });
}
