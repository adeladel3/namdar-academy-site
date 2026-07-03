import { NextResponse } from "next/server";
import { getSession, isStaff } from "@/lib/auth";
import {
  assignTicket,
  canViewerSeeTicket,
  getTicket,
  rateTicket,
  setTicketStatus,
  updateTicket,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/db";

const ALLOWED_STATUSES: TicketStatus[] = ["open", "pending", "solved", "closed"];
const ALLOWED_PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export async function PATCH(
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
  if (staff && !isOwner && !canViewerSeeTicket(session.userId, ticket)) {
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }

  // --- User-only actions: rate, close-my-own, reopen-my-own ---------------
  if (typeof body.rating === "number") {
    if (!isOwner) {
      return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
    }
    const r = body.rating;
    if (![1, 2, 3, 4, 5].includes(r)) {
      return NextResponse.json({ error: "امتیاز نامعتبر" }, { status: 400 });
    }
    const comment =
      typeof body.ratingComment === "string"
        ? body.ratingComment.trim().slice(0, 500)
        : undefined;
    rateTicket(id, session.userId, r as 1 | 2 | 3 | 4 | 5, comment);
    return NextResponse.json({ success: true });
  }

  if (typeof body.status === "string") {
    if (!(ALLOWED_STATUSES as string[]).includes(body.status)) {
      return NextResponse.json({ error: "وضعیت نامعتبر" }, { status: 400 });
    }
    const newStatus = body.status as TicketStatus;

    // Users may close their own ticket or reopen a solved one
    if (!staff) {
      const allowed =
        (newStatus === "closed" &&
          (ticket.status === "solved" || ticket.status === "pending")) ||
        (newStatus === "open" && ticket.status === "solved");
      if (!allowed) {
        return NextResponse.json(
          { error: "تغییر وضعیت توسط کاربر مجاز نیست" },
          { status: 403 }
        );
      }
    }

    setTicketStatus(id, newStatus);
  }

  // --- Staff-only actions: priority, assignee ----------------------------
  if (typeof body.priority === "string") {
    if (!staff) {
      return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
    }
    if (!(ALLOWED_PRIORITIES as string[]).includes(body.priority)) {
      return NextResponse.json({ error: "اولویت نامعتبر" }, { status: 400 });
    }
    updateTicket(id, { priority: body.priority as TicketPriority });
  }

  if ("assigneeId" in body) {
    if (!staff) {
      return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
    }
    const v = body.assigneeId;
    if (v === null || v === "") {
      assignTicket(id, undefined);
    } else if (typeof v === "string") {
      assignTicket(id, v);
    }
  }

  return NextResponse.json({ success: true });
}
