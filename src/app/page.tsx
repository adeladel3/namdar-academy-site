import FigmaStage from "@/components/FigmaStage";
import Landing from "@/components/Landing";
import LandingNavOverlay from "@/components/LandingNavOverlay";
import LandingSearchBox from "@/components/LandingSearchBox";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <FigmaStage>
      <Landing />
      <LandingNavOverlay />
      {/* <LandingSearchBox /> */}
    </FigmaStage>
  );
}
