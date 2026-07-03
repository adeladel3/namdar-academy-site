import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireStaff } from "@/lib/admin-guard";
import { listMedia } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ابزار تشخیص آپلود رسانه. فقط برای ادمین.
 *
 * می‌گوید فولدر آپلود کجاست، چه فایل‌هایی واقعاً روی دیسک سرور هستند،
 * و کدام رکوردهای دیتابیس فایل فیزیکی متناظرشان گم شده.
 */
export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const cwd = process.cwd();

  let dirExists = false;
  let dirIsWritable = false;
  let diskFiles: Array<{ name: string; size: number; mtime: number }> = [];
  let dirError: string | null = null;

  try {
    const stat = fs.statSync(uploadDir);
    dirExists = stat.isDirectory();
  } catch (err) {
    dirError = (err as Error).message;
  }

  if (dirExists) {
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      dirIsWritable = true;
    } catch {
      dirIsWritable = false;
    }
    try {
      diskFiles = fs
        .readdirSync(uploadDir)
        .map((name) => {
          try {
            const st = fs.statSync(path.join(uploadDir, name));
            return { name, size: st.size, mtime: st.mtimeMs };
          } catch {
            return { name, size: -1, mtime: 0 };
          }
        })
        .sort((a, b) => b.mtime - a.mtime);
    } catch (err) {
      dirError = (err as Error).message;
    }
  }

  const diskSet = new Set(diskFiles.map((f) => f.name));
  const dbItems = listMedia();
  const dbCheck = dbItems.map((m) => {
    const fileName = m.url.startsWith("/uploads/")
      ? m.url.slice("/uploads/".length)
      : m.url;
    return {
      id: m.id,
      url: m.url,
      displayName: m.fileName,
      mimeType: m.mimeType,
      sizeBytes: m.fileSize,
      onDisk: diskSet.has(fileName),
    };
  });

  const missing = dbCheck.filter((x) => !x.onDisk);

  return NextResponse.json(
    {
      cwd,
      uploadDir,
      dirExists,
      dirIsWritable,
      dirError,
      diskFileCount: diskFiles.length,
      diskFiles: diskFiles.slice(0, 50),
      dbItemCount: dbItems.length,
      missingOnDisk: missing,
      sample: dbCheck.slice(0, 20),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
