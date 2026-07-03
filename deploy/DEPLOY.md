# راهنمای دیپلوی نامدار آکادمی

این بسته شامل بیلد آماده‌ی پروداکشن (Next.js standalone) به همراه فایل‌های پیکربندی systemd و nginx است.

تغییرات این نسخه نسبت به بیلد قبلی:
- اصلاح درگاه پرداخت سپ: درگاه معمولی `sep.shaparak.ir` به‌عنوان مسیر اصلی استفاده می‌شود. اگر ترمینال روی pg-neo فعال باشد، سپ هدر `X-IPG-Url` را برمی‌گرداند و کد به‌طور خودکار به neo سوییچ می‌کند. کاربرانی که بلوبانک ندارند به درگاه معمولی می‌روند.
- تب «سرمایه‌گذاری» در نوار بالای سایت به آدرس `https://investinghub.namdaracademy.com` لینک می‌شود (در پنجره‌ی جدید باز می‌شود).
- رفع باگ بارگذاری رسانه: سقف Nginx مسیر `/api/admin/media/upload` از ۲۵ مگابایت به ۲۰۰ مگابایت افزایش یافت تا ویدئو و عکس‌های موبایل قابل آپلود باشند. همچنین HEIC/HEIF/AVIF (پیش‌فرض عکس آیفون) به فهرست MIME مجاز اضافه شد. پیام خطای آپلود اکنون به‌جای «بارگذاری ناموفق» علت دقیق را نشان می‌دهد.
- بهبود سرعت بارگذاری و روان‌تر شدن اسکرول: فشرده‌سازی gzip روی Nginx فعال شد (پی‌لود HTML و JS تا ۸۵٪ کوچک‌تر می‌شود)، هدر کش immutable برای `/_next/static` و کش ۳۰ روزه برای `/figma` و `/uploads` و `/fonts` اضافه شد، و روی دستگاه‌های لمسی backdrop-blur خاموش شد تا اسکرول روی موبایل لگ نزند.

## ۱. پیش‌نیازهای سرور

- اوبونتو ۲۲.۰۴ یا ۲۴.۰۴ (یا هر توزیع لینوکسی با systemd)
- آی‌پی خروج سرور باید یکی از این سه آی‌پی ثبت‌شده در سپ باشد، در غیر این صورت سپ پاسخ نمی‌دهد:
  - `78.109.198.35`
  - `78.109.198.95`
  - `79.175.174.125`
- Node.js نسخه‌ی ۲۲ یا بالاتر
- Nginx
- Certbot برای SSL (پیشنهاد: `apt install certbot python3-certbot-nginx`)

## ۲. باز کردن بسته

```bash
sudo mkdir -p /var/www/namdar-academy
sudo tar -xzf namdar-academy-deploy.tar.gz -C /tmp
sudo cp -R /tmp/deploy/app/. /var/www/namdar-academy/
sudo chown -R www-data:www-data /var/www/namdar-academy
sudo mkdir -p /var/log/namdar
sudo chown www-data:www-data /var/log/namdar
```

## ۳. تنظیم systemd

```bash
sudo cp /tmp/deploy/systemd/namdar.service /etc/systemd/system/namdar.service
sudo systemctl daemon-reload
sudo systemctl enable namdar
sudo systemctl start namdar
sudo systemctl status namdar
```

سرویس روی `127.0.0.1:3000` گوش می‌دهد.

## ۴. تنظیم Nginx

```bash
sudo cp /tmp/deploy/nginx/namdar.conf /etc/nginx/sites-available/namdar.conf
sudo ln -s /etc/nginx/sites-available/namdar.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ۵. گواهینامه SSL با Let's Encrypt

```bash
sudo certbot --nginx -d namdaracademy.com -d www.namdaracademy.com
```

certbot به‌صورت خودکار قسمت `ssl_certificate` فایل nginx را پر می‌کند.

## ۶. نکات بسیار مهم درباره‌ی درگاه سپ

سپ آی‌پی سرور و دامنه‌ی سایت را در پنل خود سفیدلیست می‌کند. اگر هر یک از این‌ها مطابقت نکند، تراکنش با خطا برمی‌گردد:

- **آدرس کالبک ثبت‌شده در سپ:** `http://namdaracademy.com` (با `http`، نه `https`). پیکربندی Nginx همین حالت را پشتیبانی می‌کند: مسیر `/api/payment/callback` روی پورت ۸۰ هم در دسترس است، بقیه‌ی ترافیک به HTTPS هدایت می‌شود.
- **آی‌پی‌های ثبت‌شده در سپ:** `78.109.198.35`, `78.109.198.95`, `79.175.174.125`.
- **شناسه ترمینال:** `15398939` (در `.env.production`).
- **آدرس کالبک در دیتابیس:** قبل از بسته‌بندی روی `http://namdaracademy.com` تنظیم شده است (در `data/namdar.db.json` بخش `payment.callbackBaseUrl`).

### درگاه معمولی در مقابل pg-neo

این بیلد طوری پیاده‌سازی شده که درگاه معمولی سپ (`sep.shaparak.ir/OnlinePG/SendToken`) به‌عنوان مسیر اصلی است. اگر ترمینال شما روی pg-neo فعال باشد، سپ پاسخ توکن را با هدر `X-IPG-Url` می‌فرستد و کد به‌طور خودکار از همان آدرس برای SendToken استفاده می‌کند.

پس کاربرانی که بلوبانک دارند خودبه‌خود به neo می‌روند، و بقیه به درگاه معمولی. هیچ هاردکدی به neo-pg.sep.ir در کد نیست.

اگر آی‌پی سرور پروداکشن غیر از این سه عدد است، پیش از تست تراکنش به آدرس `epay@sep.ir` ایمیل بزنید با موضوع «اضافه کردن آی‌پی به ترمینال 15398939».

## ۷. حساب ادمین اولیه

اولین باری که سرویس راه‌اندازی شود، اگر شماره `09122787263` در دیتابیس وجود نداشته باشد، به‌صورت خودکار به‌عنوان ادمین ساخته می‌شود. برای ورود:

1. به `https://namdaracademy.com/login` بروید.
2. شماره `09122787263` را وارد کنید، کد یک‌بار مصرف از طریق پیامک می‌رسد.
3. پس از ورود، در `/admin/settings/payment` تنظیمات درگاه سپ را بررسی کنید.

## ۸. بررسی سلامت پس از دیپلوی

```bash
sudo systemctl status namdar
sudo tail -n 100 -f /var/log/namdar/app.log
curl -I https://namdaracademy.com/
curl -I "http://namdaracademy.com/api/payment/callback"   # باید 405 یا 400 برگرداند، نه 502
```

## ۹. اعمال اصلاحیه‌ی سقف آپلود رسانه روی سرور موجود

اگر بسته‌ی جدید را هنوز دیپلوی نکرده‌اید ولی می‌خواهید همین الان مشکل آپلود رسانه روی سرور پروداکشن را حل کنید، فقط فایل پیکربندی Nginx را به‌روز کنید:

```bash
sudo cp /tmp/deploy/nginx/namdar.conf /etc/nginx/sites-available/namdar.conf
sudo nginx -t
sudo systemctl reload nginx
```

این تغییر بدون توقف سرویس Next اعمال می‌شود و بلافاصله امکان آپلود فایل‌های تا ۲۰۰ مگابایت در `/admin/media` و در ادیتور دوره‌ها را فراهم می‌کند.

> پشتیبانی کامل از HEIC آیفون و پیام خطای واضح، به به‌روزرسانی کد Next هم نیاز دارد. اگر فقط فایل nginx را به‌روز کنید، عکس‌های بزرگ JPG/PNG و ویدئوهای MOV/MP4 آپلود می‌شوند، ولی HEIC با پیام «نوع فایل مجاز نیست» رد می‌شود.

## ۱۰. تست تراکنش سپ

پس از دیپلوی، یک خرید با کوچک‌ترین مبلغ (مثلاً ۲٬۰۰۰ تومان روی یکی از دوره‌ها) انجام دهید. اگر سپ خطا داد، پیام دقیق سپ روی صفحه نمایش داده می‌شود. خطاهای متداول:

| پیام سپ | دلیل | راه حل |
|--------|------|--------|
| `آدرس ارجاع‌دهنده معتبر نیست` | کالبک با `https` فرستاده شده ولی سپ `http` ثبت کرده | مطمئن شوید nginx ترافیک به مسیر `/api/payment/callback` را روی پورت ۸۰ سرو می‌کند و در `payment.callbackBaseUrl` همان `http://namdaracademy.com` ثبت است |
| `آدرس سرور پذیرنده معتبر نمی‌باشد` (کد ۸ یا ۱۸-) | آی‌پی سرور در whitelist سپ نیست | ایمیل به `epay@sep.ir` با ذکر شماره ترمینال و آی‌پی جدید |
| `سرویس در حال حاضر در دسترس نیست` (در neo-pg.sep.ir) | ترمینال روی neo نیست ولی کد به neo می‌فرستد | کد این بیلد به‌طور خودکار از هدر `X-IPG-Url` می‌خواند، پس این خطا نباید رخ دهد. اگر داد، یعنی ترمینال در سپ به‌درستی روی pg-neo فعال نشده — با پشتیبانی سپ تماس بگیرید |
| `Session Is Null` | کاربر صفحه را refresh کرده | غیر قابل کنترل از سمت ما |
| `پایانه فروشگاهی مجوز انجام تراکنش ندارد` | مبلغ کمتر از ۲٬۰۰۰ ریال (= ۲۰۰ تومان) | کد ما حداقل ۲٬۰۰۰ ریال را الزام می‌کند، بنابراین باید قبل از ارسال خطا بدهد |

## ۱۱. به‌روزرسانی در آینده

برای دیپلوی نسخه‌ی بعد:

```bash
sudo systemctl stop namdar
# کپی فایل‌های جدید (به‌جز data/) روی /var/www/namdar-academy/
sudo cp -R /tmp/deploy/app/!(data) /var/www/namdar-academy/
sudo systemctl start namdar
```

پوشه‌ی `data/` نباید overwrite شود، چون شامل کاربران، سفارش‌ها و محتوای ادمین‌ساخته است.

## ⚠️ هشدار امنیتی

این بسته شامل اسرار پروداکشن است:
- `SESSION_SECRET` (در `.env.production`)
- `SMS_API_KEY` کاوه‌نگار
- `SEP_TERMINAL_ID`

از طریق ایمیل عمومی یا چت ناامن منتقل نکنید. ترجیحاً با scp روی سرور کپی کنید یا از یک سرویس انتقال فایل رمزنگاری‌شده استفاده کنید.
