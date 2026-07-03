# فونت‌های لوکال نامدار آکادمی

سایت هیچ درخواستی به سرورهای گوگل (fonts.googleapis.com / fonts.gstatic.com) ارسال نمی‌کند.
همه‌ی فونت‌ها از همین پوشه‌ها سرو می‌شوند.

برای کامل کردن چیدمان فونت‌ها، فایل‌های زیر را با همین نام دقیق در پوشه‌های مشخص قرار دهید:

## iransans/
فایل‌های IRANSansX (.woff2) — راهنما در `iransans/README.txt`.

## vazirmatn/
از مخزن github.com/rastikerdar/vazirmatn فایل‌های زیر را با همین نام در این پوشه بگذارید:

```
Vazirmatn-Regular.woff2
Vazirmatn-Medium.woff2
Vazirmatn-SemiBold.woff2
Vazirmatn-Bold.woff2
Vazirmatn-ExtraBold.woff2
Vazirmatn-Black.woff2
```

## poppins/
از مخزن fonts.google.com/specimen/Poppins فایل‌های زیر را دانلود و در این پوشه بگذارید:

```
Poppins-Regular.woff2
Poppins-Medium.woff2
Poppins-SemiBold.woff2
Poppins-Bold.woff2
```

## nunito-sans/
```
NunitoSans-Regular.woff2
NunitoSans-SemiBold.woff2
NunitoSans-Bold.woff2
```

## roboto/
```
Roboto-Medium.woff2
```

## cinzel/
```
Cinzel-Regular.woff2
Cinzel-Bold.woff2
```

تا زمانی که فایل‌ها قرار نگرفته‌اند، مرورگر از `local()` در `globals.css` استفاده می‌کند: یعنی روی دستگاهی که این فونت‌ها روی سیستم‌عاملش نصب باشد همان فونت دیده می‌شود؛ روی سایر دستگاه‌ها به فالبک system-ui می‌رود. هیچ درخواستی به اینترنت ارسال نخواهد شد.
