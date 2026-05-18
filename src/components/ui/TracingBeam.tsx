"use client";
import React, { useRef } from "react";
import {
  motion,
  useTransform,
  useScroll,
  useSpring,
} from "framer-motion";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Use springs for smooth animation
  const ySpring = useSpring(scrollYProgress, { stiffness: 500, damping: 90 });
  
  return (
    <div
      ref={ref}
      className={`relative w-full ${className || ""}`}
    >
      <div className="absolute -left-4 md:-left-12 top-3 h-full">
          <svg
            viewBox="0 0 20 1000"
            className="ml-2 h-full"
            width="20"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="beam-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            </defs>
            {/* Background line */}
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="1000"
              stroke="var(--border-primary)"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            {/* Animated beam */}
          <motion.line
            x1="10"
            y1="0"
            x2="10"
            y2="1000"
              stroke="url(#beam-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
              strokeDasharray: "1000",
              strokeDashoffset: useTransform(ySpring, [0, 1], [1000, 0]),
              }}
            />
          </svg>
        </div>
      <div className="ml-12 md:ml-0">{children}</div>
    </div>
  );
};
