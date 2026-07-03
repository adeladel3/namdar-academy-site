import { NextResponse } from "next/server";
import { getSession, isStaff } from "@/lib/auth";
import {
  appendTicketMessage,
  canViewerSeeTicket,
  getTicket,
  markTicketReadByStaff,
  markTicketReadByUser,
} from "@/lib/db";
import { sanitizeAttachments } from "@/lib/ticket-attachments";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "نیاز به ورود" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = getTicket(id);
  if (!ticket) {
    return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
  }

  const staff = isStaff(session);
  const isOwner = ticket.userId === session.userId;
  if (!isOwner && !staff) {
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
  }
  // Staff users still need to be in scope for this ticket — a category-scoped
  // agent shouldn't be able to reply to a ticket outside their lane just by
  // hitting the API directly.
  if (staff && !isOwner && !canViewerSeeTicket(session.userId, ticket)) {
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  const attachments = sanitizeAttachments(body.attachments);

  // Allow attachments-only messages, but if both are empty it's a no-op.
  if (text.length === 0 && attachments.length === 0) {
    return NextResponse.json(
      { error: "متن پیام یا فایل ضمیمه لازم است" },
      { status: 400 }
    );
  }
  if (text.length > 5000) {
    return NextResponse.json({ error: "متن پیام طولانی است" }, { status: 400 });
  }

  const internal = !!body.internal;
  if (internal && !staff) {
    return NextResponse.json(
      { error: "یادداشت داخلی فقط برای پشتیبانی" },
      { status: 403 }
    );
  }

  if (ticket.status === "closed" && !staff) {
    return NextResponse.json(
      { error: "این تیکت بسته شده. لطفاً تیکت جدید باز کنید" },
      { status: 409 }
    );
  }

  const authorRole: "user" | "staff" = staff && !isOwner ? "staff" : "user";
  const msg = appendTicketMessage({
    ticketId: id,
    authorId: session.userId,
    authorRole,
    body: text,
    internal,
    attachments,
  });

  // Mark read for the author so their own new reply doesn't show as unread
  if (authorRole === "user") markTicketReadByUser(id, session.userId);
  else markTicketReadByStaff(id);

  return NextResponse.json({ success: true, id: msg?.id });
}
