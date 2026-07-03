"use client";

import { useState } from "react";
import SeminarReserveModal from "./SeminarReserveModal";

type Variant = "primary" | "hero";

export default function ReserveButton({
  seminarSlug,
  seminarTitle,
  priceLabel,
  alreadyAuthed,
  defaultName,
  defaultPhone,
  disabled,
  disabledLabel,
  label,
  variant = "primary",
  className,
}: {
  seminarSlug: string;
  seminarTitle: string;
  priceLabel: string;
  alreadyAuthed: boolean;
  defaultName?: string;
  defaultPhone?: string;
  disabled?: boolean;
  disabledLabel?: string;
  label?: string;
  variant?: Variant;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variantCls =
    variant === "hero"
      ? "px-8 py-4 text-base sm:text-lg bg-gradient-to-b from-[#fde285] via-[#f7cf5a] to-[#d4a62a] text-[#2d1c03] shadow-[0_18px_40px_-14px_rgba(212,166,42,0.6)] hover:opacity-95"
      : "px-6 py-3 text-sm bg-gradient-to-l from-[#1b3c8a] to-[#136cb5] text-white shadow-lg shadow-[#136cb5]/25 hover:opacity-95";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`${base} ${variantCls} ${className ?? ""}`}
      >
        {disabled ? disabledLabel ?? "غیرفعال" : label ?? "رزرو صندلی"}
        {!disabled && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        )}
      </button>
      <SeminarReserveModal
        open={open}
        onClose={() => setOpen(false)}
        seminarSlug={seminarSlug}
        seminarTitle={seminarTitle}
        priceLabel={priceLabel}
        alreadyAuthed={alreadyAuthed}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
      />
    </>
  );
}
