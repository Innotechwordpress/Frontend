import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const meteors = new Array(number).fill(true);
  return (
    <>
      {meteors.map((_, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rounded-[9999px] bg-green-400 shadow-[0_0_0_1px_#22c55e20] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[80px] before:h-[1px] before:bg-gradient-to-r before:from-[#22c55e] before:to-transparent",
            className
          )}
          style={{
            top: Math.random() * -100 + "px",
            left: Math.floor(Math.random() * (window?.innerWidth || 1200)) + "px",
            animationDelay: Math.random() * (3 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (8 - 3) + 3) + "s",
          }}
        ></span>
      ))}
    </>
  );
};