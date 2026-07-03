import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * مسیر پوشه‌ی آپلود — مقدارش با ترتیب زیر تعیین می‌شود:
 *   1. اگر env var `NAMDAR_UPLOAD_DIR` ست شده باشد، همان (برای دیپلوی‌هایی
 *      که می‌خواهند آپلودها بیرون از پوشه‌ی برنامه ذخیره شوند).
 *   2. اگر `<cwd>/public/uploads/` موجود است.
 *   3. در حالت `output: "standalone"`، Next.js پوشه‌ی public را در مسیر
 *      `<cwd>/public/public/uploads/` کپی می‌کند؛ اگر این مسیر وجود داشت،
 *      همان استفاده می‌شود تا فایل‌های موجود broken-image نشوند.
 *   4. در غیر این صورت همان `<cwd>/public/uploads/` ساخته می‌شود.
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

// MIME allow-list. Anything outside this is rejected at the API boundary.
// Rationale: uploaded files are served same-origin from /uploads/*. text/html
// and similar are still BLOCKED — they would run JS with our cookies in scope.
// SVGs are allowed but served via the nosniff header + we strip <script>
// before writing. Executables (.exe/.msi/...) are allowed but served with
// Content-Disposition: attachment (configured in next.config.ts) so the
// browser downloads them instead of trying to render them inline.
export const ALLOWED_MIME_TYPES: readonly string[] = [
  // تصویر
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  // iPhone Safari عکس‌ها را به‌صورت پیش‌فرض HEIC می‌فرستد و برخی گالری‌های
  // اندروید AVIF می‌فرستند. بدون این موارد ادمین عکسی که از موبایل گرفته
  // را آپلود می‌کند و پیام «نوع فایل مجاز نیست» می‌گیرد در حالی که فایل
  // یک عکس عادی است.
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/avif",
  // ویدیو
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  // صوت
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  // سند
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/rtf",
  "text/plain",
  "text/csv",
  // آرشیو
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  // اجرایی موبایل/مک (با Content-Disposition: attachment سرو می‌شوند)
  // فایل‌های exe/msi ویندوز عمداً اجازه داده نمی‌شوند تا سایت تبدیل به
  // میزبان بدافزار نشود — اگر روزی نیاز شد، application/x-msdownload و
  // application/x-msi و application/vnd.microsoft.portable-executable را
  // اینجا اضافه کن.
  "application/vnd.android.package-archive",
  "application/x-apple-diskimage",
  // عمومی (نوع نامشخص مرورگر هم پذیرفته می‌شود)
  "application/octet-stream",
];

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/heic-sequence": "heic",
  "image/heif-sequence": "heif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/webm": "weba",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/rtf": "rtf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/x-rar-compressed": "rar",
  "application/vnd.rar": "rar",
  "application/x-7z-compressed": "7z",
  "application/x-tar": "tar",
  "application/gzip": "gz",
  "application/vnd.android.package-archive": "apk",
  "application/x-apple-diskimage": "dmg",
  "application/octet-stream": "bin",
};

export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function isAllowedMime(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Strip executable content from SVG uploads. SVG is XML that can contain
 * <script> and event handlers; when rendered via <img> or <object> those
 * can execute and steal the admin's session.
 */
function sanitizeSvg(buf: Buffer): Buffer {
  const text = buf.toString("utf8");
  const cleaned = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"(?:[^"\\]|\\.)*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'(?:[^'\\]|\\.)*'/gi, "")
    .replace(/\sxlink:href\s*=\s*"javascript:[^"]*"/gi, "")
    .replace(/\shref\s*=\s*"javascript:[^"]*"/gi, "");
  return Buffer.from(cleaned, "utf8");
}

/**
 * Save an uploaded file. MIME must be pre-validated via `isAllowedMime` at
 * the API boundary. File name is generated server-side (random UUID-like
 * token + known-safe extension); the user-supplied name is discarded for
 * disk storage to close path-traversal / double-extension shell.svg.php
 * style attacks.
 */
export function saveFile(
  buffer: Buffer,
  mimeType: string,
  _originalName?: string
): { url: string; path: string } {
  ensureUploadDir();
  const lower = mimeType.toLowerCase();
  if (!isAllowedMime(lower)) {
    throw new Error(`MIME type not allowed: ${lower}`);
  }
  const ext = EXT_BY_MIME[lower] ?? "bin";
  const token = crypto.randomBytes(12).toString("hex");
  const finalName = `${Date.now().toString(36)}-${token}.${ext}`;
  const full = path.join(UPLOAD_DIR, finalName);

  // Extra safety: guarantee the resolved path stays inside UPLOAD_DIR even
  // though `finalName` is fully server-controlled.
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep)) {
    throw new Error("path traversal detected");
  }

  const body = lower === "image/svg+xml" ? sanitizeSvg(buffer) : buffer;
  fs.writeFileSync(resolved, body);
  return { url: `/uploads/${finalName}`, path: resolved };
}

export function detectKind(mimeType: string): "image" | "video" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

// `resolveUploadUrl` به `src/lib/upload-url.ts` منتقل شد چون کامپوننت‌های
// کلاینت آن را وارد می‌کنند و این فایل به `node:fs` وابسته است.
export { resolveUploadUrl } from "./upload-url";
