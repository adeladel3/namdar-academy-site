import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  generateId,
  getCourse,
  listChapters,
  upsertChapter,
} from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  if (!getCourse(slug))
    return NextResponse.json({ error: "course not found" }, { status: 404 });

  let body: { title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const title = body.title?.trim();
  if (!title)
    return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });

  const nextOrder = listChapters(slug).length;
  const id = generateId("ch");
  upsertChapter({ id, courseSlug: slug, title, order: nextOrder });
  return NextResponse.json({ success: true, id });
}
