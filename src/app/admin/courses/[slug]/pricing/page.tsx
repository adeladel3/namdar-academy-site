import { notFound } from "next/navigation";
import { getCourse } from "@/lib/db";
import PricingEditor from "./PricingEditor";

export const dynamic = "force-dynamic";

export default async function CoursePricingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  return <PricingEditor course={course} />;
}
