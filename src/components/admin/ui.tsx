"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cx } from "@/lib/cx";
export { cx };

// --- Buttons ---------------------------------------------------------------

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: "bg-[#1b3c8a] text-white hover:opacity-90",
  secondary:
    "bg-white text-[#1b3c8a] border border-[#e5eaf5] hover:border-[#1b3c8a]",
  ghost: "bg-transparent text-[#1b3c8a] hover:bg-[#eef4ff]",
  danger: "bg-red-600 text-white hover:opacity-90",
  success: "bg-green-600 text-white hover:opacity-90",
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

export const Select = ({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...rest} className={cx(inputCx, "pr-9", className)}>
    {children}
  </select>
);

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-2">
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
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-[#1b3c8a]" : "bg-[#e5eaf5]"
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
