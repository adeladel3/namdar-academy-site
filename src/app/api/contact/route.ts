import { NextResponse } from "next/server";

declare global {
  // eslint-disable-next-line no-var
  var __namdar_contact_messages:
    | Array<{ id: string; at: number; data: Record<string, string> }>
    | undefined;
}

const messages =
  globalThis.__namdar_contact_messages ??
  (globalThis.__namdar_contact_messages = []);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, message } = body as Record<string, string>;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

    messages.push({
      id: Math.random().toString(36).slice(2),
      at: Date.now(),
      data: { name, phone, email: email ?? "", message },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[CONTACT] from ${phone}: ${message.slice(0, 80)}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 400 });
  }
}
