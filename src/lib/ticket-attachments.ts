import type { TicketAttachment } from "@/lib/db";

const MAX_ATTACHMENTS = 6;
const ALLOWED_MIME: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

/**
 * Trust nothing: only keep entries that match the shape we produced from
 * /api/tickets/upload. The url must live under /uploads/ (same-origin path
 * we just wrote to disk) so a client can't sneak in an arbitrary external
 * link via the attachments array.
 */
export function sanitizeAttachments(raw: unknown): TicketAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: TicketAttachment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const url = typeof r.url === "string" ? r.url : "";
    const fileName = typeof r.fileName === "string" ? r.fileName.slice(0, 200) : "";
    const fileSize = typeof r.fileSize === "number" ? r.fileSize : 0;
    const mimeType = typeof r.mimeType === "string" ? r.mimeType.toLowerCase() : "";
    if (!url.startsWith("/uploads/")) continue;
    if (!ALLOWED_MIME.includes(mimeType)) continue;
    if (fileSize < 0 || fileSize > 20 * 1024 * 1024) continue;
    out.push({ url, fileName: fileName || "file", fileSize, mimeType });
    if (out.length >= MAX_ATTACHMENTS) break;
  }
  return out;
}
