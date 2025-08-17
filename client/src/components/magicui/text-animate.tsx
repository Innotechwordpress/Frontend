import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

type AnimationType = "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight";
type AnimateBy = "word" | "line" | "character";

interface TextAnimateProps {
  children: string;
  animation?: AnimationType;
  by?: AnimateBy;
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div";
  className?: string;
  delay?: number;
  duration?: number;
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
};

export function TextAnimate({
  children,
  animation = "fadeIn",
  by = "word",
  as: Component = "p",
  className,
  delay = 0,
  duration = 0.5,
}: TextAnimateProps) {
  const animationVariants = animations[animation];

  const segments = useMemo(() => {
    if (by === "line") {
      return children.split("\n").filter(line => line.trim() !== "");
    } else if (by === "word") {
      return children.split(" ");
    } else if (by === "character") {
      return children.split("");
    }
    return [children];
  }, [children, by]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: by === "line" ? 0.3 : by === "word" ? 0.1 : 0.05,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: animationVariants.initial,
    visible: {
      ...animationVariants.animate,
      transition: {
        duration,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className={cn("text-animate-container", className)}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className={cn(
            "inline-block",
            by === "line" && "block",
            by === "word" && "mr-1",
          )}
        >
          {by === "line" ? (
            <Component className="block">{segment}</Component>
          ) : (
            segment + (by === "word" && index < segments.length - 1 ? " " : "")
          )}
        </motion.span>
      ))}
    </motion.div>
  );
}