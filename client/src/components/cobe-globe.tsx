import { useEffect, useRef } from 'react';

interface CobeGlobeProps {
  className?: string;
}

export default function CobeGlobe({ className = "" }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    let phi = 0;

    const loadGlobe = async () => {
      if (!canvasRef.current) return;

      try {
        // Import Cobe library
        const createGlobe = (await import('cobe')).default;

        globeRef.current = createGlobe(canvasRef.current, {
          devicePixelRatio: 2,
          width: 1200,
          height: 1200,
          phi: 0,
          theta: 0.2,
          dark: 1,
          diffuse: 1.2,
          scale: 1.1,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: [0.1, 0.3, 0.2],
          markerColor: [0.2, 0.9, 0.4],
          glowColor: [0.2, 0.8, 0.4],
          offset: [0, 0],
          markers: [
            { location: [37.7595, -122.4367], size: 0.06 }, // San Francisco
            { location: [40.7128, -74.006], size: 0.04 },   // New York
            { location: [51.5074, -0.1278], size: 0.04 },   // London
            { location: [35.6762, 139.6503], size: 0.04 },  // Tokyo
            { location: [19.0760, 72.8777], size: 0.03 },   // Mumbai
            { location: [-33.8688, 151.2093], size: 0.03 }, // Sydney
            { location: [-23.5505, -46.6333], size: 0.03 }, // São Paulo
          ],
          onRender: (state: any) => {
            state.phi = phi;
            phi += 0.003;
          },
        });
      } catch (error) {
        console.error('Error loading Cobe globe:', error);
      }
    };

    loadGlobe();

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width="1200"
      height="1200"
      className={`w-full h-full ${className}`}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}