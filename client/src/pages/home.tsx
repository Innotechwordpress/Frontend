import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import WhatIsNarrisia from "@/components/what-is-narrisia";
import FeaturesSection from "@/components/features-section";
import CTASection from "@/components/cta-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import { MeteorDemo } from "@/components/meteors";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-16 sm:pt-20">
        <MeteorDemo />
        <WhatIsNarrisia />
        <FeaturesSection />
        <CTASection />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
