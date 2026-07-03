import { notFound } from "next/navigation";
import { getSeminar } from "@/lib/db";
import ContentBlocksManager from "../_content/ContentBlocksManager";

export const dynamic = "force-dynamic";

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default async function SeminarMemberContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = safeDecode(rawSlug);
  const seminar = getSeminar(slug) ?? getSeminar(rawSlug);
  if (!seminar) notFound();

  return (
    <ContentBlocksManager
      seminarSlug={seminar.slug}
      namespace="member"
      blocks={seminar.memberBlocks ?? []}
      titleArea="محتوای پنل خریداران (بعد از پرداخت)"
      description="فقط کسانی که این سمینار را خریده‌اند این بخش را در داشبورد خود می‌بینند — فایل‌های PDF، ویدیوهای آماده‌سازی، QR ورود، راهنمای حضور، لوکیشن و هر اطلاعیه‌ای که نیاز دارید بعد از فروش به آن‌ها بدهید."
    />
  );
}
