import { listTestimonials } from "@/lib/db";
import TestimonialsManager from "./TestimonialsManager";

export const dynamic = "force-dynamic";

export default function AdminTestimonialsPage() {
  const testimonials = listTestimonials();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#010514]">
          نظرات دانش‌پذیران
        </h1>
        <p className="text-sm text-[#010514]/55 mt-1">
          Testimonialهایی که در صفحه اصلی و صفحه MON نمایش داده می‌شوند.
        </p>
      </div>
      <TestimonialsManager items={testimonials} />
    </div>
  );
}
