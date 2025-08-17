import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import aiHeadImage from "@assets/ChatGPT Image Jun 2, 2025, 01_21_20 PM.png";
import aiAgentImage from "@assets/ChatGPT Image Jun 2, 2025, 01_28_57 PM.png";
import aiWorkflowImage from "@assets/ChatGPT Image Jun 2, 2025, 01_33_55 PM.png";
import globeImage from "@assets/image_1751206348925.png";
import CobeGlobe from "@/components/cobe-globe";

export default function About() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {/* Hero Section with Globe */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Clean background */}
        <div className="absolute inset-0 bg-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start min-h-[600px]">
            {/* Left side - Content */}
            <div className="text-left relative z-20 mt-8 lg:mt-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-green-400 mb-4 md:mb-6 drop-shadow-lg drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] leading-tight">
                Transform Your Business Operations<br />
                with AI That Actually Works
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 md:mb-8 leading-relaxed">
                The intelligent automation platform that's revolutionizing how millions of
                businesses operate.
              </p>
            </div>

            {/* Right side - Interactive 3D Globe */}
            <div className="relative w-full h-96 md:h-screen flex items-center justify-center -mt-16 md:-mt-20">
              {/* Globe Container */}
              <div className="relative w-[600px] h-[600px] md:w-[700px] md:h-[700px] animate-blur-in delay-100">
                <CobeGlobe className="w-full h-full" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Orchestration Platform Section with Design Line */}
      <section className="py-16 md:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400 mb-6">
              AI ORCHESTRATION PLATFORM
            </h2>
            <p className="text-xl md:text-2xl text-white mb-2">
              NarrisiaAI is the easiest place
            </p>
            <p className="text-xl md:text-2xl text-white mb-8">
              to automate work with AI
            </p>
            <h3 className="text-2xl md:text-3xl font-semibold text-green-200 mb-12">
              Why Choose NarrisiaAI as Your AI Orchestration Platform?
            </h3>
          </div>

          {/* Design Line with Interactive Cards */}
          <div className="relative mb-16">
            {/* Curved connecting lines - inspired by the reference */}
            <div className="hidden md:block absolute inset-0 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M200 200 Q400 100 600 200 Q800 300 1000 200" 
                  stroke="url(#gradient)" 
                  strokeWidth="2" 
                  fill="none"
                  className="opacity-60"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              
              {/* Card 1 - Left */}
              <div className="relative group">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-500/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6 mx-auto group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-white mb-4 text-center">
                    Intelligent Automation
                  </h4>
                  <p className="text-green-200 text-center text-sm leading-relaxed">
                    Transform manual workflows into intelligent processes that learn and adapt to your business needs
                  </p>
                  
                  {/* Mini chart visualization */}
                  <div className="mt-6 flex justify-center">
                    <div className="flex items-end space-x-1">
                      <div className="w-2 h-4 bg-green-300 rounded-t"></div>
                      <div className="w-2 h-6 bg-green-400 rounded-t"></div>
                      <div className="w-2 h-8 bg-green-500 rounded-t"></div>
                      <div className="w-2 h-5 bg-green-400 rounded-t"></div>
                    </div>
                  </div>
                </div>
                
                {/* Connection dot */}
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-black hidden md:block shadow-lg"></div>
              </div>

              {/* Card 2 - Center */}
              <div className="relative group">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-500/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6 mx-auto group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-white mb-4 text-center">
                    Multi-Agent Coordination
                  </h4>
                  <p className="text-green-200 text-center text-sm leading-relaxed">
                    Orchestrate multiple AI agents working together to handle complex business operations seamlessly
                  </p>
                  
                  {/* Network visualization */}
                  <div className="mt-6 flex justify-center">
                    <div className="relative w-16 h-8">
                      <div className="absolute top-0 left-2 w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="absolute top-0 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute bottom-0 left-6 w-3 h-3 bg-green-600 rounded-full"></div>
                      <div className="absolute top-1 left-3 w-8 h-px bg-green-400"></div>
                      <div className="absolute top-2 left-7 w-6 h-px bg-green-500 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
                
                {/* Connection dots */}
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-black hidden md:block shadow-lg"></div>
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-black hidden md:block shadow-lg"></div>
              </div>

              {/* Card 3 - Right */}
              <div className="relative group">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-500/30 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6 mx-auto group-hover:bg-green-500/30 transition-colors">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-semibold text-white mb-4 text-center">
                    Enterprise Security
                  </h4>
                  <p className="text-green-200 text-center text-sm leading-relaxed">
                    Bank-grade security with compliance standards that protect your data and maintain business integrity
                  </p>
                  
                  {/* Security badge */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                      <span className="text-green-400 text-xs font-medium">SOC 2 Compliant</span>
                    </div>
                  </div>
                </div>
                
                {/* Connection dot */}
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-black hidden md:block shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your AI Transformation
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
              Schedule Free Demo
            </button>
          </div>
        </div>
      </section>

      {/* AI Platform Section */}
      <section className="py-12 md:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          

          {/* Two column layout */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="px-4">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6">
                Deploy sophisticated AI workflows without technical expertise. Our intuitive platform makes enterprise AI accessible to every team.
              </h3>
              <p className="text-base md:text-lg text-green-200 mb-4 md:mb-6">
                From small teams to global enterprises, NarrisiaAI scales your operational capacity without scaling your headcount.
              </p>
              <Button variant="link" className="text-green-400 hover:text-green-300 p-0 font-medium text-sm md:text-base">
                Explore all AI integrations →
              </Button>
            </div>
            <div className="relative px-4">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 md:p-8 min-h-[200px] md:min-h-[300px] flex items-center justify-center shadow-lg shadow-green-500/10">
                <img 
                  src={aiAgentImage} 
                  alt="AI Agent Automation" 
                  className="w-full h-auto max-w-xs md:max-w-sm opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* AI Templates Section */}
      <section className="py-12 md:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 text-xs md:text-sm">
              TEMPLATES
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 px-4">
              Start quickly with these AI templates
            </h2>
          </div>

          

          <div className="text-center px-4">
            <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10 px-6 md:px-8 py-3 text-sm md:text-base">
              Explore all templates
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}