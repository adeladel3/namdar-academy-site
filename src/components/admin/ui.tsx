"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "@/components/SafeLink";
import { cx } from "@/lib/cx";
export { cx };
export { JalaliDatePicker } from "./JalaliDatePicker";

// هوک مشترک برای جایگذاری پنل شناور بالای هر مدال یا کانتینر overflow-hidden.
export function usePopupPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  estimatedHeight = 280
) {
  const [pos, setPos] = useState<{
    top: number;
    right: number;
    width: number;
    placement: "below" | "above";
    maxHeight: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    function recalc() {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const edgeMargin = 12;
      const spaceBelow = window.innerHeight - r.bottom - edgeMargin;
      const spaceAbove = r.top - edgeMargin;
      const placement: "below" | "above" =
        spaceBelow < estimatedHeight && spaceAbove > spaceBelow
          ? "above"
          : "below";
      const maxHeight = Math.max(
        160,
        placement === "below" ? spaceBelow : spaceAbove
      );
      setPos({
        top: placement === "below" ? r.bottom + 6 : r.top - 6,
        right: window.innerWidth - r.right,
        width: r.width,
        placement,
        maxHeight,
      });
    }
    recalc();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [open, anchorRef, estimatedHeight]);

  return pos;
}

// --- Buttons ---------------------------------------------------------------

type BtnVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "gold";
type BtnSize = "sm" | "md" | "lg";

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary:
    "bg-gradient-to-br from-[#1b3c8a] to-[#136cb5] text-white hover:opacity-95",
  secondary:
    "bg-white text-[#1b3c8a] border border-[#e5eaf5] hover:border-[#1b3c8a]",
  ghost: "bg-transparent text-[#1b3c8a] hover:bg-[#eef4ff]",
  danger: "bg-red-600 text-white hover:opacity-90",
  success: "bg-green-600 text-white hover:opacity-90",
  gold: "bg-gradient-to-b from-[#f7cf5a] via-[#e8bc3a] to-[#d4a62a] text-[#0f1f4a] hover:opacity-95 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
};
const BTN_SIZE: Record<BtnSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return (
    <button
      {...rest}
      className={cx(
        "rounded-full font-bold transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 whitespace-nowrap",
        BTN_VARIANT[variant],
        BTN_SIZE[size],
        className
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: React.ComponentProps<typeof Link> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return (
    <Link
      {...rest}
      className={cx(
        "rounded-full font-bold transition inline-flex items-center justify-center gap-2 whitespace-nowrap",
        BTN_VARIANT[variant],
        BTN_SIZE[size],
        className
      )}
    >
      {children}
    </Link>
  );
}

// --- Inputs ---------------------------------------------------------------

export const inputCx =
  "w-full px-4 py-2.5 rounded-xl border border-[#e5eaf5] bg-white text-[#010514] placeholder:text-[#010514]/40 focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/15 transition disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-[#010514]/70 mb-1.5 font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="block text-[11px] text-[#010514]/50 mt-1">{hint}</span>
      )}
      {error && (
        <span className="block text-[11px] text-red-600 mt-1">{error}</span>
      )}
    </label>
  );
}

export const Input = ({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...rest} className={cx(inputCx, className)} />
);

export const Textarea = ({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...rest} className={cx(inputCx, "min-h-[120px] leading-7", className)} />
);

// Styled dropdown that mirrors the <select> API (value + onChange with
// e.target.value, <option> children) but renders with the site's design
// language instead of the browser default. Drop-in replacement — no
// consumer changes required.
type SelectEvent = { target: { value: string; name?: string } };
export function Select({
  value,
  onChange,
  children,
  className,
  disabled,
  name,
  id,
  "aria-label": ariaLabel,
}: {
  value?: string | number | readonly string[];
  onChange?: (e: SelectEvent) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
}) {
  type Opt = { value: string; label: string; disabled?: boolean };
  const options: Opt[] = [];
  const walk = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (node) => {
      if (!React.isValidElement(node)) return;
      const el = node as React.ReactElement<{
        value?: string | number;
        children?: React.ReactNode;
        disabled?: boolean;
      }>;
      if (el.type === "option") {
        const v = el.props.value;
        const lbl = typeof el.props.children === "string"
          ? el.props.children
          : String(el.props.children ?? "");
        options.push({
          value: v === undefined ? "" : String(v),
          label: lbl,
          disabled: !!el.props.disabled,
        });
      } else if (el.type === "optgroup" && el.props.children) {
        walk(el.props.children);
      }
    });
  };
  walk(children);

  const current = value === undefined ? "" : String(value);
  const selected = options.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const pos = usePopupPosition(anchorRef, open, 220);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, options.findIndex((o) => o.value === current));
    setActiveIdx(idx);
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function pick(v: string) {
    onChange?.({ target: { value: v, name } });
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIdx];
      if (opt && !opt.disabled) pick(opt.value);
    }
  }

  const popup =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popupRef}
            dir="rtl"
            className="z-[100] rounded-2xl border border-[#e5eaf5] bg-white shadow-[0_18px_40px_-12px_rgba(14,26,61,0.28)] overflow-hidden"
            style={{
              position: "fixed",
              top: pos.placement === "below" ? pos.top : undefined,
              bottom:
                pos.placement === "above"
                  ? window.innerHeight - pos.top
                  : undefined,
              right: pos.right,
              minWidth: pos.width,
              maxHeight: pos.maxHeight,
              animation: "cboxIn 0.14s ease-out",
            }}
          >
            <div role="listbox" className="py-1.5 px-1.5 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-[#010514]/50">
                  گزینه‌ای موجود نیست
                </div>
              ) : (
                options.map((opt, i) => {
                  const isSelected = opt.value === current;
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={opt.value + i}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onMouseEnter={() => !opt.disabled && setActiveIdx(i)}
                      onClick={() => !opt.disabled && pick(opt.value)}
                      className={cx(
                        "w-full flex items-center gap-3 px-3.5 py-2.5 text-right text-[13.5px] transition rounded-xl disabled:opacity-40",
                        isSelected
                          ? "font-bold text-white shadow-[0_8px_20px_-10px_rgba(27,60,138,0.55)]"
                          : isActive
                          ? "bg-[#f4f7fc] text-[#1b3c8a] font-bold"
                          : "text-[#010514]/80 hover:bg-[#f4f7fc]"
                      )}
                      style={
                        isSelected
                          ? {
                              background:
                                "linear-gradient(135deg, #1b3c8a 0%, #136cb5 55%, #49bbbd 100%)",
                            }
                          : undefined
                      }
                    >
                      <span className="flex-1 truncate">{opt.label}</span>
                      {isSelected && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <style jsx>{`
              @keyframes cboxIn {
                from {
                  opacity: 0;
                  transform: translateY(-4px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={anchorRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cx(
          inputCx,
          "flex items-center justify-between text-right gap-3",
          open && "border-[#1b3c8a] ring-2 ring-[#1b3c8a]/15",
          disabled && "cursor-not-allowed",
          className
        )}
      >
        <span
          className={cx(
            "flex-1 truncate",
            selected ? "text-[#010514]" : "text-[#010514]/40"
          )}
        >
          {selected ? selected.label : "انتخاب کنید"}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cx(
            "text-[#1b3c8a]/70 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {popup}
    </>
  );
}

// --- Combobox -------------------------------------------------------------

export type ComboOption = {
  value: string;
  label: string;
  hint?: string;
};

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید",
  disabled,
  className,
  searchable = true,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ComboOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const pos = usePopupPosition(anchorRef, open);

  const filtered = query.trim()
    ? options.filter((o) =>
        (o.label + " " + (o.hint ?? ""))
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : options;

  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (popupRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = Math.max(
        0,
        filtered.findIndex((o) => o.value === value)
      );
      setActiveIndex(idx);
    } else {
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  function onButtonKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) pick(opt.value);
    }
  }

  const popup =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popupRef}
            dir="rtl"
            className="z-[100] rounded-2xl border border-[#e5eaf5] bg-white shadow-[0_18px_40px_-12px_rgba(14,26,61,0.28)] overflow-hidden"
            style={{
              position: "fixed",
              top: pos.placement === "below" ? pos.top : undefined,
              bottom:
                pos.placement === "above"
                  ? window.innerHeight - pos.top
                  : undefined,
              right: pos.right,
              width: pos.width,
              animation: "cboxIn 0.14s ease-out",
            }}
          >
            {searchable && options.length > 6 && (
              <div className="p-2 border-b border-[#eef2f7]">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="جستجو..."
                  className="w-full h-9 px-3 rounded-lg bg-[#f7fafd] text-[13px] text-[#010514] placeholder:text-[#010514]/40 focus:outline-none focus:ring-2 focus:ring-[#1b3c8a]/15"
                />
              </div>
            )}
            <div
              ref={listRef}
              role="listbox"
              className="max-h-[280px] overflow-y-auto py-1.5 px-1.5"
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[#010514]/50">
                  موردی پیدا نشد
                </div>
              ) : (
                filtered.map((opt, i) => {
                  const isSelected = opt.value === value;
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => pick(opt.value)}
                      className={cx(
                        "w-full flex items-center gap-3 px-3.5 py-2.5 text-right text-[13.5px] transition rounded-xl",
                        isSelected
                          ? "font-bold text-white shadow-[0_8px_20px_-10px_rgba(27,60,138,0.55)]"
                          : isActive
                          ? "bg-[#f4f7fc] text-[#1b3c8a] font-bold"
                          : "text-[#010514]/80 hover:bg-[#f4f7fc]"
                      )}
                      style={
                        isSelected
                          ? {
                              background:
                                "linear-gradient(135deg, #1b3c8a 0%, #136cb5 55%, #49bbbd 100%)",
                            }
                          : undefined
                      }
                    >
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.hint && (
                        <span
                          className={cx(
                            "text-[11px]",
                            isSelected ? "text-white/80" : "text-[#010514]/45"
                          )}
                        >
                          {opt.hint}
                        </span>
                      )}
                      {isSelected && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            <style jsx>{`
              @keyframes cboxIn {
                from {
                  opacity: 0;
                  transform: translateY(-4px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={cx("relative", className)} dir="rtl">
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onButtonKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          inputCx,
          "flex items-center justify-between text-right gap-3",
          open && "border-[#1b3c8a] ring-2 ring-[#1b3c8a]/15",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cx(
            "flex-1 truncate",
            selected ? "text-[#010514]" : "text-[#010514]/40"
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cx(
            "text-[#1b3c8a]/70 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {popup}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cx(
        "flex items-center justify-between gap-3 py-2",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <div className="flex-1">
        <div className="font-medium text-[#010514] text-sm">{label}</div>
        {description && (
          <div className="text-[11px] text-[#010514]/55 mt-0.5">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-[#1b3c8a]" : "bg-[#e5eaf5]",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "right-0.5" : "right-[22px]"
          )}
        />
      </button>
    </label>
  );
}

// --- Badges ----------------------------------------------------------------

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold",
        className
      )}
    >
      {children}
    </span>
  );
}

// --- Modal ----------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cx("w-full bg-white rounded-3xl shadow-2xl overflow-hidden", width)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between">
          <h3 className="font-bold text-[#010514]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#010514]/55 hover:text-[#010514] text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f7fafd]"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#eef2f7] bg-[#f7fafd] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function useModal() {
  const [open, setOpen] = useState(false);
  return { open, openModal: () => setOpen(true), closeModal: () => setOpen(false) };
}

// --- Toast ----------------------------------------------------------------

type ToastItem = { id: number; kind: "ok" | "err" | "info"; text: string };

let toastSetter: ((items: ToastItem[]) => void) | null = null;
let toastItems: ToastItem[] = [];
let toastSeq = 1;

export function toast(text: string, kind: "ok" | "err" | "info" = "ok") {
  const id = toastSeq++;
  toastItems = [...toastItems, { id, kind, text }];
  toastSetter?.(toastItems);
  setTimeout(() => {
    toastItems = toastItems.filter((t) => t.id !== id);
    toastSetter?.(toastItems);
  }, 3500);
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    toastSetter = setItems;
    return () => {
      toastSetter = null;
    };
  }, []);
  return (
    <div className="fixed bottom-6 left-6 z-[70] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cx(
            "px-4 py-3 rounded-2xl shadow-lg text-sm font-medium min-w-[220px]",
            t.kind === "ok" && "bg-green-600 text-white",
            t.kind === "err" && "bg-red-600 text-white",
            t.kind === "info" && "bg-[#1b3c8a] text-white"
          )}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

// --- Confirm --------------------------------------------------------------

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    danger: boolean;
    resolve?: (v: boolean) => void;
  }>({
    open: false,
    title: "",
    message: "",
    confirmText: "تأیید",
    danger: false,
  });

  function confirm(opts: {
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
  }) {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText ?? "تأیید",
        danger: opts.danger ?? false,
        resolve,
      });
    });
  }

  const dialog = (
    <Modal
      open={state.open}
      onClose={() => {
        state.resolve?.(false);
        setState((s) => ({ ...s, open: false }));
      }}
      title={state.title}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              state.resolve?.(false);
              setState((s) => ({ ...s, open: false }));
            }}
          >
            انصراف
          </Button>
          <Button
            variant={state.danger ? "danger" : "primary"}
            onClick={() => {
              state.resolve?.(true);
              setState((s) => ({ ...s, open: false }));
            }}
          >
            {state.confirmText}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#010514]/75 leading-7">{state.message}</p>
    </Modal>
  );

  return { confirm, dialog };
}

// --- Dropdown -------------------------------------------------------------

export function Dropdown({
  trigger,
  children,
  align = "right",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "right" | "left";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cx(
            "absolute top-full mt-2 min-w-[180px] bg-white border border-[#e5eaf5] rounded-2xl shadow-lg py-1.5 z-30",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "w-full text-right px-4 py-2 text-sm transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-[#010514] hover:bg-[#f7fafd]"
      )}
    >
      {children}
    </button>
  );
}

// --- Card -----------------------------------------------------------------

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "bg-white rounded-3xl border border-[#e5eaf5] overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 border-b border-[#eef2f7] flex items-center justify-between gap-3">
      <div>
        <h3 className="font-bold text-[#010514]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[#010514]/55 mt-0.5">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

// --- Empty state ----------------------------------------------------------

export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="p-10 text-center rounded-3xl border border-dashed border-[#e5eaf5] bg-white">
      <div className="font-bold text-[#010514] mb-2">{title}</div>
      {description && (
        <p className="text-sm text-[#010514]/55 mb-5 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
