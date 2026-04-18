import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  generateId,
  listCategories,
  logAudit,
  upsertCategory,
} from "@/lib/db";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  return NextResponse.json({ items: listCategories() });
}

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  let body: { name?: string; slug?: string; icon?: string; parentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "نام الزامی" }, { status: 400 });

  const slug = (body.slug?.trim() ? slugify(body.slug) : slugify(name)) || generateId("cat");
  const id = `cat_${slug}`;

  upsertCategory({
    id,
    name,
    slug,
    icon: body.icon,
    parentId: body.parentId,
    order: listCategories().length,
  });
  logAudit({
    actorId: guard.session.userId,
    action: "category.create",
    targetType: "category",
    targetId: id,
  });
  return NextResponse.json({ success: true, id });
}
