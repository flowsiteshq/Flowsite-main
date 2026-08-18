import { motion, useInView } from "framer-motion";
import { useRef, ReactNode, useState, useEffect } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

/**
 * ScrollReveal — animates children into view.
 * Falls back to immediately visible if IntersectionObserver doesn't fire
 * (e.g. in iframes, server-side, or when element is already in viewport).
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.65,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0 });
  const [forceVisible, setForceVisible] = useState(false);

  // Safety fallback: if not triggered after 800ms, force visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceVisible(true);
    }, 800 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const directionMap = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { y: 0, x: 20 },
    right: { y: 0, x: -20 },
  };

  const offset = directionMap[direction];
  const shouldShow = isInView || forceVisible;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={shouldShow ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration,
        delay: shouldShow && !forceVisible ? delay / 1000 : 0,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
