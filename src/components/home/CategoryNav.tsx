"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  { id: "tech", name: "Technology", emoji: "💻", color: "#0F6E56", slug: "technology", sub: "Web, AI, Cloud, DevOps" },
  { id: "ai", name: "AI & Data Science", emoji: "🤖", color: "#6366F1", slug: "ai-and-data-science", sub: "ML, Deep Learning, LLMs" },
  { id: "mba", name: "MBA & Business", emoji: "📊", color: "#F59E0B", slug: "mba-and-business", sub: "Strategy, Finance, Marketing" },
  { id: "law", name: "Law & Legal", emoji: "⚖️", color: "#2563EB", slug: "law-and-legal", sub: "Constitutional, Corporate, IP" },
  { id: "agri", name: "Agriculture", emoji: "🌾", color: "#15803D", slug: "agriculture", sub: "Agronomy, AgriTech, Farming" },
  { id: "health", name: "Healthcare", emoji: "🏥", color: "#BE123C", slug: "healthcare", sub: "Medicine, Nursing, Research" },
  { id: "eng", name: "Engineering", emoji: "📐", color: "#374151", slug: "engineering", sub: "Civil, Mechanical, Electronics" },
  { id: "design", name: "Design & Creative", emoji: "🎨", color: "#EC4899", slug: "design-and-creative", sub: "UI/UX, Figma, Motion" },
];

export function CategoryNav() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section style={{ padding: "80px 24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "52px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(15, 110, 86, 0.08)", padding: "6px 16px",
          borderRadius: "50px", fontSize: "13px", fontWeight: 700,
          color: "var(--brand-primary)", marginBottom: "16px",
          border: "1px solid rgba(15, 110, 86, 0.2)"
        }}>
          🌍 Universal Learning Platform
        </div>
        <h2 style={{
          fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900,
          color: "var(--text-primary)", letterSpacing: "-1.5px",
          lineHeight: 1.1, marginBottom: "16px"
        }}>
          One Platform. Every Domain.
        </h2>
        <p style={{
          color: "var(--text-secondary)", fontSize: "18px",
          maxWidth: "600px", margin: "0 auto", lineHeight: 1.6
        }}>
          From cutting-edge technology to agricultural science — explore{" "}
          <strong style={{ color: "var(--text-primary)" }}>8 learning domains</strong> with
          world-class expert instructors.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "20px",
        marginBottom: "40px"
      }}>
        {categories.map((cat) => (
          <Link href={`/learn/${cat.slug}`} key={cat.id} style={{ textDecoration: "none" }}>
            <motion.div
              onHoverStart={() => setHovered(cat.id)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "var(--bg-card)",
                border: `2px solid ${hovered === cat.id ? cat.color + "60" : "var(--border-primary)"}`,
                borderRadius: "20px",
                padding: "24px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: hovered === cat.id ? `0 16px 40px -10px ${cat.color}30` : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              {/* Gradient blob */}
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "100px", height: "100px", borderRadius: "50%",
                background: `${cat.color}12`,
                pointerEvents: "none"
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", position: "relative" }}>
                {/* Icon */}
                <div style={{
                  width: "56px", height: "56px", borderRadius: "16px",
                  background: `${cat.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px", flexShrink: 0,
                  border: `1px solid ${cat.color}20`
                }}>
                  {cat.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: "15px", fontWeight: 800,
                    color: "var(--text-primary)", marginBottom: "4px"
                  }}>
                    {cat.name}
                  </h3>
                  <p style={{
                    fontSize: "12px", color: "var(--text-tertiary)",
                    fontWeight: 600, lineHeight: 1.4
                  }}>
                    {cat.sub}
                  </p>
                </div>
              </div>

              {/* Hover arrow */}
              <motion.div
                animate={{ opacity: hovered === cat.id ? 1 : 0, x: hovered === cat.id ? 0 : -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", bottom: "16px", right: "16px",
                  color: cat.color, fontWeight: 800, fontSize: "13px",
                  display: "flex", alignItems: "center", gap: "4px"
                }}
              >
                Explore →
              </motion.div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <Link href="/learn" style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "14px 32px", borderRadius: "14px",
          border: "2px solid var(--brand-primary)",
          color: "var(--brand-primary)", textDecoration: "none",
          fontWeight: 800, fontSize: "15px",
          transition: "all 0.2s"
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--brand-primary)";
            (e.currentTarget as HTMLAnchorElement).style.color = "white";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--brand-primary)";
          }}
        >
          🗂️ View All Learning Domains
        </Link>
      </div>
    </section>
  );
}


