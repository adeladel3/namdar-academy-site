import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth";
import { findUserByEmail, getUser, updateUser } from "@/lib/db";

export async function PATCH(req: Request) {
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

  const current = getUser(session.userId);
  if (!current) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const patch: { name?: string; email?: string; avatar?: string } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 3) {
      return NextResponse.json(
        { error: "نام باید حداقل ۳ حرف باشد" },
        { status: 400 }
      );
    }
    patch.name = name;
  }

  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (email.length === 0) {
      patch.email = undefined as unknown as string;
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "آدرس ایمیل معتبر نیست" },
          { status: 400 }
        );
      }
      const existing = findUserByEmail(email);
      if (existing && existing.id !== session.userId) {
        return NextResponse.json(
          { error: "این ایمیل قبلاً ثبت شده" },
          { status: 409 }
        );
      }
      patch.email = email;
    }
  }

  if (typeof body.avatar === "string") {
    const avatar = body.avatar.trim();
    patch.avatar = avatar.length > 0 ? avatar : (undefined as unknown as string);
  }

  const updated = updateUser(session.userId, patch);
  if (!updated) {
    return NextResponse.json({ error: "بروزرسانی ناموفق" }, { status: 500 });
  }

  // Refresh session cookie if the name (visible in session) changed
  if (patch.name && patch.name !== session.name) {
    await setSession({ ...session, name: patch.name });
  }

  return NextResponse.json({
    success: true,
    user: {
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
    },
  });
}
