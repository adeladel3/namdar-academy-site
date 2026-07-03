import { notFound } from "next/navigation";
import { getCourse } from "@/lib/db";
import SyllabusEditor from "./SyllabusEditor";

export const dynamic = "force-dynamic";

export default async function CourseSyllabusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  return <SyllabusEditor course={course} />;
}
