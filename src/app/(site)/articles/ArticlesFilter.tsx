"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ArticlesFilter({
  categories,
  activeCategory,
  initialQuery,
}: {
  categories: string[];
  activeCategory: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function apply(cat?: string, query?: string) {
    const params = new URLSearchParams();
    const c = cat === undefined ? activeCategory : cat;
    const qq = query === undefined ? q : query;
    if (c) params.set("category", c);
    if (qq) params.set("q", qq);
    const query_s = params.toString();
    router.push(`/articles${query_s ? `?${query_s}` : ""}`);
  }

  return (
    <div className="mb-10 space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(undefined, q);
        }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو در مقالات…"
            className="w-full h-12 pr-12 pl-5 rounded-full bg-white border border-[#e5eaf5] shadow-sm focus:outline-none focus:border-[#1b3c8a] focus:ring-2 focus:ring-[#1b3c8a]/10"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1b3c8a]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => apply("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === ""
                ? "bg-[#1b3c8a] text-white"
                : "bg-white text-[#1b3c8a] border border-[#e5eaf5] hover:border-[#1b3c8a]"
            }`}
          >
            همه
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => apply(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategory === c
                  ? "bg-[#1b3c8a] text-white"
                  : "bg-white text-[#1b3c8a] border border-[#e5eaf5] hover:border-[#1b3c8a]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
