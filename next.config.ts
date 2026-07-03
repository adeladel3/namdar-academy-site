import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy — همه‌ی origins و subdomain هایی که سایت با
// آن‌ها در ارتباط است را شامل می‌شود:
//   * نامدار آکادمی: namdaracademy.com + همه‌ی subdomain ها (مثل
//     investinghub.namdaracademy.com و namdargold.namdaracademy.com)
//   * گفتینو (چت زنده): goftino.com + همه‌ی subdomain ها + WebSocket
//     (wss://ws*.goftino.com)
//   * سپ بانک سامان (درگاه): sep.shaparak.ir
//   * انماد (نماد اعتماد): trustseal.enamad.ir
//   * کاوه‌نگار (پنل اطلاعات): api.kavenegar.com (سرور به سرور؛ از مرورگر
//     فراخوانی نمی‌شود ولی اگر آینده فرانت بخواهد، اجازه می‌دهیم)
//   * آپارات و یوتیوب (پخش ویدیو)
const NAMDAR_HOSTS = [
  "https://namdaracademy.com",
  "https://*.namdaracademy.com",
];
const GOFTINO_HTTPS = "https://*.goftino.com https://goftino.com";
const GOFTINO_WSS = "wss://*.goftino.com wss://goftino.com";

const csp = [
  "default-src 'self' " + NAMDAR_HOSTS.join(" "),
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${GOFTINO_HTTPS} https://trustseal.enamad.ir`,
  `style-src 'self' 'unsafe-inline' ${GOFTINO_HTTPS}`,
  `font-src 'self' data: ${GOFTINO_HTTPS}`,
  `img-src 'self' data: blob: https: ${NAMDAR_HOSTS.join(" ")}`,
  `media-src 'self' blob: https: ${NAMDAR_HOSTS.join(" ")}`,
  `connect-src 'self' ${NAMDAR_HOSTS.join(" ")} ${GOFTINO_HTTPS} ${GOFTINO_WSS} https://api.kavenegar.com https://sep.shaparak.ir${isDev ? " ws: wss: http://localhost:* https://localhost:* http://127.0.0.1:*" : ""}`,
  `frame-src 'self' ${GOFTINO_HTTPS} https://sep.shaparak.ir https://trustseal.enamad.ir https://www.aparat.com https://www.youtube.com https://aparat.com`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://sep.shaparak.ir",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  // Dev-only: allow hitting the server via IP addresses (127.0.0.1 / LAN IP)
  // in addition to the default `localhost`. Without this, Next.js blocks
  // /_next/* dev resources and the client bundle fails to hydrate.
  allowedDevOrigins: ["127.0.0.1", "192.168.100.16"],
  // Produce a self-contained production server under .next/standalone so
  // the deploy bundle only needs Node — no `npm install` on the server.
  output: "standalone",
  async headers() {
    // فایل‌های اجرایی و آرشیو که آپلود می‌شوند نباید با inline-rendering در
    // مرورگر باز شوند — حتی اگر MIME جعل شود، Content-Disposition: attachment
    // مرورگر را مجبور به دانلود می‌کند تا یک Word/PDF آلوده نتواند به‌صورت
    // خودکار اسکریپتش را در همان origin اجرا کند.
    const downloadOnlyExts = [
      "apk", "dmg", "bin", "bat", "cmd", "sh", "ps1",
      "jar", "app", "deb", "rpm",
      "zip", "rar", "7z", "tar", "gz",
      "doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf",
    ];
    const forceDownload = downloadOnlyExts
      .map((ext) => ({
        source: `/uploads/:name*.${ext}`,
        headers: [
          { key: "Content-Disposition", value: "attachment" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      }));

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      ...forceDownload,
    ];
  },
  async rewrites() {
    // در حالت `output: "standalone"` پوشه‌ی public یک snapshot زمان‌بیلد است
    // و فایل‌هایی که در runtime به `public/uploads/` نوشته می‌شوند توسط
    // سرور standalone دیده نمی‌شوند. همچنین کانفیگ nginx در پروداکشن گاهی
    // فقط فایل‌های زمان بیلد را می‌بیند و آپلودهای جدید را 404 می‌دهد.
    //
    // تصمیم: همه‌ی درخواست‌های `/uploads/...` را همیشه (نه فقط در fallback)
    // به route پویای `/api/files/...` rewrite می‌کنیم تا فایل از دیسک
    // خوانده شود — صرف‌نظر از اینکه nginx فایل را می‌بیند یا نه.
    return {
      beforeFiles: [
        {
          source: "/uploads/:name",
          destination: "/m/:name",
        },
        {
          source: "/api/files/:name",
          destination: "/m/:name",
        },
      ],
    };
  },
};

export default nextConfig;
