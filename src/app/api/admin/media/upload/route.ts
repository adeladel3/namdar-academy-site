import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { generateId, upsertMedia } from "@/lib/db";
import { detectKind, isAllowedMime, saveFile } from "@/lib/media";

export const runtime = "nodejs";

const MAX_SIZE = 200 * 1024 * 1024; // 200 MB cap

export async function POST(req: Request) {
  const guard = await requireStaff(req);
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

  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!isAllowedMime(mime)) {
    return NextResponse.json(
      {
        error: "نوع فایل مجاز نیست.",
      },
      { status: 415 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let saved;
  try {
    saved = saveFile(buffer, mime, file.name);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "ذخیره فایل ناموفق" },
      { status: 400 }
    );
  }

  const kind = detectKind(mime);

  // Keep the original filename only for display (listed in admin library);
  // trim it aggressively so it can't hide a payload in the UI itself.
  const safeDisplayName = (file.name || "upload")
    .replace(/[\u0000-\u001f\u007f<>"']/g, "")
    .slice(0, 200);

  const asset = {
    id: generateId("m"),
    kind,
    url: saved.url,
    fileName: safeDisplayName,
    fileSize: file.size,
    mimeType: mime,
    uploadedBy: guard.session.userId,
    createdAt: Date.now(),
  };
  upsertMedia(asset);
  return NextResponse.json({ success: true, ...asset });
}
