"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { faDigits, formatRelative } from "@/lib/formatting";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: number;
  mine: boolean;
};

export default function CourseReviewsSection({
  courseSlug,
  canReview,
  authenticated,
}: {
  courseSlug: string;
  canReview: boolean;
  authenticated: boolean;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/reviews`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews ?? []);
        setAvg(data.avg ?? 0);
        setCount(data.count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!authenticated) {
      router.push(`/login?next=/courses/${courseSlug}`);
      return;
    }
    if (comment.trim().length < 5) {
      setMsg("لطفاً نظر کامل‌تری بنویسید");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "خطا در ارسال");
        return;
      }
      setMsg(
        data.pending
          ? "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود."
          : "نظر شما ثبت شد."
      );
      setComment("");
      setRating(5);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-[#010514]">
          نظرات دانش‌پذیران
        </h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={avg} />
            <span className="text-sm text-[#010514]/65">
              {faDigits(avg.toFixed(1))} از {faDigits(count)} نظر
            </span>
          </div>
        )}
      </div>

      {canReview && (
        <form
          onSubmit={submit}
          className="bg-white rounded-3xl border border-[#e5eaf5] p-6 mb-5"
        >
          <h3 className="font-bold text-[#010514] mb-3">نظر شما</h3>
          <div className="mb-3">
            <StarsInput value={rating} onChange={setRating} />
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="تجربه شما از این دوره..."
            className="w-full px-4 py-3 rounded-xl border border-[#e5eaf5] bg-[#f7fafd] focus:outline-none focus:border-[#1b3c8a]"
          />
          <div className="flex items-center justify-between mt-3">
            {msg && (
              <p className="text-sm text-[#1b3c8a]">{msg}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mr-auto px-6 py-2.5 rounded-full bg-[#1b3c8a] text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting ? "در حال ارسال..." : "ارسال نظر"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-10 text-center text-[#010514]/55 text-sm">
          در حال بارگذاری...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-10 text-center text-[#010514]/55 text-sm border border-dashed border-[#e5eaf5] rounded-2xl bg-white">
          هنوز نظری ثبت نشده است. اولین نفر باشید!
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="bg-white rounded-2xl border border-[#e5eaf5] p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#136cb5] to-[#49bbbd] text-white font-bold text-sm flex items-center justify-center">
                  {r.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#010514] text-sm">
                    {r.name}
                  </div>
                  <div className="text-[11px] text-[#010514]/55">
                    {formatRelative(r.createdAt)}
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              <p className="text-sm text-[#010514]/75 leading-7 whitespace-pre-line">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#f7cf5a" : "#e5eaf5"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function StarsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} ستاره`}
          className="transition hover:scale-110"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={i <= value ? "#f7cf5a" : "#e5eaf5"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
