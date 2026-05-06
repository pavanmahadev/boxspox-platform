"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code, Shield, Palette } from "lucide-react";

const projects = [
  {
    title: "SaaS Dashboard",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
    tech: ["Next.js", "Supabase", "Tailwind"],
    difficulty: "Advanced"
  },
  {
    title: "Fitness Tracker",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80",
    tech: ["React", "Firebase", "Chart.js"],
    difficulty: "Intermediate"
  },
  {
    title: "AI Chat Interface",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=400&q=80",
    tech: ["TypeScript", "OpenAI API", "CSS"],
    difficulty: "Beginner"
  }
];

export function ProjectsPreview() {
  return (
    <section style={{ padding: "100px 0", background: "#111827", color: "white" }}>
      <div className="section-container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            Build <span style={{ color: "var(--brand-primary)" }}>Real-World</span> Projects
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            The best way to learn is by building. Choose from our library of projects and start coding.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px"
        }}>
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{
                background: "#1F2937",
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid #374151"
              }}
            >
              <div style={{ height: "200px", overflow: "hidden" }}>
                <img src={project.image} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
              </div>
              <div style={{ padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-primary)", background: "rgba(15,110,86,0.1)", padding: "4px 10px", borderRadius: "6px" }}>
                    {project.difficulty}
                  </span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}>{project.title}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                  {project.tech.map(t => (
                    <span key={t} style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", background: "#374151", padding: "4px 8px", borderRadius: "4px" }}>{t}</span>
                  ))}
                </div>
                <Link href="/projects" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "14px"
                }}>
                  Start Project <ArrowRight size={16} color="var(--brand-primary)" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
