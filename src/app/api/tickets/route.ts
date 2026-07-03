import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createTicket,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/db";
import { sanitizeAttachments } from "@/lib/ticket-attachments";

const ALLOWED_CATEGORIES: TicketCategory[] = [
  "technical",
  "billing",
  "course",
  "account",
  "other",
];

const ALLOWED_PRIORITIES: TicketPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "نیاز به ورود" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  const subject =
    typeof body.subject === "string" ? body.subject.trim() : "";
  const message =
    typeof body.body === "string" ? body.body.trim() : "";
  const categoryRaw =
    typeof body.category === "string" ? body.category : "other";
  const priorityRaw =
    typeof body.priority === "string" ? body.priority : "normal";
  const relatedCourseSlug =
    typeof body.relatedCourseSlug === "string" && body.relatedCourseSlug
      ? body.relatedCourseSlug
      : undefined;
  const relatedOrderId =
    typeof body.relatedOrderId === "string" && body.relatedOrderId
      ? body.relatedOrderId
      : undefined;

  if (subject.length < 3) {
    return NextResponse.json(
      { error: "موضوع باید حداقل ۳ حرف باشد" },
      { status: 400 }
    );
  }
  if (subject.length > 120) {
    return NextResponse.json(
      { error: "موضوع نباید بیشتر از ۱۲۰ حرف باشد" },
      { status: 400 }
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "متن پیام حداقل ۱۰ حرف باشد" },
      { status: 400 }
    );
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { error: "متن پیام طولانی است" },
      { status: 400 }
    );
  }

  const category = (ALLOWED_CATEGORIES as string[]).includes(categoryRaw)
    ? (categoryRaw as TicketCategory)
    : "other";
  const priority = (ALLOWED_PRIORITIES as string[]).includes(priorityRaw)
    ? (priorityRaw as TicketPriority)
    : "normal";

  const attachments = sanitizeAttachments(body.attachments);

  const { ticket } = createTicket({
    userId: session.userId,
    subject,
    body: message,
    category,
    priority,
    relatedCourseSlug,
    relatedOrderId,
    attachments,
  });

  return NextResponse.json({ success: true, id: ticket.id });
}
