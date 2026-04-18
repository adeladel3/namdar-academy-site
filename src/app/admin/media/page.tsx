import { listMedia } from "@/lib/db";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

export default function MediaLibraryPage() {
  const items = listMedia();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          کتابخانه رسانه
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          تصاویر، ویدیوها و فایل‌هایی که در سایت استفاده می‌کنید
        </p>
      </div>
      <MediaLibrary initial={items} />
    </div>
  );
}
