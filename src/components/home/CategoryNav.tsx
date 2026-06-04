"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";

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

export function CategoryNav({ courses = [] }: { courses?: any[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(prev => prev === id ? null : id);
  };

  return (
    <section style={{ padding: "48px 24px 80px", maxWidth: "1280px", margin: "0 auto" }}>
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
        {categories.map((cat) => {
          const categoryNameInDb = `${cat.emoji} ${cat.name}`;
          const catCourses = courses.filter(c => c.category_name === categoryNameInDb || c.category_name === cat.name);
          const isExpanded = expanded === cat.id;

          return (
            <div key={cat.id} style={{ display: "flex", flexDirection: "column" }}>
              <motion.div
                onClick={(e: any) => toggleExpand(cat.id, e)}
                onHoverStart={() => setHovered(cat.id)}
                onHoverEnd={() => setHovered(null)}
                whileHover={isExpanded ? {} : { y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "var(--bg-card)",
                  border: `2px solid ${hovered === cat.id || isExpanded ? cat.color + "60" : "var(--border-primary)"}`,
                  borderRadius: isExpanded ? "20px 20px 0 0" : "20px",
                  padding: "24px",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: hovered === cat.id || isExpanded ? `0 16px 40px -10px ${cat.color}30` : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s, border-radius 0.2s",
                  zIndex: 2,
                }}
              >
                {/* Gradient blob clipped safely */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  borderRadius: isExpanded ? "18px 18px 0 0" : "18px",
                  pointerEvents: "none"
                }}>
                  <div style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "100px", height: "100px", borderRadius: "50%",
                    background: `${cat.color}12`,
                  }} />
                </div>

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
                  animate={{ opacity: hovered === cat.id || isExpanded ? 1 : 0, x: hovered === cat.id || isExpanded ? 0 : -8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", bottom: "16px", right: "16px",
                    color: cat.color, fontWeight: 800, fontSize: "13px",
                    display: "flex", alignItems: "center", gap: "4px"
                  }}
                >
                  {isExpanded ? "Close ↑" : "Explore ↓"}
                </motion.div>
              </motion.div>

              {/* Dropdown content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "var(--bg-secondary)",
                      border: `2px solid ${cat.color}40`,
                      borderTop: "none",
                      borderRadius: "0 0 20px 20px",
                      padding: "16px",
                      zIndex: 1,
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {catCourses.length > 0 ? (
                        catCourses.map(c => (
                          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Link href={`/learn/${cat.slug}/${c.slug || c.id}`} style={{
                              background: "var(--bg-primary)",
                              border: `1px solid ${cat.color}20`,
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              textDecoration: "none",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = cat.color;
                              (e.currentTarget as HTMLAnchorElement).style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-primary)";
                              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                            }}
                            >
                              {c.title}
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const url = `${window.location.origin}/learn/${cat.slug}/${c.slug || c.id}`;
                                if (navigator.share) {
                                  navigator.share({ title: c.title, url });
                                } else {
                                  navigator.clipboard.writeText(url);
                                  alert("Link copied!");
                                }
                              }}
                              style={{
                                background: "var(--bg-primary)", border: `1px solid ${cat.color}20`, borderRadius: "8px", padding: "6px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = cat.color;
                                e.currentTarget.style.borderColor = cat.color;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--text-secondary)";
                                e.currentTarget.style.borderColor = `${cat.color}20`;
                              }}
                              title="Share Course"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                          No courses available yet.
                        </span>
                      )}
                      
                      <Link href={`/learn/${cat.slug}`} style={{
                        width: "100%",
                        textAlign: "center",
                        marginTop: "8px",
                        padding: "8px",
                        fontSize: "13px",
                        fontWeight: 800,
                        color: cat.color,
                        textDecoration: "none",
                        borderTop: `1px solid ${cat.color}20`,
                        display: "block"
                      }}>
                        View Full Domain →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
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
