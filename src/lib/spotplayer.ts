import {
  getEnrollmentById,
  getCourse,
  getSettingsGroup,
  getUser,
  setEnrollmentSpotPlayer,
  setEnrollmentSpotPlayerError,
  type EnrollmentRecord,
} from "@/lib/db";

// مستندات: https://spotplayer.ir/help/api
// ساخت لایسنس: POST https://panel.spotplayer.ir/license/edit/
// هدرها: $API = کلید سایت، $LEVEL = -1
const SPOTPLAYER_LICENSE_ENDPOINT = "https://panel.spotplayer.ir/license/edit/";

type SpotPlayerSettings = {
  apiKey?: string;
  /** روزهای مجاز برای استفاده آفلاین (بدون اتصال به اینترنت). */
  offlineDays?: number;
};

function readSettings(): SpotPlayerSettings {
  const dbSettings = getSettingsGroup("spotplayer.") as {
    apiKey?: string;
    offlineDays?: string | number;
  };
  const offlineRaw = dbSettings.offlineDays;
  const offlineNum =
    typeof offlineRaw === "number"
      ? offlineRaw
      : typeof offlineRaw === "string" && offlineRaw.trim()
      ? Number(offlineRaw)
      : NaN;
  return {
    apiKey: dbSettings.apiKey || process.env.SPOTPLAYER_API_KEY || undefined,
    offlineDays: Number.isFinite(offlineNum) ? offlineNum : 30,
  };
}

/** فقط برای نمایش وضعیت اتصال در پنل مدیریت — آیا کلید تنظیم شده؟ */
export function isSpotPlayerConfigured(): boolean {
  return !!readSettings().apiKey;
}

type CreateLicenseInput = {
  /** کد دوره اسپات‌پلیر (همان hex داخل پنل). */
  courseId: string;
  /** نام مشتری روی لایسنس — برای ردیابی در پنل اسپات‌پلیر. */
  name: string;
  /** متن واترمارک روی ویدیو (معمولاً شماره موبایل کاربر). */
  watermarkText: string;
  /** لایسنس آزمایشی؟ پیش‌فرض false (لایسنس واقعی). */
  test?: boolean;
};

type SpotPlayerLicenseResponse = {
  _id?: string;
  key?: string;
  url?: string;
  // پاسخ خطا معمولاً پیام را در یکی از این فیلدها برمی‌گرداند.
  error?: string;
  message?: string;
  msg?: string;
};

export type CreateLicenseResult =
  | { ok: true; licenseId: string; key: string; url: string }
  | { ok: false; error: string; simulated?: boolean };

function isNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message || "";
  if (e.name === "AbortError") return true;
  return (
    /fetch failed|ENOTFOUND|ECONNREFUSED|ENETUNREACH|EAI_AGAIN|ETIMEDOUT|timeout/i.test(
      msg
    ) || !!(e as { cause?: { code?: string } }).cause?.code
  );
}

const isProd = () => process.env.NODE_ENV === "production";

/** ساخت یک لایسنس جدید در اسپات‌پلیر. در محیط توسعه و بدون کلید، یک لایسنس
 *  شبیه‌سازی‌شده می‌سازد تا بتوان جریان کار را بدون سرویس واقعی تست کرد. */
export async function createLicense(
  input: CreateLicenseInput
): Promise<CreateLicenseResult> {
  const s = readSettings();

  if (!s.apiKey) {
    if (!isProd()) {
      const fake = `SP-DEV-${input.courseId.slice(-6).toUpperCase()}-${Date.now()
        .toString(36)
        .toUpperCase()}`;
      console.log(
        `[DEV-SPOTPLAYER] license simulated for course=${input.courseId} → ${fake}`
      );
      return {
        ok: true,
        licenseId: `dev_${input.courseId}`,
        key: fake,
        url: "/dev/spotplayer/simulated",
      };
    }
    return { ok: false, error: "کلید اسپات‌پلیر تنظیم نشده است." };
  }

  const body = {
    test: input.test ?? false,
    course: [input.courseId],
    offline: s.offlineDays ?? 30,
    name: input.name,
    watermark: {
      texts: [{ text: input.watermarkText }],
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(SPOTPLAYER_LICENSE_ENDPOINT, {
      method: "POST",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        $API: s.apiKey,
        $LEVEL: "-1",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await res
      .json()
      .catch(() => null)) as SpotPlayerLicenseResponse | null;

    if (res.ok && data && data._id && data.key) {
      return {
        ok: true,
        licenseId: data._id,
        key: data.key,
        url: data.url ?? "",
      };
    }

    const apiMsg = data?.error || data?.message || data?.msg;
    return {
      ok: false,
      error:
        apiMsg ||
        `ساخت لایسنس اسپات‌پلیر ناموفق بود (کد ${res.status}).`,
    };
  } catch (e) {
    if (isNetworkError(e)) {
      console.error("[spotplayer] network error:", e);
      return {
        ok: false,
        error:
          "سرور اسپات‌پلیر در حال حاضر در دسترس نیست. لطفاً چند لحظه دیگر دوباره تلاش کنید.",
      };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "خطا در اتصال به اسپات‌پلیر",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** نتیجه‌ی تلاش برای آماده‌سازی لایسنس یک ثبت‌نام. */
export type EnsureLicenseResult =
  | { status: "ready"; license: NonNullable<EnrollmentRecord["spotPlayer"]> }
  | { status: "not-spotplayer" }
  | { status: "error"; error: string };

/** به‌صورت idempotent برای یک ثبت‌نام لایسنس می‌سازد:
 *  - اگر دوره کد اسپات‌پلیر ندارد → not-spotplayer
 *  - اگر لایسنس قبلاً ساخته شده → همان را برمی‌گرداند
 *  - در غیر این صورت یک لایسنس جدید می‌سازد و روی ثبت‌نام ذخیره می‌کند
 *  در صورت خطا، پیام خطا روی ثبت‌نام ذخیره می‌شود تا بعداً قابل تلاش مجدد باشد. */
export async function ensureLicenseForEnrollment(
  enrollmentId: string
): Promise<EnsureLicenseResult> {
  const enrollment = getEnrollmentById(enrollmentId);
  if (!enrollment) return { status: "error", error: "ثبت‌نام یافت نشد." };

  if (enrollment.spotPlayer) {
    return { status: "ready", license: enrollment.spotPlayer };
  }

  const course = getCourse(enrollment.courseSlug);
  const courseId = course?.spotPlayerCourseId?.trim();
  if (!courseId) return { status: "not-spotplayer" };

  const user = getUser(enrollment.userId);
  const name = user?.name?.trim() || user?.phone || "کاربر نامدار آکادمی";
  const watermarkText = user?.phone || name;

  const result = await createLicense({ courseId, name, watermarkText });
  if (!result.ok) {
    setEnrollmentSpotPlayerError(enrollmentId, result.error);
    return { status: "error", error: result.error };
  }

  const license = {
    licenseId: result.licenseId,
    key: result.key,
    url: result.url,
    createdAt: Date.now(),
  };
  setEnrollmentSpotPlayer(enrollmentId, license);
  return { status: "ready", license };
}

/** لینک‌های دانلود اپ اسپات‌پلیر برای همه پلتفرم‌ها (از مستندات سند). */
export const SPOTPLAYER_DOWNLOADS = [
  {
    os: "windows" as const,
    label: "ویندوز",
    href: "https://app.spotplayer.ir/assets/bin/spotplayer/setup.exe",
  },
  {
    os: "mac" as const,
    label: "مکینتاش",
    href: "https://app.spotplayer.ir/assets/bin/spotplayer/setup.dmg",
  },
  {
    os: "android" as const,
    label: "اندروید",
    href: "https://app.spotplayer.ir/assets/bin/spotplayer/setup.apk",
  },
  {
    os: "web" as const,
    label: "نسخه وب",
    href: "https://app.spotplayer.ir/",
  },
];
