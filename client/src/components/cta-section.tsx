import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import keyBenefitsImage from "@assets/ChatGPT Image Jun 8, 2025, 06_26_12 PM_1749387418360.png";

const benefits = [
  {
    title: "Automate the Chaos",
    description: "From inbox overload to scattered to-dos — NarrisiaAI centralizes and streamlines every task using contextual intelligence."
  },
  {
    title: "AI That Understands Work",
    description: "Our proprietary models don't just automate — they understand context, intent, and priority to act like a proactive teammate, not a script."
  },
  {
    title: "Unified Communication Layer",
    description: "Calls, emails, and calendar interactions are seamlessly integrated and intelligently routed, so you never miss what matters."
  },
  {
    title: "Built for Human Momentum",
    description: "You focus on decisions. We handle the details — scheduling, follow-ups, summaries, and system updates happen automatically."
  },
  {
    title: "Effortless Scaling for Teams",
    description: "Whether you're solo or scaling, our agentic architecture grows with you — managing permissions, workflows, and capacity in real time."
  }
];

export default function CTASection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Key Benefits */}
          <div className="space-y-6 ml-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ y: -100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                className="bg-gray-900/60 border border-gray-700/40 rounded-lg p-6 hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right side - Key Benefits Image */}
          <div className="relative flex justify-end overflow-hidden ml-[-43px] mr-[-43px]">
            <div className="relative w-full max-w-md overflow-hidden ml-[-20px] mr-[-20px]">
              <img
                src={keyBenefitsImage}
                alt="Key Benefits"
                className="w-full h-auto object-contain mix-blend-screen ml-[82px] mr-[82px]"
                style={{
                  clipPath: "inset(0 35% 0 0)",
                  transform: "scale(1.2)",
                  transformOrigin: "left center",
                  filter: "brightness(1.2) contrast(1.1)",
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
