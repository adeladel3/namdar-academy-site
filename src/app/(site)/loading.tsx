export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="flex items-center gap-3 text-[#1b3c8a]/70 text-sm">
        <span
          className="inline-block w-4 h-4 rounded-full border-2 border-[#1b3c8a]/25 border-t-[#1b3c8a] animate-spin"
          aria-hidden
        />
        در حال بارگذاری…
      </div>
    </div>
  );
}
