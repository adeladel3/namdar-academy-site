import fs from "node:fs";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function saveFile(buffer: Buffer, fileName: string) {
  ensureUploadDir();
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const finalName = `${stamp}-${safe}`;
  const full = path.join(UPLOAD_DIR, finalName);
  fs.writeFileSync(full, buffer);
  return { url: `/uploads/${finalName}`, path: full };
}

export function detectKind(mimeType: string): "image" | "video" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}
