import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import {
  getCourse,
  logAudit,
  upsertCourse,
  type CourseLevelKey,
} from "@/lib/db";

const VALID_LEVELS: CourseLevelKey[] = ["beginner", "intermediate", "advanced"];

export async function POST(req: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;
  if (guard.session.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: {
    slug?: string;
    title?: string;
    shortDesc?: string;
    categoryId?: string;
    level?: string;
    price?: number;
    isFree?: boolean;
    instructor?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const slug = body.slug?.trim();
  const title = body.title?.trim();
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json(
      { error: "slug باید فقط حروف انگلیسی، عدد و خط تیره باشد" },
      { status: 400 }
    );
  }
  if (!title) {
    return NextResponse.json({ error: "عنوان الزامی است" }, { status: 400 });
  }
  if (getCourse(slug)) {
    return NextResponse.json(
      { error: "دوره‌ای با این slug موجود است" },
      { status: 409 }
    );
  }

  const now = Date.now();
  const isFree = body.isFree === true;
  upsertCourse({
    slug,
    title,
    shortDesc: body.shortDesc?.trim() ?? "",
    longDesc: "",
    previewImage: "/figma/detail.png",
    categoryId: body.categoryId || undefined,
    tagIds: [],
    level:
      body.level && VALID_LEVELS.includes(body.level as CourseLevelKey)
        ? (body.level as CourseLevelKey)
        : "beginner",
    price: isFree ? 0 : Math.max(0, Number(body.price) || 0),
    isFree,
    allowPurchase: !isFree,
    status: "draft",
    instructor: body.instructor?.trim() ?? "",
    durationMinutes: 0,
    studentsCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  logAudit({
    actorId: guard.session.userId,
    action: "course.create",
    targetType: "course",
    targetId: slug,
    metadata: { title },
  });

  return NextResponse.json({ success: true, slug });
}
