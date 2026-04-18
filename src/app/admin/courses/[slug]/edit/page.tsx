import { notFound } from "next/navigation";
import { getCourse, listCategories, listTags } from "@/lib/db";
import CourseInfoEditor from "./CourseInfoEditor";

export const dynamic = "force-dynamic";

export default async function CourseEditInfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const categories = listCategories();
  const tags = listTags();

  return <CourseInfoEditor course={course} categories={categories} tags={tags} />;
}
