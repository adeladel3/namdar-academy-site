import FigmaStage from "@/components/FigmaStage";
import Landing from "@/components/Landing";
import LandingNavOverlay from "@/components/LandingNavOverlay";

export default function Home() {
  return (
    <FigmaStage>
      <Landing />
      <LandingNavOverlay />
    </FigmaStage>
  );
}
