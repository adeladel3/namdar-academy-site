import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * سرو فایل‌های آپلودی از مسیر کوتاه `/m/<name>`.
 *
 * چرا یک مسیر دیگر هم لازم بود:
 *   روی سرور پروداکشن، nginx مسیرهای `/uploads/` و `/api/files/` را از یک
 *   پوشه‌ی فیزیکی (alias / root) سرو می‌کند و فایل‌های جدیدی که Next در
 *   runtime می‌نویسد را با ۴۰۴ پاسخ می‌دهد. این route روی یک namespace
 *   ساده (`/m/`) سوار است که nginx هیچ قاعده‌ای برایش ندارد، پس درخواست
 *   مستقیم به Next می‌رسد و فایل از روی دیسک خوانده می‌شود.
 *
 * امنیت دقیقاً مشابه `/api/files/[name]/route.ts` است: path-traversal با
 * `path.basename` کور می‌شود و مسیر نهایی resolve و بررسی می‌شود که داخل
 * UPLOAD_DIR بماند.
 */

function resolveUploadDir(): string {
  const fromEnv = process.env.NAMDAR_UPLOAD_DIR?.trim();
  if (fromEnv) return fromEnv;
  const cwd = process.cwd();
  const primary = path.join(cwd, "public", "uploads");
  if (fs.existsSync(primary)) return primary;
  const standaloneNested = path.join(cwd, "public", "public", "uploads");
  if (fs.existsSync(standaloneNested)) return standaloneNested;
  return primary;
}

const UPLOAD_DIR = resolveUploadDir();

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

function detectMime(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> }
) {
  const { name: raw } = await ctx.params;

  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();
  const safe = path.basename(decoded);

  if (!safe || safe.startsWith(".") || safe === "/" || safe === "\\") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const full = path.join(UPLOAD_DIR, safe);
  const resolved = path.resolve(full);

  if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!fs.existsSync(resolved)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buf = fs.readFileSync(resolved);
  const mime = detectMime(safe);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(stat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(mime === "application/pdf" || mime.startsWith("image/") || mime.startsWith("video/")
        ? { "Content-Disposition": `inline; filename="${encodeURIComponent(safe)}"` }
        : { "Content-Disposition": `attachment; filename="${encodeURIComponent(safe)}"` }),
    },
  });
}
