import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import QRCode from "qrcode";
import { getSession, signTotpSetup } from "@/lib/auth";
import { getSetting } from "@/lib/db";
import { generateSecret, otpauthUri } from "@/lib/totp";

const SETUP_COOKIE = "totp_setup";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "وارد نشده‌اید" }, { status: 401 });
  }

  const issuer =
    (getSetting<string>("site.name") as string | undefined) ||
    "Namdar Academy";

  const secret = generateSecret();
  const uri = otpauthUri({
    secret,
    label: session.phone,
    issuer,
  });
  const qrDataUrl = await QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  // Bind the secret to the session in an HttpOnly cookie. /enable will read
  // it from here instead of trusting a user-supplied secret in the body.
  const token = signTotpSetup(session.userId, secret);
  const store = await cookies();
  store.set(SETUP_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  // Return the secret + QR so the user can still enter it into an
  // authenticator app. The enable-side check no longer reads the returned
  // secret from the client; it reads the cookie.
  return NextResponse.json({ success: true, secret, uri, qrDataUrl });
}
