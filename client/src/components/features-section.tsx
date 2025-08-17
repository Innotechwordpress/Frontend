import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Import orbital system icons
import analyticsIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.06.44_ec555d5d-removebg-preview_1749091548825.png";
import emailIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.09_fe652bc2-removebg-preview_1749091548825.png";
import callIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_52ed53c3-removebg-preview_1749091548825.png";
import searchIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_75c2388d-removebg-preview_1749091548825.png";
import schedulingIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_be02aded-removebg-preview_1749091548825.png";
import communicationIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_b3ba4b23-removebg-preview_1749091548825.png";
import integrationIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_cc1e99eb-removebg-preview_1749091548825.png";
import qualityAssuranceIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.06.44_1e6cf9e8-removebg-preview_1749126818600.png";

const features = [
  {
    icon: callIcon,
    title: "Call Analyzer Agent",
    description: "Analyzes call recordings, extracts key insights, action items, and generates detailed meeting summaries",
    badge: "Voice AI",
    badgeColor: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
    delay: "0ms",
  },
  {
    icon: analyticsIcon,
    title: "Reporting Agent",
    description: "Generates comprehensive reports, analytics, and insights from all agent activities and communications",
    badge: "Analytics",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
    delay: "100ms",
  },
  {
    icon: integrationIcon,
    title: "Connect Email Agent",
    description: "Seamlessly integrates with your email system to establish secure connections and monitor incoming communications",
    badge: "Integration",
    badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    delay: "200ms",
  },
  {
    icon: emailIcon,
    title: "Fetch Unread Email",
    description: "Automatically retrieves and categorizes unread emails, filtering out spam and low-priority messages",
    badge: "Automation",
    badgeColor: "bg-green-500/20 text-green-400 border border-green-500/30",
    delay: "300ms",
  },
  {
    icon: searchIcon,
    title: "Deep Research Company Agent",
    description: "Conducts comprehensive research on companies, contacts, and business contexts for informed decision-making",
    badge: "Intelligence",
    badgeColor: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    delay: "400ms",
  },
  {
    icon: schedulingIcon,
    title: "Schedule Meeting Agent",
    description: "Intelligently coordinates calendars, finds optimal meeting times, and sends automated scheduling requests",
    badge: "Calendar Sync",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    delay: "500ms",
  },
  {
    icon: communicationIcon,
    title: "Prioritize Emails Agent",
    description: "Uses AI algorithms to rank emails by urgency, importance, and business impact for optimal workflow",
    badge: "Smart Sorting",
    badgeColor: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    delay: "600ms",
  },
  {
    icon: qualityAssuranceIcon,
    title: "Quality Assurance Agent",
    description: "Monitors and validates all agent outputs, ensuring accuracy, compliance, and adherence to business standards",
    badge: "Quality Control",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    delay: "700ms",
  },
];

export default function FeaturesSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cardTransforms, setCardTransforms] = useState<{[key: number]: {rotateX: number, rotateY: number, glowX: number, glowY: number}}>({});

  const handleMouseEnter = (index: number, event: React.MouseEvent) => {
    setHoveredCard(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseMove = (index: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to card center
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    // Calculate rotation based on mouse position (stronger effect)
    const rotateY = (mouseX / rect.width) * 20; // Horizontal tilt
    const rotateX = -(mouseY / rect.height) * 20; // Vertical tilt
    
    // Calculate glow position as percentage
    const glowX = ((event.clientX - rect.left) / rect.width) * 100;
    const glowY = ((event.clientY - rect.top) / rect.height) * 100;
    
    setCardTransforms(prev => ({
      ...prev,
      [index]: { rotateX, rotateY, glowX, glowY }
    }));
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
    setCardTransforms({});
  };

  return (
    <section className="py-12 md:py-20 bg-black relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <Badge className="mb-4 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs md:text-sm">
            POWERFUL FEATURES FOR AI APPS
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-green-400 to-cyan-400 mb-8 md:mb-12 px-4">
            Everything you need to automate your day
          </h2>
        </div>

        {/* Feature Cards Grid - 4 columns */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const transform = cardTransforms[index];
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={feature.title}
                className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-200 hover:border-green-500/40 animate-scale-in cursor-pointer group hover:bg-white/10 relative overflow-hidden"
                style={{ 
                  animationDelay: feature.delay,
                  transform: transform 
                    ? `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(1.05)`
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseMove={(e) => handleMouseMove(index, e)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Glow effect that follows cursor */}
                {isHovered && transform && (
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(200px circle at ${transform.glowX}% ${transform.glowY}%, rgba(34, 197, 94, 0.4), transparent 70%)`
                    }}
                  />
                )}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-all duration-300 p-1">
                    <img 
                      src={feature.icon} 
                      alt={feature.title}
                      className="w-full h-full object-contain filter brightness-100 group-hover:brightness-110 transition-all duration-300"
                      style={{ mixBlendMode: 'screen' }}
                    />
                  </div>
                </div>
                <h3 className="font-bold text-white text-center text-sm leading-tight group-hover:text-green-400 transition-colors duration-300 drop-shadow-lg" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {feature.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Popup */}
      {hoveredCard !== null && (
        <div 
          className="fixed bg-gray-900/95 backdrop-blur-md border border-green-500/40 rounded-xl p-5 max-w-sm shadow-2xl shadow-green-500/20 z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center mr-3 p-1">
              <img 
                src={features[hoveredCard].icon} 
                alt={features[hoveredCard].title}
                className="w-full h-full object-contain filter brightness-100"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
            <h4 className="font-semibold text-green-400 text-base">
              {features[hoveredCard].title}
            </h4>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {features[hoveredCard].description}
          </p>
          <Badge className="bg-green-500/15 text-green-400 border border-green-500/30 text-xs px-2 py-1">
            {features[hoveredCard].badge}
          </Badge>
        </div>
      )}
    </section>
  );
}
