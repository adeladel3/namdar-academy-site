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
- [ ] **مرحله ۳** — اتصال به دیتابیس واقعی (Supabase / Postgres)
- [ ] **مرحله ۴** — SMS واقعی (کاوه‌نگار / SMS.ir)
- [ ] **مرحله ۵** — درگاه پرداخت زرین‌پال
- [ ] **مرحله ۶** — پنل ادمین
- [ ] **مرحله ۷** — پخش ویدیو + سیستم پیشرفت دوره

## نکات مهم

**فونت:** از `Vazirmatn` برای متن فارسی استفاده شده (نام‌های `Yekan_Bakh:*` در فیگما از طریق `@font-face` به Vazirmatn alias می‌شوند).

**مقیاس‌گذاری:** لندینگ در یک container ثابت `1920×10518` با `transform: scale()` رندر می‌شود تا در viewport‌های کوچک‌تر بدون بازسازی layout، تناسب پیکسلی حفظ شود.

**حافظه:** داده‌های کاربر/سفارش/OTP فعلاً در حافظه‌ی process هستند (`src/lib/otp-store.ts`). قبل از deploy باید با دیتابیس واقعی جایگزین شوند.

**پرداخت:** در حالت dev (بدون `ZARINPAL_MERCHANT_ID`) جریان پرداخت شبیه‌سازی می‌شود و مستقیم به callback موفق هدایت می‌کند.
