import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { generateId, upsertMedia } from "@/lib/db";
import { detectKind, saveFile } from "@/lib/media";

export const runtime = "nodejs";

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB cap

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `حجم فایل بیش از حد مجاز (${MAX_SIZE / 1024 / 1024} MB)` },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = saveFile(buffer, file.name);

  const mime = file.type || "application/octet-stream";
  const kind = detectKind(mime);

  const asset = {
    id: generateId("m"),
    kind,
    url: saved.url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: mime,
    uploadedBy: guard.session.userId,
    createdAt: Date.now(),
  };
  upsertMedia(asset);
  return NextResponse.json({ success: true, ...asset });
}
