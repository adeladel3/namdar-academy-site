# نامدار آکادمی — Namdar Academy

سایت رسمی **نامدار آکادمی**، مرجع آموزش ترید و سرمایه‌گذاری با تدریس استاد امیرحسین نام‌آور.

Built with **Next.js 16** (App Router + Turbopack), **Tailwind v4**, **TypeScript**, **Vazirmatn** (Persian font), and **RTL layout**.

## شروع کار

```bash
npm install
cp .env.example .env.local
# set SESSION_SECRET in .env.local
npm run dev
```

سپس به [http://localhost:3000](http://localhost:3000) مراجعه کنید.

## ساختار پروژه

```
src/
├─ app/
│  ├─ (site)/              # صفحات با هدر/فوتر مشترک
│  │  ├─ about/
│  │  ├─ articles/
│  │  ├─ contact/
│  │  ├─ courses/
│  │  ├─ dashboard/
│  │  ├─ login/
│  │  └─ signup/
│  ├─ api/                 # API routes (auth, checkout, contact, ...)
│  ├─ layout.tsx           # RTL + فونت فارسی
│  └─ page.tsx             # لندینگ (embed فیگما)
├─ components/
│  ├─ Landing.tsx          # کل لندینگ با absolute positioning دقیق از فیگما
│  ├─ FigmaStage.tsx       # مقیاس‌گذاری واکنشگرا 1920×10518 → viewport
│  ├─ LandingNavOverlay.tsx
│  ├─ SiteHeader.tsx
│  └─ SiteFooter.tsx
├─ data/
│  ├─ courses.ts           # لیست دوره‌ها
│  └─ articles.ts          # لیست مقالات
└─ lib/
   ├─ auth.ts              # Session امضاشده HMAC در cookie
   └─ otp-store.ts         # ذخیره OTP/کاربران/سفارش‌ها (in-memory؛ باید با DB جایگزین شود)

public/figma/              # ۹۷ تصویر export شده از فیگما
```

## مراحل توسعه

- [x] **مرحله ۱** — UI پیکسل-پرفکت لندینگ از فیگما
- [x] **مرحله ۲** — صفحات داخلی + احراز هویت OTP + سبد خرید + پنل کاربر
- [x] **مرحله ۳** — پنل ادمین + RBAC + تنظیمات
- [x] **مرحله ۴** — SMS واقعی (کاوه‌نگار)
- [x] **مرحله ۵** — درگاه پرداخت سامان (سپ) + اسنپ‌پی (BNPL)
- [x] **مرحله ۶** — پخش ویدیو + سیستم پیشرفت + SpotPlayer DRM
- [ ] **مرحله ۷** — اتصال به دیتابیس واقعی (PostgreSQL + Prisma)

## تست محلی پرداخت (SEP / SnappPay)

برای تست واقعی جریان پرداخت در محیط محلی:

### پیش‌نیازها

1. **Credentials واقعی**: از پرتال بانک سامان یا اسنپ‌پی اطلاعات احراز هویت دریافت کنید و در `.env.local` قرار دهید.
2. **Callback URL عمومی**: درگاه‌های پرداخت به `localhost` callback نمی‌دهند. نیاز به یک URL عمومی دارید که به سرور محلی شما tunnel کند.

### راه‌اندازی Tunnel (cloudflared / ngrok)

#### گزینه ۱: Cloudflared (رایگان، توصیه می‌شود)

```bash
# نصب cloudflared
brew install cloudflared
# یا
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# اجرای tunnel
cloudflared tunnel --url http://localhost:3000
```

خروجی شبیه این است:

```
https://random-name-1234.trycloudflare.com → localhost:3000
```

#### گزینه ۲: ngrok (نیاز به ثبت‌نام)

```bash
ngrok http 3000
```

### تست جریان پرداخت

1. **تنظیم callback URL**:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-tunnel-url.trycloudflare.com
```

2. **تنظیم credentials**:

```bash
# برای SEP:
SEP_TERMINAL_ID=your_terminal_id

# برای SnappPay:
SNAPPAY_CLIENT_ID=your_client_id
SNAPPAY_CLIENT_SECRET=your_client_secret
SNAPPAY_USERNAME=your_username
SNAPPAY_PASSWORD=your_password
```

3. **انتخاب provider در admin**:
   - وارد `/admin/settings/payment` شوید
   - در فیلد «ارائه‌دهنده درگاه فعال» گزینه دلخواه را انتخاب کنید
   - «آدرس عمومی سایت» را با URL tunnel خود پر کنید
   - ذخیره کنید

4. **تست خرید**:
   - وارد سایت شوید (از طریق URL tunnel)
   - یک دوره به سبد اضافه کنید
   - تسویه‌حساب کنید → به درگاه هدایت می‌شوید
   - پرداخت را تکمیل کنید → callback به سرور محلی شما برمی‌گردد
   - بررسی کنید که سفارش `paid` شده و enrollment ایجاد شده است

### نکات مهم

- **IP سرور**: اگر از SnappPay استفاده می‌کنید، IP خروجی tunnel شما باید در پرتال اسنپ‌پی سفید‌لیست شود. برای تست محلی می‌توانید از staging environment (اگر موجود باشد) استفاده کنید.
- **SEP**: آدرس callback باید با domain ثبت‌شده در قرارداد بانک سامان یکسان باشد. اگر `namdaracademy.com` ثبت کرده‌اید، tunnel با subdomain دیگر کار نمی‌کند — باید از production تست کنید یا subdomain را به سپ اعلام کنید.
- **Logs**: تمام gateway calls در audit log ثبت می‌شوند (`data/db.json` → `auditLog`).

## نکات مهم

**فونت:** از `Vazirmatn` برای متن فارسی استفاده شده (نام‌های `Yekan_Bakh:*` در فیگما از طریق `@font-face` به Vazirmatn alias می‌شوند).

**مقیاس‌گذاری:** لندینگ در یک container ثابت `1920×10518` با `transform: scale()` رندر می‌شود تا در viewport‌های کوچک‌تر بدون بازسازی layout، تناسب پیکسلی حفظ شود.

**حافظه:** داده‌های کاربر/سفارش/OTP فعلاً در حافظه‌ی process هستند (`src/lib/otp-store.ts`). قبل از deploy باید با دیتابیس واقعی جایگزین شوند.

**پرداخت:**
- **سامان (سپ)**: درگاه بانکی کارت به کارت. نیاز به `SEP_TERMINAL_ID` از بانک سامان.
- **اسنپ‌پی (SnappPay)**: پرداخت اقساطی بدون سود (BNPL). نیاز به `SNAPPAY_CLIENT_ID`, `SNAPPAY_CLIENT_SECRET`, `SNAPPAY_USERNAME`, `SNAPPAY_PASSWORD` از پرتال اسنپ‌پی.
- در حالت dev (بدون تنظیم credentials) جریان پرداخت شبیه‌سازی می‌شود.
