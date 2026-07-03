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

export default async function SeminarLandingContentPage({
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
      namespace="landing"
      blocks={seminar.landingBlocks ?? []}
      titleArea="محتوای فرانت سایت (لندینگ عمومی)"
      description="هر چیزی که در صفحه‌ی عمومی سمینار به همه‌ی بازدیدکنندگان نمایش داده می‌شود — تصاویر، ویدیوها، بنرها و توضیحات اضافه. این بخش با «محتوای پنل خریداران» کاملاً مجزا است."
    />
  );
}
