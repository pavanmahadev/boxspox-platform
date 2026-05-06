"use client";
import React from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = () => {
  const particles = Array.from({ length: 30 });
  const colors = ["var(--brand-primary)", "#F59E0B", "#10B981"]; // Mix of primary and amber/orange

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Background Radial Glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 50% 50%, #F8FAFC 0%, #FFFFFF 100%)",
        }}
      />
      
      {/* Grid Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 0%, transparent 100%)",
        }}
      />
      
      {/* Animated Beams */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--brand-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        <Beam delay={0} x1="10%" y1="-10%" x2="40%" y2="110%" />
        <Beam delay={2} x1="30%" y1="-10%" x2="60%" y2="110%" />
        <Beam delay={1} x1="70%" y1="-10%" x2="40%" y2="110%" />
        <Beam delay={3} x1="90%" y1="-10%" x2="60%" y2="110%" />
        <Beam delay={1.5} x1="-10%" y1="20%" x2="110%" y2="50%" />
        <Beam delay={2.5} x1="-10%" y1="70%" x2="110%" y2="40%" />
      </svg>

      {/* Collision Particles Effect */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "200px", display: "flex", justifyContent: "center" }}>
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: 0, 
              x: (Math.random() - 0.5) * 400,
              y: 100 
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.5, 0],
              y: -200 - Math.random() * 200,
              x: (Math.random() - 0.5) * 600
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              borderRadius: "50%",
              background: colors[i % colors.length],
              boxShadow: `0 0 10px ${colors[i % colors.length]}`,
              opacity: 0.8
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Beam = ({ delay, x1, y1, x2, y2 }: { delay: number; x1: string; y1: string; x2: string; y2: string }) => {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="url(#beam-gradient)"
      strokeWidth="2"
      strokeDasharray="100 400"
      initial={{ strokeDashoffset: 500 }}
      animate={{ strokeDashoffset: -500 }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      }}
    />
  );
};
