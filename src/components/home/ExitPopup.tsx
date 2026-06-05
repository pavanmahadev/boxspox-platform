"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import Link from "next/link";

export function ExitPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the popup this session
    if (sessionStorage.getItem("exit_popup_seen")) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the window (intent to close/switch tab)
      if (e.clientY <= 0) {
        setIsVisible(true);
        sessionStorage.setItem("exit_popup_seen", "true");
        // Remove listener after triggering
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            background: "var(--bg-card)",
            width: "100%",
            maxWidth: "480px",
            borderRadius: "24px",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
          }}
        >
          <button
            onClick={() => setIsVisible(false)}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(0,0,0,0.1)",
              border: "none",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          <div style={{ background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)", padding: "40px 32px", textAlign: "center", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.2)", padding: "16px", borderRadius: "50%" }}>
                <Gift size={40} color="#10B981" />
              </div>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px", lineHeight: 1.2 }}>Wait! Before You Go...</h2>
            <p style={{ color: "#D1D5DB", fontSize: "15px", lineHeight: 1.5, margin: 0 }}>
              Don't leave empty-handed. Take an extra <strong>50% OFF</strong> any course or bundle right now!
            </p>
          </div>

          <div style={{ padding: "32px", textAlign: "center" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Use Promo Code
            </div>
            <div style={{ 
              background: "rgba(15, 110, 86, 0.1)", 
              border: "2px dashed var(--brand-primary)", 
              padding: "16px", 
              borderRadius: "12px", 
              fontSize: "32px", 
              fontWeight: 900, 
              color: "var(--brand-primary)", 
              letterSpacing: "2px",
              marginBottom: "24px"
            }}>
              WELCOME50
            </div>
            
            <Link 
              href="/#pricing"
              onClick={() => setIsVisible(false)}
              style={{
                display: "block",
                background: "var(--text-primary)",
                color: "var(--bg-primary)",
                padding: "16px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "16px",
                marginBottom: "16px",
                transition: "transform 0.1s"
              }}
            >
              Claim My Discount Now
            </Link>

            <button 
              onClick={() => setIsVisible(false)}
              style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
            >
              No thanks, I prefer paying full price
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
