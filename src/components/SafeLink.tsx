/**
 * Wrapper روی `next/link` که prefetch را به‌طور پیش‌فرض خاموش می‌کند.
 *
 * علت: prefetch خودکار Next.js در شبکه‌های ایرانی باعث بار اضافه روی سرور
 * و ترافیک می‌شود؛ همچنین در حضور middleware ها (CSRF) درخواست‌های prefetch
 * ممکن است بدون cookie رفته و پاسخ‌های اشتباه را cache کنند.
 *
 * استفاده: همان API `next/link`. اگر در یک مورد خاص prefetch خواستید،
 * صریحاً `prefetch` را روی `true` (یا یک عدد) ست کنید.
 */
import NextLink from "next/link";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

export default function Link({ prefetch = false, ...rest }: LinkProps) {
  return <NextLink prefetch={prefetch} {...rest} />;
}

export { Link };
