# نامدار آکادمی — بسته‌ی استقرار نسخه ۲

تاریخ ساخت: 1405-05-17 (2026-05-17 میلادی)
دامنه: namdaracademy.com

## فیچرهای جدید نسبت به نسخه قبلی

1. **سیستم ارجاع (Referral) و کارشناسان فروش**
   - مدیریت کارشناسان: `/admin/agents`
   - هر کارشناس می‌تواند چند لینک با UTM بسازد
   - شمارش کلیک، ثبت‌نام و خرید روی هر لینک
   - داشبورد کارشناس: `/dashboard/agent`
   - لینک‌های کوتاه: `/r/[linkId]`

2. **کمیسیون فروش**
   - درصد کمیسیون قابل تنظیم برای هر دوره (فرم ویرایش دوره)
   - سیستم پلکانی (tier-based) برای هر کارشناس
   - محاسبه‌ی خودکار کمیسیون موقع خرید

3. **انقضای دسترسی به دوره**
   - فیلد `accessDurationDays` برای هر دوره (پیش‌فرض)
   - مدیریت انقضای هر دانش‌پذیر در `/admin/courses/[slug]/students`
   - تمدید/منقضی/نامحدود کردن دسترسی

4. **پنل کارشناس فروش**
   - تب «خلاصه»: آمار + تاریخچهٔ فروش
   - تب «لینک‌ها»: مدیریت لینک‌ها با UTM
   - تب «مشتریان»: همه‌ی کاربران معرفی‌شده

5. **بهبود سیستم تیکت**
   - اولویت‌بندی (فوری/معمولی/کم‌اهمیت)
   - دسته‌بندی پیشرفته
   - آپلود فایل (تصویر و PDF)

6. **یکپارچه‌سازی کلمات**
   - «روان‌شناسی» با نیم‌فاصله در همه‌جا
   - حذف برچسب «دوره منتخب»
   - استاندارد شعاع دکمه‌های CTA (rounded-xl)

7. **اصلاح ای‌نماد**
   - تنظیم `rel="noopener"` برای ارسال صحیح Referrer

## دستورات راه‌اندازی روی سرور لینوکس

پس از باز کردن تار:

```bash
cd namdaracademy/

# گام ۱: پاک‌کردن node_modules مک و نصب نسخه‌ی لینوکس
rm -rf node_modules
npm ci --omit=dev

# گام ۲: تأیید فایل .env.production
cp .env.local .env.production  # یا ویرایش با مقادیر سرور
# مطمئن شوید این متغیرها روی سرور تنظیم هستند:
#   SESSION_SECRET
#   ADMIN_PHONE
#   NEXT_PUBLIC_SITE_URL=https://namdaracademy.com
#   SMS_API_KEY
#   SMS_OTP_PATTERN
#   SMS_SENDER_LINE
#   SEP_TERMINAL_ID=15398939

# گام ۳: راه‌اندازی سرور
npm start
# یا با pm2:
# pm2 start npm --name namdar -- start
# یا با systemd (راه‌انداز در deploy/systemd/)
```

## نکات مهم

- **`node_modules` داخل بسته متعلق به macOS است.** حتماً آن را پاک کنید و `npm ci --omit=dev` بزنید.
- **`.next` بیلد production است** و آماده‌ی اجرا. نیازی به بیلد مجدد نیست (مگر تغییر کد).
- **`data/namdar.db.json`** پایگاه داده فعلی است. در سرور این فایل را با نسخه‌ی production جایگزین کنید یا حفظ کنید.
- **پشتیبان‌گیری**: قبل از جایگزینی روی سرور، حتماً از `data/` پشتیبان بگیرید.
- **پورت پیش‌فرض ۳۰۰۰**. nginx جلوی آن می‌نشیند و روی ۴۴۳ proxy می‌کند.

## کارهای امنیتی پس از استقرار

- [ ] چک کنید CSRF middleware روی همه‌ی POST/PATCH/DELETE فعال است
- [ ] هدر HSTS برای production فعال است (در `src/middleware.ts`)
- [ ] CSP headers تنظیم شده باشد
- [ ] تأیید کلید SESSION_SECRET با حداقل ۳۲ کاراکتر تصادفی
- [ ] درگاه SEP با IP whitelist درست تنظیم شده باشد
- [ ] X-IPG-Url روی domain سرور تنظیم باشد

## دامنه و درگاه

- **دامنه:** namdaracademy.com
- **ترمینال SEP:** 15398939
- **callback URL باید با دامنه‌ی ثبت‌شده در SEP یکسان باشد**

## ساختار بسته

```
namdaracademy/
├── .next/                  # بیلد production (بدون standalone)
├── data/                   # پایگاه داده + آپلودها
├── public/                 # asset های استاتیک
├── src/                    # سورس کد
├── node_modules/           # ⚠ مک — حتماً پاک و بازنصب کنید
├── deploy/                 # nginx + systemd config (اختیاری)
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── next-env.d.ts
├── .env.local              # اسرار production - ⚠ نگه‌داری امن
└── DEPLOY_V2.md            # همین فایل
```

## تماس

برای سوال یا مشکل استقرار: امیرحسین نام‌آور
