import type { TicketAttachment } from "@/lib/db";
import { resolveUploadUrl } from "@/lib/upload-url";
import { UploadImg } from "./UploadImg";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function TicketAttachmentsView({
  attachments,
}: {
  attachments: TicketAttachment[] | undefined;
}) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-current/10 flex flex-wrap gap-2">
      {attachments.map((a, i) => {
        const href = resolveUploadUrl(a.url);
        const isImg = a.mimeType.startsWith("image/");
        if (isImg) {
          return (
            <a
              key={`${a.url}-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-28 h-28 rounded-xl overflow-hidden bg-[#f4f7fc] border border-[#e5eaf5] hover:border-[#bcd9f4] transition relative group"
              title={a.fileName}
            >
              <UploadImg
                url={a.url}
                alt={a.fileName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0e1a3d]/0 group-hover:bg-[#0e1a3d]/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </a>
          );
        }
        return (
          <a
            key={`${a.url}-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download={a.fileName}
            className="inline-flex items-center gap-2 pr-3 pl-2 py-2 rounded-2xl bg-white border border-[#e5eaf5] hover:border-[#bcd9f4] hover:bg-[#f7fafd] transition text-[12.5px] font-bold text-[#0e1a3d]"
            title={a.fileName}
          >
            <span className="shrink-0 w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block truncate max-w-[180px]">{a.fileName}</span>
              <span className="block text-[10.5px] text-[#0e1a3d]/55 font-mono" dir="ltr">
                {formatSize(a.fileSize)}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
