"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Code2, Zap, Layout } from "lucide-react";

const SandpackEditor = dynamic(() => import("@/components/editor/SandpackEditor"), {
  ssr: false,
});

export function EditorPreview() {
  return (
    <>
      <section style={{ padding: "var(--section-spacing) 0", background: "var(--bg-secondary)" }}>
        <div className="section-container">
          <div className="editor-preview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "var(--h2-size)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "24px", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}>
                Learn by <span style={{ color: "var(--brand-primary)" }}>Doing</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--body-size)", lineHeight: 1.6, marginBottom: "32px" }}>
                Our interactive editor allows you to write, test, and preview your code directly in the browser. No complex setup required.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  { icon: <Zap size={18} color="var(--brand-primary)" />, title: "Real-time Preview", desc: "See your changes instantly as you type." },
                  { icon: <Code2 size={18} color="var(--brand-primary)" />, title: "Code Intelligence", desc: "Get suggestions and error highlights." },
                  { icon: <Layout size={18} color="var(--brand-primary)" />, title: "Multiple Frameworks", desc: "Support for React, Vue, HTML/CSS and more." },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", gap: "16px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "var(--bg-card)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{item.title}</div>
                      <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              style={{
                position: "relative"
              }}
            >
              {/* Decorative Glow */}
              <div style={{
                position: "absolute",
                top: "-10%",
                left: "-10%",
                right: "-10%",
                bottom: "-10%",
                background: "radial-gradient(circle at 50% 50%, rgba(15, 110, 86, 0.1) 0%, transparent 70%)",
                zIndex: 0,
                pointerEvents: "none"
              }} />

              <div style={{
                background: "#1E293B",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                position: "relative",
                zIndex: 1
              }}>
                {/* Window Header */}
                <div style={{
                  height: "40px",
                  background: "#111827",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  gap: "8px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", background: "#FF5F56", borderRadius: "50%" }} />
                    <div style={{ width: "10px", height: "10px", background: "#FFBD2E", borderRadius: "50%" }} />
                    <div style={{ width: "10px", height: "10px", background: "#27C93F", borderRadius: "50%" }} />
                  </div>
                  <div style={{ 
                    flex: 1, 
                    textAlign: "center", 
                    fontSize: "12px", 
                    color: "rgba(255,255,255,0.4)", 
                    fontWeight: 600, 
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.5px"
                  }}>
                    boxspox_editor — index.html
                  </div>
                </div>

                <div style={{ padding: "12px" }}>
                  <SandpackEditor
                    template="vanilla"
                    files={{
                      "/index.html": `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; text-align: center; padding: 2rem; color: #1e293b; }
      h1 { color: #0F6E56; font-size: 2.5rem; margin-bottom: 1rem; }
      .btn { background: #0F6E56; color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-weight: bold; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>Build Something 🚀</h1>
    <p>Type code on the left, see it alive on the right!</p>
    <button class="btn" onclick="alert('Boxspox is Ready!')">Launch App</button>
  </body>
</html>`,
                      "/index.js": ""
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 1024px) {
          .editor-preview-grid {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }
        }
      `}</style>
    </>
  );
}
