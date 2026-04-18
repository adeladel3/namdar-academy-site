import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { generateId, upsertFaq } from "@/lib/db";

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let body: { question?: string; answer?: string; order?: number; published?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.question?.trim())
    return NextResponse.json({ error: "سوال الزامی" }, { status: 400 });

  const id = generateId("faq");
  upsertFaq({
    id,
    question: body.question.trim(),
    answer: body.answer ?? "",
    order: body.order ?? 0,
    published: body.published !== false,
  });
  return NextResponse.json({ success: true, id });
}
