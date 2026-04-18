import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { enroll, getCourse, getUser, logAudit } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const user = getUser(id);
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.slug)
    return NextResponse.json({ error: "slug الزامی" }, { status: 400 });
  const course = getCourse(body.slug);
  if (!course)
    return NextResponse.json({ error: "course not found" }, { status: 404 });

  enroll(id, body.slug, { source: "grant", grantedBy: guard.session.userId });
  logAudit({
    actorId: guard.session.userId,
    action: "user.grant-course",
    targetType: "user",
    targetId: id,
    metadata: { courseSlug: body.slug },
  });
  return NextResponse.json({ success: true });
}
