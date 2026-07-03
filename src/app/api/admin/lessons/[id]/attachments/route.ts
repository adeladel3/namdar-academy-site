import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  generateId,
  getLesson,
  upsertAttachment,
} from "@/lib/db";

// Attachment URLs are rendered as `<a href>` to enrolled students. Allow
// only our own upload path or plain HTTPS — reject javascript:, data:,
// file:, etc., which would otherwise execute in the student's browser.
function isSafeFileUrl(u: string): boolean {
  const s = u.trim();
  if (s.startsWith("/uploads/") || s.startsWith("/figma/")) return true;
  try {
    const url = new URL(s);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(req);
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
  if (!isSafeFileUrl(body.fileUrl)) {
    return NextResponse.json(
      { error: "fileUrl scheme نامعتبر (فقط /uploads/ یا https://)" },
      { status: 400 }
    );
  }

  const attachment = {
    id: generateId("att"),
    lessonId,
    title: String(body.title).slice(0, 200),
    fileUrl: body.fileUrl,
    fileSize: body.fileSize ?? 0,
    mimeType: body.mimeType ?? "application/octet-stream",
    createdAt: Date.now(),
  };
  upsertAttachment(attachment);
  return NextResponse.json({ success: true, attachment });
}
