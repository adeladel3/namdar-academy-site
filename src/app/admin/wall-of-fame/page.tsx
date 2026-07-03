import { listWallOfFame } from "@/lib/db";
import WallOfFameManager from "./WallOfFameManager";

export const dynamic = "force-dynamic";

export default function AdminWallOfFamePage() {
  const items = listWallOfFame();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          دیوار افتخارات
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          تصاویر و ویدئوهای موفقیت دانش‌پذیران که در انتهای صفحه اصلی نمایش
          داده می‌شوند.
        </p>
      </div>
      <WallOfFameManager items={items} />
    </div>
  );
}
