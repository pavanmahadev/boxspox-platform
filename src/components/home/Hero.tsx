"use client";

import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
import { ChevronRight, Play, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const SandpackEditor = dynamic(() => import("@/components/editor/SandpackEditor"), {
  ssr: false,
  loading: () => <div style={{ height: "400px", background: "#1e293b", borderRadius: "12px", animation: "pulse 2s infinite" }} />
});

export function Hero() {
  return (
    <section style={{
      minHeight: "90vh",
      display: "flex",
      alignItems: "center",
      padding: "clamp(100px, 15vh, 140px) 0 80px",
      background: "#FFFFFF",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorative Elements */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "50%",
        aspectRatio: "1/1",
        background: "radial-gradient(circle, rgba(15, 110, 86, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        zIndex: 0
      }} />

      <div className="section-container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
          gap: "60px",
          alignItems: "center"
        }}>
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(15, 110, 86, 0.05)",
              color: "var(--brand-primary)",
              padding: "8px 16px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "24px",
              border: "1px solid rgba(15, 110, 86, 0.1)"
            }}>
              <Sparkles size={14} />
              <span>New: Interactive AI-Powered Learning</span>
            </div>

            <h1 style={{
              fontSize: "var(--h1-size)",
              fontWeight: 900,
              color: "var(--text-primary)",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: "24px",
              fontFamily: "var(--font-heading)"
            }}>
              Master Coding with <br />
              <span style={{
                background: "linear-gradient(135deg, var(--brand-primary), #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Zero Friction</span>
            </h1>

            <p style={{
              fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "40px",
              maxWidth: "540px",
              fontWeight: 500
            }}>
              Go from absolute beginner to building professional-grade projects. Interactive tutorials, a live browser-based editor, and an AI tutor ready to help 24/7.
            </p>

            <div className="hero-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              <Link href="/register" className="btn-primary hero-btn-primary" style={{ padding: "16px 40px", fontSize: "16px", display: "flex", justifyContent: "center" }}>
                Start Learning Free <ChevronRight size={18} />
              </Link>
              <Link href="/tutorials" className="hover-lift hero-btn-secondary" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
                padding: "16px 20px"
              }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={14} fill="currentColor" />
                </div>
                Browse Courses
              </Link>
            </div>
          </motion.div>

          {/* Right Visual (Interactive Editor Mockup) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative" }}
          >
            <div className="hero-visual" style={{
              background: "#1E293B",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 40px 80px -15px rgba(0,0,0,0.3), 0 20px 40px -20px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
            }}>
              <div style={{ height: "36px", background: "#0F172A", display: "flex", alignItems: "center", padding: "0 16px", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", background: "#FF5F56", borderRadius: "50%" }} />
                  <div style={{ width: "10px", height: "10px", background: "#FFBD2E", borderRadius: "50%" }} />
                  <div style={{ width: "10px", height: "10px", background: "#27C93F", borderRadius: "50%" }} />
                </div>
                <div style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>interactive_lesson.html</div>
              </div>
              <div style={{ padding: "8px" }}>
                <SandpackEditor
                  template="vanilla"
                  files={{
                    "/index.html": `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background: #0f172a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      .card { border: 2px solid #0F6E56; padding: 2rem; border-radius: 1rem; text-align: center; }
      h1 { color: #10B981; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Hello Boxspox!</h1>
      <p>Edit this code to see magic.</p>
    </div>
  </body>
</html>`
                  }}
                />
              </div>
            </div>

            {/* Floating Achievement Card */}
            <motion.div
              className="hero-floating-card"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "-30px",
                background: "white",
                padding: "16px 24px",
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                zIndex: 2,
                border: "1px solid var(--border-primary)"
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color="var(--brand-primary)" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Task Completed!</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>+50 XP Earned</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          section { text-align: center; }
          .section-container > div { grid-template-columns: 1fr !important; }
          h1 { margin-left: auto; margin-right: auto; }
          p { margin-left: auto; margin-right: auto; }
          .hero-buttons { justify-content: center; }
          .hero-visual { transform: none !important; margin-top: 40px; }
          .hero-floating-card { 
            left: 50% !important; 
            transform: translateX(-50%) translateY(var(--tw-translate-y, 0)) !important; 
            bottom: -30px !important;
            width: max-content;
          }
        }
        @media (max-width: 640px) {
          .hero-buttons { flex-direction: column; width: 100%; }
          .hero-btn-primary, .hero-btn-secondary { width: 100%; padding: 14px 20px !important; }
          .hero-floating-card { display: none !important; }
        }
      `}</style>
    </section>
  );
}

