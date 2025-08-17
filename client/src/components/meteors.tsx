import { Meteors } from "@/components/magicui/meteors";
import HeroSection from "./hero-section";

export function MeteorDemo() {
  return (
    <div className="relative w-full overflow-hidden border border-black">
      <Meteors number={50} />
      <HeroSection />
    </div>
  );
}
