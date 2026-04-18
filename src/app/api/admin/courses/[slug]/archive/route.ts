import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { archiveCourse, getCourse, logAudit } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { slug } = await params;
  if (!getCourse(slug))
    return NextResponse.json({ error: "not found" }, { status: 404 });
  archiveCourse(slug);
  logAudit({
    actorId: guard.session.userId,
    action: "course.archive",
    targetType: "course",
    targetId: slug,
  });
  return NextResponse.json({ success: true });
}
