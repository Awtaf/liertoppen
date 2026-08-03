import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MotionWrapperProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
};

/**
 * Reveals content with a short, subtle entrance animation using plain CSS
 * (see the fade-up/fade-left keyframes in globals.css) instead of a
 * JS-driven, scroll-triggered library. A JS/hydration hiccup can never
 * leave content stuck invisible this way — the animation runs on paint
 * and always finishes, and prefers-reduced-motion is honored globally.
 */
export function MotionWrapper({
  children,
  className,
  delay = 0,
  direction = "up",
}: MotionWrapperProps) {
  const animationClass = direction === "left" ? "animate-fade-left" : "animate-fade-up";
  const style: CSSProperties | undefined = delay ? { animationDelay: `${delay}s` } : undefined;

  return (
    <div className={cn(animationClass, className)} style={style}>
      {children}
    </div>
  );
}
