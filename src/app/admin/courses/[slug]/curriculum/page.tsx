import { notFound } from "next/navigation";
import {
  getCourse,
  listAttachments,
  listChapters,
  listLessonsByChapter,
} from "@/lib/db";
import CurriculumBuilder from "./CurriculumBuilder";

export const dynamic = "force-dynamic";

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const chapters = listChapters(slug);
  const data = chapters.map((ch) => ({
    chapter: ch,
    lessons: listLessonsByChapter(ch.id).map((l) => ({
      ...l,
      attachments: listAttachments(l.id),
    })),
  }));

  return <CurriculumBuilder slug={slug} data={data} />;
}
