import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import analyticsIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.06.44_ec555d5d-removebg-preview_1749091548825.png";
import emailIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.09_fe652bc2-removebg-preview_1749091548825.png";
import callIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_52ed53c3-removebg-preview_1749091548825.png";
import searchIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_75c2388d-removebg-preview_1749091548825.png";
import schedulingIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_be02aded-removebg-preview_1749091548825.png";
import communicationIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_b3ba4b23-removebg-preview_1749091548825.png";
import integrationIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.01.10_cc1e99eb-removebg-preview_1749091548825.png";
import qualityAssuranceIcon from "@assets/WhatsApp_Image_2025-06-05_at_01.06.44_1e6cf9e8-removebg-preview_1749126818600.png";
import narrisiaLogo from "@assets/WhatsApp_Image_2025-06-05_at_01.03.43_01fa41d3-removebg-preview_1749091176821.png";

export function OrbitingCirclesDemo() {
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Orbital Animation Container */}
      <div className="relative flex h-[600px] w-full max-w-full flex-col items-center justify-center overflow-hidden">
        {/* Circular background matching outermost orbit size */}
        <div
          className="absolute rounded-full"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, #081f1f 0%, #061a1a 50%, #0a1e1e 100%)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
        />
        {/* Animated wave background effect like reference image */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Multiple animated wave layers */}
          <div
            className="absolute w-full h-full opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 800px 400px at 20% 30%, rgba(0, 252, 190, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 600px 300px at 80% 70%, rgba(64, 224, 255, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse 500px 250px at 40% 80%, rgba(255, 165, 0, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 700px 350px at 70% 20%, rgba(255, 105, 180, 0.08) 0%, transparent 50%)
              `,
              animation: 'waveFloat 20s ease-in-out infinite'
            }}
          />
          
          <div
            className="absolute w-full h-full opacity-25"
            style={{
              background: `
                radial-gradient(ellipse 600px 300px at 60% 40%, rgba(0, 252, 190, 0.12) 0%, transparent 60%),
                radial-gradient(ellipse 800px 400px at 30% 80%, rgba(64, 224, 255, 0.1) 0%, transparent 60%),
                radial-gradient(ellipse 400px 200px at 80% 30%, rgba(255, 165, 0, 0.08) 0%, transparent 60%)
              `,
              animation: 'waveFloat 25s ease-in-out infinite reverse'
            }}
          />
          
          <div
            className="absolute w-full h-full opacity-20"
            style={{
              background: `
                radial-gradient(ellipse 500px 250px at 70% 60%, rgba(0, 252, 190, 0.1) 0%, transparent 70%),
                radial-gradient(ellipse 700px 350px at 40% 20%, rgba(64, 224, 255, 0.08) 0%, transparent 70%),
                radial-gradient(ellipse 300px 150px at 20% 70%, rgba(255, 105, 180, 0.06) 0%, transparent 70%)
              `,
              animation: 'waveFloat 30s ease-in-out infinite'
            }}
          />

          {/* Central area background from logo to first ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '230px',
              height: '230px',
              background: 'radial-gradient(circle, rgba(100, 255, 180, 0.2) 0%, rgba(80, 240, 160, 0.15) 40%, rgba(60, 220, 140, 0.1) 70%, transparent 100%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
          />

          {/* Area between first and second ring - darker shade of ring 1 green */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle, transparent 0%, transparent 33%, rgba(30, 180, 100, 0.15) 35%, rgba(25, 160, 90, 0.12) 50%, rgba(20, 140, 80, 0.1) 70%, rgba(15, 120, 70, 0.08) 85%, transparent 100%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
          />

          {/* Area between second and third ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '470px',
              height: '470px',
              background: 'radial-gradient(circle, transparent 0%, transparent 37%, rgba(20, 140, 80, 0.12) 40%, rgba(15, 120, 70, 0.1) 55%, rgba(10, 100, 60, 0.08) 75%, rgba(8, 80, 50, 0.06) 90%, transparent 100%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
          />

          {/* Area between third and fourth ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '590px',
              height: '590px',
              background: 'radial-gradient(circle, transparent 0%, transparent 40%, rgba(10, 100, 60, 0.1) 42%, rgba(8, 80, 50, 0.08) 60%, rgba(5, 60, 40, 0.06) 80%, rgba(3, 40, 30, 0.04) 95%, transparent 100%)',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
          />

          {/* Colored orbital path rings - subtle green shades */}
          {[
            { radius: 115, color: 'rgba(50, 255, 150, 0.3)', shadow: 'rgba(50, 255, 150, 0.1)' }, // Bright light green
            { radius: 175, color: 'rgba(0, 200, 120, 0.3)', shadow: 'rgba(0, 200, 120, 0.1)' }, // Medium green
            { radius: 235, color: 'rgba(0, 150, 90, 0.3)', shadow: 'rgba(0, 150, 90, 0.1)' }, // Dark green
            { radius: 295, color: 'rgba(0, 100, 60, 0.3)', shadow: 'rgba(0, 100, 60, 0.1)' }  // Very deep green
          ].map(({ radius, color, shadow }, index) => (
            <div
              key={`orbit-ring-${index}`}
              className="absolute pointer-events-none"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                borderRadius: '50%',
                border: `1px solid ${color}`,
                boxShadow: `
                  0 0 15px ${shadow},
                  inset 0 0 15px ${shadow}
                `,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                opacity: 0.7
              }}
            />
          ))}
        </div>

        {/* 4 orbital rings with 2 icons each - 180 degrees apart using CSS animation delays */}
        
        {/* First orbit - Call Analyzer & Reporting (180 degrees apart) */}
        <div className="absolute flex items-center justify-center orbit-container" style={{
          width: '270px',
          height: '270px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 4
        }}>
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '230px',
              height: '230px',
              animationDuration: '12s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={callIcon} alt="Call Analyzer Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Call Analyzer Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '240px',
              height: '240px',
              animationDuration: '12s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: '-6s'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={analyticsIcon} alt="Reporting Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Reporting Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second orbit - Connect Email & Fetch Email (180 degrees apart) */}
        <div className="absolute flex items-center justify-center orbit-container" style={{
          width: '390px',
          height: '390px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3
        }}>
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '350px',
              height: '350px',
              animationDuration: '16s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: 'reverse'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={integrationIcon} alt="Connect Email Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Connect Email Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '360px',
              height: '360px',
              animationDuration: '16s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: 'reverse',
              animationDelay: '-8s'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={emailIcon} alt="Fetch Unread Email" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Fetch Unread Email</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third orbit - Deep Research & Schedule Meeting (180 degrees apart) */}
        <div className="absolute flex items-center justify-center orbit-container" style={{
          width: '510px',
          height: '510px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}>
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '470px',
              height: '470px',
              animationDuration: '20s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={searchIcon} alt="Deep Research Company Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Deep Research Company Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '470px',
              height: '470px',
              animationDuration: '20s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: '-10s'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={qualityAssuranceIcon} alt="Quality Assurance Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Quality Assurance Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fourth orbit - Prioritize Emails & Schedule Meeting (180 degrees apart) */}
        <div className="absolute flex items-center justify-center orbit-container" style={{
          width: '630px',
          height: '630px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          <div 
            className="absolute animate-spin rounded-full"
            style={{
              width: '590px',
              height: '590px',
              animationDuration: '24s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: 'reverse'
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={communicationIcon} alt="Prioritize Emails Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Prioritize Emails Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="orbit-icon drop-shadow-[0_8px_16px_rgba(0,252,190,0.4)] hover:drop-shadow-[0_12px_24px_rgba(0,252,190,0.6)] relative group">
                <img src={schedulingIcon} alt="Schedule Meeting Agent" className="w-12 h-12 object-contain brightness-125 contrast-150 saturate-150 drop-shadow-lg" />
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="relative bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-lg shadow-lg border border-green-300">
                    <div className="text-xs font-semibold">Schedule Meeting Agent</div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Logo - No background */}
        <div className="relative z-10 text-center">
          <img src={narrisiaLogo} alt="Narrisia AI - Central Intelligence" className="w-28 h-28 object-contain drop-shadow-[0_4px_12px_rgba(0,252,190,0.5)]" />
        </div>
      </div>

      
    </div>
  );
}