import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function AnimatedWrapper({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.3,
  direction = "up" 
}: AnimatedWrapperProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 20, opacity: 0 };
      case "down": return { y: -20, opacity: 0 };
      case "left": return { x: 20, opacity: 0 };
      case "right": return { x: -20, opacity: 0 };
      default: return { y: 20, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut" 
      }}
      style={{ willChange: "auto" }}
      onAnimationComplete={() => {
        // Remove will-change after animation completes to prevent continuous updates
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredContainer({ 
  children, 
  className,
  staggerDelay = 0.1 
}: { 
  children: ReactNode[]; 
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedWrapper key={index} delay={index * staggerDelay}>
          {child}
        </AnimatedWrapper>
      ))}
    </div>
  );
}