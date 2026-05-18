"use client";

import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";




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


            <h1 style={{
              fontSize: "var(--h1-size)",
              fontWeight: 900,
              color: "var(--text-primary)",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: "24px",
              fontFamily: "var(--font-heading)"
            }}>
              Master the Most <br />
              <span style={{ 
                background: "linear-gradient(135deg, var(--brand-primary), #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>In-Demand Skills</span>
            </h1>

            <p style={{
              fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: "40px",
              maxWidth: "540px",
              fontWeight: 500
            }}>
              Learn Java, Python, TypeScript, React, and more. Improve your skills with interactive lessons and tell people you are ready for the future.
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

          {/* Right Visual (Running Tech Cards) */}
          <div style={{ 
            position: "relative", 
            height: "450px", 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
            overflow: "hidden"
          }}>
            {/* Background Glow */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(15, 110, 86, 0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
              zIndex: 0
            }} />

            {/* Row 1: Moving Left */}
            <div className="marquee-row" style={{ display: "flex", width: "max-content", animation: "scrollLeft 20s linear infinite" }}>
              <div style={{ display: "flex", gap: "20px", paddingRight: "20px" }}>
                {[
                  { name: "Java", logo: "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg" },
                  { name: "Python", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" },
                  { name: "TypeScript", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" },
                  { name: "React", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
                ].map((tech, index) => (
                  <div key={index} style={{
                    background: "white",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid #f0f0f0",
                    minWidth: "180px"
                  }}>
                    <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={tech.logo} alt={tech.name} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tech.name}</span>
                  </div>
                ))}
              </div>
              {/* Duplicate for seamless loop */}
              <div style={{ display: "flex", gap: "20px", paddingRight: "20px" }}>
                {[
                  { name: "Java", logo: "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg" },
                  { name: "Python", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" },
                  { name: "TypeScript", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" },
                  { name: "React", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
                ].map((tech, index) => (
                  <div key={`dup-${index}`} style={{
                    background: "white",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid #f0f0f0",
                    minWidth: "180px"
                  }}>
                    <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={tech.logo} alt={tech.name} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Moving Right */}
            <div className="marquee-row" style={{ display: "flex", width: "max-content", animation: "scrollRight 20s linear infinite" }}>
              <div style={{ display: "flex", gap: "20px", paddingRight: "20px" }}>
                {[
                  { name: "Next.js", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" },
                  { name: "Node.js", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" },
                  { name: "Docker", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg" },
                  { name: "Git", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg" },
                ].map((tech, index) => (
                  <div key={index} style={{
                    background: "white",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid #f0f0f0",
                    minWidth: "180px"
                  }}>
                    <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={tech.logo} alt={tech.name} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tech.name}</span>
                  </div>
                ))}
              </div>
              {/* Duplicate for seamless loop */}
              <div style={{ display: "flex", gap: "20px", paddingRight: "20px" }}>
                {[
                  { name: "Next.js", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" },
                  { name: "Node.js", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg" },
                  { name: "Docker", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg" },
                  { name: "Git", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg" },
                ].map((tech, index) => (
                  <div key={`dup-${index}`} style={{
                    background: "white",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    border: "1px solid #f0f0f0",
                    minWidth: "180px"
                  }}>
                    <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={tech.logo} alt={tech.name} style={{ maxWidth: "100%", maxHeight: "100%" }} />
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @media (max-width: 1024px) {
          section { text-align: center; }
          .section-container > div { grid-template-columns: 1fr !important; }
          h1 { margin-left: auto; margin-right: auto; }
          p { margin-left: auto; margin-right: auto; }
          .hero-buttons { justify-content: center; }
        }
        @media (max-width: 640px) {
          .hero-buttons { flex-direction: column; width: 100%; }
          .hero-btn-primary, .hero-btn-secondary { width: 100%; padding: 14px 20px !important; }
        }
      `}</style>
    </section>
  );
}
