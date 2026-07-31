"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type MotionWrapperProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
};

export function MotionWrapper({
  children,
  className,
  delay = 0,
  direction = "up",
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  const offset = direction === "up" ? { y: 20 } : { x: -20 };

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? undefined : { opacity: 0, ...offset }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
