import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrbitingCirclesDemo } from "@/components/orbiting-circles-demo";

export default function HeroSection() {
  const { toast } = useToast();

  const handleGetStarted = () => {
    toast({
      title: "Get Started",
      description: "Starting signup flow...",
    });
  };

  const handleDemo = () => {
    toast({
      title: "Demo",
      description: "Product demo would be shown here",
    });
  };

  return (
    <section className="relative h-[750px] flex items-center mt-20 mb-[120px] ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">Your{" "}
              pipeline is chaos
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">. Your AI</span>
            <br />
            <span className="text-white">
              team is waiting. Make the switch.
            </span>
          </h1>
          <p className="text-xl text-green-200 mb-6 max-w-4xl mx-auto leading-relaxed">
            Cut operational costs 50%. Boost deal closure 10X.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <Button
              variant="outline"
              onClick={handleDemo}
              size="lg"
              className="bg-green-400 border-green-400 text-black hover:bg-green-400 hover:text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200"
            >
              <Play className="mr-2 h-4 w-4" />
              Book Complete ROI Demo
            </Button>
          </div>

          {/* Orbiting circles below the buttons */}
          <div className="flex justify-center mt-6">
            <OrbitingCirclesDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
