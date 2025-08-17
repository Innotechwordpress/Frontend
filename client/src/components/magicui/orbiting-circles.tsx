import { cn } from "@/lib/utils";
import React from "react";

export interface OrbitingCirclesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
  useSemicircle?: boolean;
  pauseOnHover?: boolean;
  onIconClick?: () => void;
}

// Helper functions for semicircle calculations
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 30,
  speed = 1,
  useSemicircle = false,
  pauseOnHover = false,
  onIconClick,
  ...props
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed;
  const count = React.Children.count(children);

  // For semicircle mode, render multiple children distributed along arc
  if (useSemicircle) {
    return (
      <>
        {path && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute inset-0 size-full"
          >
            <path
              d={describeArc(50, 50, radius / 4, -90, 90)}
              stroke="white"
              strokeOpacity="0.1"
              fill="none"
              transform="scale(4)"
            />
          </svg>
        )}
        {React.Children.map(children, (child, index) => {
          const angle = (180 / (count - 1)) * index - 90;
          return (
            <div
              key={index}
              style={
                {
                  "--duration": calculatedDuration,
                  "--radius": radius,
                  "--angle": angle,
                  "--icon-size": `${iconSize}px`,
                } as React.CSSProperties
              }
              className={cn(
                `absolute flex size-[var(--icon-size)] transform-gpu animate-semicircle items-center justify-center rounded-full`,
                { "[animation-direction:reverse]": reverse },
                className
              )}
              {...props}
            >
              {child}
            </div>
          );
        })}
      </>
    );
  }

  // Original full circle orbit for single child
  return (
    <div
      style={
        {
          "--duration": calculatedDuration,
          "--radius": radius,
        } as React.CSSProperties
      }
      className={cn(
        "absolute flex transform-gpu animate-orbit items-center justify-center rounded-full group",
        { 
          "[animation-direction:reverse]": reverse
        },
        className,
      )}
      {...props}
    >
      <div 
        className={cn(
          "flex items-center justify-center transition-all duration-300",
          pauseOnHover && "hover:scale-110 hover:cursor-pointer"
        )}
        style={{ width: iconSize, height: iconSize }}
        onClick={onIconClick}
      >
        {children}
      </div>
    </div>
  );
}