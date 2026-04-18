import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  generateId,
  getLesson,
  upsertAttachment,
} from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id: lessonId } = await params;
  if (!getLesson(lessonId))
    return NextResponse.json({ error: "lesson not found" }, { status: 404 });

  let body: {
    title?: string;
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.title || !body.fileUrl)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const attachment = {
    id: generateId("att"),
    lessonId,
    title: body.title,
    fileUrl: body.fileUrl,
    fileSize: body.fileSize ?? 0,
    mimeType: body.mimeType ?? "application/octet-stream",
    createdAt: Date.now(),
  };
  upsertAttachment(attachment);
  return NextResponse.json({ success: true, attachment });
}
