import type { Metadata } from "next";
import FigmaStage from "@/components/FigmaStage";
import Landing from "@/components/Landing";
import LandingMobile from "@/components/LandingMobile";
import LandingNavOverlay from "@/components/LandingNavOverlay";

export const revalidate = 60;

// Home uses the default un-templated title from root layout so the branded
// line renders clean without an added "| نامدار آکادمی" suffix.
export const metadata: Metadata = {
  title: {
    absolute: "نامدار آکادمی | مرجع آموزش ترید و سرمایه‌گذاری",
  },
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Mobile / tablet: proper fluid, stacked layout that reflows for any
          screen width below the `lg` breakpoint. */}
      <LandingMobile />

      {/* Desktop (≥ lg): the Figma-exported hero with absolute positioning,
          scaled via FigmaStage. Hidden on small screens because its 1920px
          canvas can't reflow — LandingMobile handles those. */}
      <div className="hidden lg:block">
        <FigmaStage>
          <Landing />
          <LandingNavOverlay />
        </FigmaStage>
      </div>
    </>
  );
}
