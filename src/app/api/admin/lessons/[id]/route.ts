import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { deleteLesson, getLesson, upsertLesson } from "@/lib/db";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const l = getLesson(id);
  if (!l) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: {
    title?: string;
    videoUrl?: string;
    videoDurationSec?: number;
    freePreview?: boolean;
    content?: string;
    order?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  upsertLesson({
    ...l,
    title:
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : l.title,
    videoUrl:
      body.videoUrl === undefined
        ? l.videoUrl
        : body.videoUrl
        ? body.videoUrl.trim()
        : undefined,
    videoDurationSec:
      typeof body.videoDurationSec === "number"
        ? body.videoDurationSec
        : l.videoDurationSec,
    freePreview:
      typeof body.freePreview === "boolean" ? body.freePreview : l.freePreview,
    content:
      body.content === undefined
        ? l.content
        : body.content
        ? sanitizeRichHtml(body.content)
        : undefined,
    order: typeof body.order === "number" ? body.order : l.order,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(req);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  if (!getLesson(id))
    return NextResponse.json({ error: "not found" }, { status: 404 });
  deleteLesson(id);
  return NextResponse.json({ success: true });
}
