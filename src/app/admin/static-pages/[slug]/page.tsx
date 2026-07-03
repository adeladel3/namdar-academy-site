import { notFound } from "next/navigation";
import { getStaticPage } from "@/lib/db";
import StaticPageEditor from "./StaticPageEditor";

export const dynamic = "force-dynamic";

export default async function EditStaticPagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getStaticPage(slug);
  if (!page) notFound();
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          ویرایش صفحه ثابت
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1 font-mono" dir="ltr">
          /p/{slug}
        </p>
      </div>
      <StaticPageEditor page={page} />
    </div>
  );
}
