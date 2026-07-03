# نامدار آکادمی — بسته‌ی استقرار نسخه ۳

تاریخ ساخت: 1405-03-03 (2026-05-24 میلادی)
دامنه: namdaracademy.com
نسخه قبل: v2 (2026-05-17)

## فیچرهای جدید نسبت به نسخه v2

### 1) سمینار آنلاین — فلوی کامل رزرو و پرداخت
مسیر کاربر: `/seminars/[slug]` (صفحه عمومی) → دکمه‌ی رزرو → مودال → درگاه سامان → برگشت → دسترسی در `/dashboard/seminars`

- صفحه عمومی سمینار با شمارش معکوس (`CountdownTimer`)
- مودال رزرو (`SeminarReserveModal`) با OTP اگر کاربر وارد نباشد
- سه روت پرداخت اختصاصی:
  - `/api/seminars/[slug]/reserve/start` — شروع رزرو + ساخت سفارش
  - `/api/seminars/[slug]/reserve/checkout` — ارسال به درگاه سامان
  - `/api/seminars/[slug]/reserve/verify` — تأیید پرداخت پس از برگشت
- داشبورد کاربر: `/dashboard/seminars` (لیست) و `/dashboard/seminars/[slug]` (جزئیات)
- پنل ادمین کامل: `/admin/seminars` با تب‌های:
  - **اطلاعات پایه** (`edit/SeminarSettingsForm`): نام، تاریخ/ساعت، قیمت، ظرفیت، لینک جلسه، عکس کاور
  - **محتوای صفحه‌ی لندینگ** (`landing-content`): بلاک‌های قابل ویرایش به‌صورت drag-and-drop
  - **محتوای ویژه‌ی شرکت‌کنندگان** (`member-content`): محتوا فقط بعد از رزرو دیده می‌شود
  - **ثبت‌نام‌ها** (`registrations`): لیست کسانی که رزرو کرده‌اند با وضعیت پرداخت

### 2) سیستم ضمیمه تیکت
- آپلود فایل از فرم تیکت جدید و در پاسخ‌های بعدی
- پشتیبانی: عکس (JPG/PNG/WebP/GIF/HEIC/AVIF)، PDF، ویدیو، آرشیو
- حداکثر ۶ فایل، هر کدام تا ۱۵ مگابایت
- روت آپلود اختصاصی: `/api/tickets/upload`
- کامپوننت‌ها: `TicketAttachmentsField` (فرم) و `TicketAttachmentsView` (نمایش)

### 3) ماتریس مجوز ادمین برای سمینار
- نقش «مدیر سمینار» در RBAC اضافه شد (`src/lib/rbac.ts`)
- بخش سمینار در سایدبار ادمین فقط برای کسانی نمایش داده می‌شود که permission مربوطه را دارند
- ادمین می‌تواند از `/admin/users/[id]/permissions` این مجوز را به یک پشتیبان بدهد

### 4) سرو فایل آپلودی از طریق روت پویا
- مشکل قبل: nginx پوشه‌ی `public/uploads` را موقع بیلد cache می‌کرد و آپلودهای runtime را 404 می‌داد
- راه‌حل: روت `/api/files/[name]` که فایل را مستقیماً از Next.js سرو می‌کند
- `resolveUploadUrl()` URL ذخیره‌شده در DB را به این روت تبدیل می‌کند

### 5) بهبودهای پنل دانش‌پذیر و دوره‌ها
- اضافه شدن چیدمان جدید در `DashboardShell`
- ویرایش `CoursesGrid` و `courses/[slug]` با اطلاعات بیشتر
- اصلاحات در `UserProfileActions` و فرم‌های ادمین کاربران

### 6) رفع باگ ساختاری: media.ts / upload-url
- پیش از این: `src/lib/media.ts` که از `node:fs` استفاده می‌کرد، در کامپوننت‌های کلاینت هم وارد می‌شد و بیلد Turbopack شکست می‌خورد
- اصلاح: `resolveUploadUrl` به فایل جدا `src/lib/upload-url.ts` منتقل شد. کلاینت‌ها از این فایل ایمپورت می‌کنند

## دستورات راه‌اندازی روی سرور لینوکس

پس از باز کردن تار:

```bash
cd namdar-academy/

# گام ۱: پاک‌کردن node_modules مک و نصب نسخه‌ی لینوکس
rm -rf node_modules
npm ci --omit=dev

# گام ۲: تأیید فایل .env.production
# این متغیرها باید روی سرور تنظیم باشند (داخل .env.production):
#   SESSION_SECRET            (حداقل ۳۲ کاراکتر تصادفی)
#   ADMIN_PHONE
#   NEXT_PUBLIC_SITE_URL=https://namdaracademy.com
#   SMS_API_KEY               (کاوه‌نگار)
#   SMS_OTP_PATTERN
#   SMS_SENDER_LINE
#   SEP_TERMINAL_ID=15398939
#   SEP_REDIRECT_URL=https://namdaracademy.com/api/payment/callback

# گام ۳: راه‌اندازی سرور
npm start
# یا با pm2:
# pm2 start npm --name namdar -- start
# یا با systemd (راه‌انداز در deploy/systemd/)
```

## نکات مهم

- **`node_modules` داخل بسته متعلق به macOS است.** حتماً پاک کنید و `npm ci --omit=dev` بزنید.
- **`.next` بیلد production است** (بدون standalone). نیازی به بیلد مجدد نیست مگر کد را تغییر دهید.
- **`data/namdar.db.json`** پایگاه داده فعلی است. روی سرور آن را با نسخه‌ی production جایگزین یا حفظ کنید.
- **پشتیبان‌گیری**: قبل از جایگزینی، حتماً از `data/` پشتیبان بگیرید.
- **پورت پیش‌فرض ۳۰۰۰**. nginx جلوی آن می‌نشیند و روی ۴۴۳ proxy می‌کند.
- **فایل‌های آپلود runtime** (مثل ضمیمه‌ی تیکت‌ها) داخل `public/uploads/` ذخیره می‌شوند. nginx نباید این پوشه را cache کند. اگر می‌کند، با روت `/api/files/[name]` که بسته دارد، مشکلی نخواهد بود.

## بررسی صحیح سرو شدن فایل‌ها بعد از استقرار

پس از روشن شدن سرور، یک تصویر کوچک با ضمیمه‌ی تیکت آپلود کنید و:
- URL ذخیره‌شده باید `/uploads/...` باشد
- تگ `<img>` در صفحه‌ی نمایش باید روی `/api/files/...` لود شود
- اگر nginx پوشه را cache می‌کرد، هیچ تصویری 404 نمی‌دهد چون از روت می‌آید

## ساختار بسته

```
namdar-academy/
├── .next/                  # بیلد production (بدون standalone، بدون cache)
├── data/                   # پایگاه داده فعلی + پشتیبان‌های قدیمی
│   └── namdar.db.json
├── public/                 # asset استاتیک + uploads/
│   └── uploads/            # فایل‌های آپلودشده runtime
├── src/                    # سورس کد TS/TSX
├── scripts/                # اسکریپت‌های ابزاری legacy import/export
├── deploy/                 # نمونه پیکربندی استقرار (nginx/systemd)
├── node_modules/           # ⚠ macOS — روی سرور پاک و npm ci
├── package.json
├── package-lock.json
├── .env.production
├── .env.local
├── next.config.ts
├── tsconfig.json
├── DEPLOY_V3.md            # این فایل
└── DEPLOY_V2.md            # یادداشت‌های نسخه قبل
```

## کارهای امنیتی پس از استقرار (همان v2 + دو مورد جدید)

- [ ] CSRF middleware روی همه‌ی POST/PATCH/DELETE فعال است
- [ ] هدر HSTS برای production فعال است (در `src/middleware.ts`)
- [ ] CSP headers تنظیم شده باشد
- [ ] SESSION_SECRET حداقل ۳۲ کاراکتر تصادفی
- [ ] درگاه SEP با IP whitelist تنظیم شده
- [ ] X-IPG-Url روی domain سرور تنظیم باشد
- [ ] **جدید v3:** پوشه‌ی `public/uploads/` خواندنی برای nginx ولی فقط نوشتنی برای process Node
- [ ] **جدید v3:** نرخ آپلود `/api/tickets/upload` و `/api/admin/media/upload` پشت rate limit (هست)

## دامنه و درگاه

- **دامنه:** namdaracademy.com
- **ترمینال SEP:** 15398939
- **callback URL باید با دامنه‌ی ثبت‌شده در SEP یکسان باشد**

## انتقال امن

این بسته شامل اسرار تولیدی (کلید پیامک کاوه‌نگار، SESSION_SECRET) است. لطفاً از کانال امن (scp روی SSH یا Signal) منتقل شود — نه ایمیل عمومی.
