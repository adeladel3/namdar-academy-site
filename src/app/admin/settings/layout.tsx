import Link from "@/components/SafeLink";
import SettingsTabs from "./SettingsTabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          تنظیمات سیستم
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          تنظیمات سراسری سایت — محتوا، ظاهر، درگاه پرداخت و ارتباطات
        </p>
      </div>
      <SettingsTabs />
      <div>{children}</div>
    </div>
  );
}
