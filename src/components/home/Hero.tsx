"use client";

import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "160px 20px 0",
      background: "#FFFFFF",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Circular Glow */}
      <div style={{
        position: "absolute",
        bottom: "-40%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "160%",
        aspectRatio: "1/1",
        background: "radial-gradient(circle at 50% 100%, rgba(15, 110, 86, 0.25) 0%, rgba(15, 110, 86, 0.1) 40%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 0
      }} />
      
      {/* Inner Circles */}
      <div style={{
        position: "absolute",
        bottom: "-20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120%",
        aspectRatio: "1/1",
        border: "1px solid rgba(15, 110, 86, 0.15)",
        borderRadius: "50%",
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div className="section-container" style={{ position: "relative", zIndex: 1, textAlign: "center", paddingTop: "40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            Effortless Coding <span style={{ color: "var(--brand-primary)" }}>Learning</span><br />
            That Makes your Life <span style={{ color: "var(--brand-primary)" }}>Easier</span>
          </h1>

          <p style={{
            fontSize: "1.1rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "40px",
            maxWidth: "600px",
            margin: "0 auto 40px",
            fontWeight: 500
          }}>
            Learn to code with a single click. Go from zero skills to a portfolio filled with projects with ease using Boxspox, your favourite educational platform.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "60px" }}>
            <Link href="/register" className="btn-primary" style={{ padding: "14px 36px", fontSize: "15px" }}>
              Get Started <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
