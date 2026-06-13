"use client";

import React from "react";
import { motion } from "framer-motion";

const PAGE_TOP = "clamp(128px, 15vw, 160px)";

export default function CommunityPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <section style={{
        paddingTop: PAGE_TOP,
        paddingBottom: "100px",
        paddingLeft: "var(--container-padding)",
        paddingRight: "var(--container-padding)",
        background: "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-primary) 100%)",
        textAlign: "center",
        borderBottom: "1px solid var(--border-primary)"
      }}>
        <div className="section-container" style={{ maxWidth: "800px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{
              color: "var(--brand-primary)",
              fontWeight: 800,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              display: "block",
              marginBottom: "16px"
            }}>Resources</span>
            <h1 style={{
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: "24px",
              lineHeight: 1.1,
              letterSpacing: "-2px"
            }}>
              Community
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
              Join thousands of developers worldwide. Connect, collaborate, and learn together. Coming soon.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
