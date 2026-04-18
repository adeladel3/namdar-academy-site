"use client";

import { useEffect, useRef } from "react";
import { cx } from "./ui";

/**
 * Lightweight rich-text editor based on contentEditable + document.execCommand.
 * Outputs clean HTML. Zero external dependencies.
 *
 * Supported actions: bold, italic, underline, H2, H3, UL, OL, link, quote,
 * hr, clear formatting. Pasted content has formatting stripped to plain text.
 */

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (lastValueRef.current !== value && value !== el.innerHTML) {
      el.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    const el = ref.current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false, arg);
    flush();
  }

  function flush() {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function makeLink() {
    const href = prompt("آدرس لینک را وارد کنید");
    if (!href) return;
    exec("createLink", href);
  }

  const BTN = "w-8 h-8 rounded-lg hover:bg-[#f7fafd] text-[#010514]/70 flex items-center justify-center text-sm";

  return (
    <div className="rounded-2xl border border-[#e5eaf5] bg-white overflow-hidden focus-within:border-[#1b3c8a] focus-within:ring-2 focus-within:ring-[#1b3c8a]/15 transition">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#eef2f7] bg-[#f7fafd] flex-wrap">
        <button type="button" className={BTN} onClick={() => exec("bold")} title="پررنگ">
          <b>B</b>
        </button>
        <button type="button" className={BTN} onClick={() => exec("italic")} title="ایتالیک">
          <i>I</i>
        </button>
        <button type="button" className={BTN} onClick={() => exec("underline")} title="زیرخط">
          <u>U</u>
        </button>
        <span className="w-px h-5 bg-[#e5eaf5] mx-1" />
        <button
          type="button"
          className={BTN}
          onClick={() => exec("formatBlock", "<H2>")}
          title="تیتر بزرگ"
        >
          H2
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => exec("formatBlock", "<H3>")}
          title="تیتر کوچک"
        >
          H3
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => exec("formatBlock", "<P>")}
          title="پاراگراف"
        >
          P
        </button>
        <span className="w-px h-5 bg-[#e5eaf5] mx-1" />
        <button
          type="button"
          className={BTN}
          onClick={() => exec("insertUnorderedList")}
          title="فهرست نقطه‌ای"
        >
          •
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => exec("insertOrderedList")}
          title="فهرست شماره‌دار"
        >
          ۱.
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => exec("formatBlock", "<BLOCKQUOTE>")}
          title="نقل قول"
        >
          ❝
        </button>
        <span className="w-px h-5 bg-[#e5eaf5] mx-1" />
        <button type="button" className={BTN} onClick={makeLink} title="لینک">
          🔗
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => exec("unlink")}
          title="حذف لینک"
        >
          ⛔
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => exec("insertHorizontalRule")}
          title="خط جدا‌کننده"
        >
          —
        </button>
        <span className="w-px h-5 bg-[#e5eaf5] mx-1" />
        <button
          type="button"
          className={cx(BTN, "text-red-600")}
          onClick={() => exec("removeFormat")}
          title="پاک کردن فرمت"
        >
          ✕
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={flush}
        onPaste={onPaste}
        dir="rtl"
        suppressContentEditableWarning
        className="px-4 py-3 min-h-[180px] max-h-[420px] overflow-auto text-[#010514] leading-8 focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder ?? "متن خود را بنویسید..."}
      />
    </div>
  );
}
