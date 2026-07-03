#!/usr/bin/env node
/**
 * اسکریپت یکبار-مصرف برای تبدیل آدرس‌های "/uploads/..." و "/api/files/..."
 * در دیتابیس نامدار آکادمی به "/m/...". این namespace کوتاه روی سرور
 * توسط nginx پراکسی می‌شود (nginx قاعده‌ای برای آن ندارد) پس درخواست
 * مستقیم به Next می‌رسد و فایل از روی دیسک خوانده می‌شود.
 *
 * اجرا روی سرور:
 *   cd /path/to/namdar-academy
 *   cp data/namdar.db.json data/namdar.db.json.before-m-rewrite.bak
 *   node scripts/rewrite-uploads-to-api-files.mjs
 *
 * پس از اجرا، همه‌ی آدرس‌های /uploads/<name> و /api/files/<name> در
 * فیلدهای رسانه به /m/<name> تبدیل می‌شوند. آدرس‌های /figma/... و دیگر
 * مسیرها دست‌نخورده می‌مانند. عملیات قابل rollback است (با همان فایل .bak).
 */
import fs from "node:fs";
import path from "node:path";

const DB_PATH =
  process.env.NAMDAR_DB_PATH ||
  path.join(process.cwd(), "data", "namdar.db.json");

if (!fs.existsSync(DB_PATH)) {
  console.error(`دیتابیس پیدا نشد: ${DB_PATH}`);
  process.exit(1);
}

const raw = fs.readFileSync(DB_PATH, "utf8");
let db;
try {
  db = JSON.parse(raw);
} catch (e) {
  console.error("دیتابیس قابل پارس نیست:", e.message);
  process.exit(1);
}

let changed = 0;

function rewriteValue(v) {
  if (typeof v !== "string") return v;
  if (v.startsWith("/uploads/")) {
    changed++;
    const name = v.slice("/uploads/".length);
    return `/m/${encodeURIComponent(name)}`;
  }
  if (v.startsWith("/api/files/")) {
    changed++;
    const name = v.slice("/api/files/".length);
    return `/m/${name}`;
  }
  return v;
}

function walk(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const newVal = rewriteValue(obj[i]);
      if (newVal !== obj[i]) obj[i] = newVal;
      else if (obj[i] && typeof obj[i] === "object") walk(obj[i]);
    }
    return obj;
  }
  for (const k of Object.keys(obj)) {
    const newVal = rewriteValue(obj[k]);
    if (newVal !== obj[k]) obj[k] = newVal;
    else if (obj[k] && typeof obj[k] === "object") walk(obj[k]);
  }
  return obj;
}

walk(db);

if (changed === 0) {
  console.log("هیچ آدرس /uploads/... در دیتابیس یافت نشد. تغییری اعمال نشد.");
  process.exit(0);
}

const tmp = `${DB_PATH}.tmp`;
fs.writeFileSync(tmp, JSON.stringify(db), "utf8");
fs.renameSync(tmp, DB_PATH);

console.log(`${changed} آدرس آپلودی به /m/... تبدیل شد.`);
console.log("سرور را ری‌استارت کنید تا تغییرات اعمال شوند.");
