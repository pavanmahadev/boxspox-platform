"use client";

import { motion } from "framer-motion";
import React, { useRef, useEffect } from "react";

export interface NotchItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface NotchProps {
  items: NotchItem[];
  activeId: string;
  onChange: (id: string) => void;
  activeColor?: string;
}

export function Notch({ items, activeId, onChange, activeColor = "#0F6E56" }: NotchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatically scroll the active item into view without shifting the whole page
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const activeElement = container.querySelector('[data-active="true"]') as HTMLElement;
      if (activeElement) {
        // Calculate the center position relative to the container
        const scrollLeft = activeElement.offsetLeft - (container.clientWidth / 2) + (activeElement.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeId]);

  return (
    <div ref={containerRef} className="notch-container" style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px",
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px)",
      borderRadius: "9999px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)",
      border: "1px solid rgba(0,0,0,0.08)",
      maxWidth: "100%",
      overflowX: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none"
    }}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            data-active={isActive}
            style={{
              flexShrink: 0,
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: "9999px",
              color: isActive ? "#ffffff" : "#475569",
              fontWeight: 700,
              fontSize: "15px",
              transition: "color 0.2s ease",
              outline: "none",
              whiteSpace: "nowrap"
            }}
          >
            {isActive && (
              <motion.div
                layoutId="notch-active-pill"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: activeColor,
                  borderRadius: "9999px",
                  zIndex: -1
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
              {item.icon} <span className={isActive ? "" : "hide-on-mobile"}>{item.label}</span>
            </span>
          </button>
        );
      })}
      <style>{`
        .notch-container::-webkit-scrollbar {
          display: none;
        }
        /* Safely center overflowing flex items without clipping */
        .notch-container::before,
        .notch-container::after {
          content: '';
          margin: auto;
        }
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
