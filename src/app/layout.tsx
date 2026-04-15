import type { Metadata } from "next";
import { Vazirmatn, Poppins, Nunito_Sans, Roboto } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نامدار آکادمی | مرجع آموزش ترید و سرمایه‌گذاری",
  description:
    "نامدار آکادمی: مرجع آموزش ترید و سرمایه‌گذاری با بیش از یک میلیون کاربر فعال. با تدریس استاد امیرحسین نام‌آور.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${poppins.variable} ${nunitoSans.variable} ${roboto.variable}`}
    >
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
