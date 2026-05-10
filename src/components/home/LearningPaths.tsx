"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Monitor,
  Server,
  Cpu,
  Shield,
  Globe,
  Terminal,
  Zap,
  ArrowRight
} from "lucide-react";

const paths = [
  {
    title: "Frontend Developer",
    desc: "Master the art of building beautiful, responsive, and high-performance user interfaces.",
    skills: ["HTML5", "CSS3", "JavaScript", "React", "Next.js"],
    icon: <Monitor size={32} />,
    color: "#04AA6D",
    bg: "#ebf7f1",
    slug: "frontend"
  },
  {
    title: "Backend Architect",
    desc: "Build scalable APIs, manage databases, and master server-side logic.",
    skills: ["Node.js", "Python", "SQL", "PostgreSQL", "Redis"],
    icon: <Server size={32} />,
    color: "#6366f1",
    bg: "#eff0fe",
    slug: "backend"
  },
  {
    title: "AI & Data Science",
    desc: "Dive into machine learning, data analysis, and the future of artificial intelligence.",
    skills: ["Python", "NumPy", "Pandas", "Scikit-Learn", "OpenAI"],
    icon: <Cpu size={32} />,
    color: "#f43f5e",
    bg: "#fef1f2",
    slug: "ai-data"
  },
  {
    title: "Cybersecurity Pro",
    desc: "Learn to protect systems, networks, and data from digital attacks.",
    skills: ["Networking", "Linux", "Ethical Hacking", "Cryptography"],
    icon: <Shield size={32} />,
    color: "#f59e0b",
    bg: "#fef8ee",
    slug: "cybersecurity"
  }
];

export function LearningPaths() {
  return (
    <section style={{ padding: "clamp(40px, 8vw, 80px) 0", background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: "var(--h2-size)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}
          >
            Explore Our <span style={{ color: "var(--brand-primary)" }}>Professional Roadmaps</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ color: "var(--text-secondary)", fontSize: "var(--body-size)", maxWidth: "700px", margin: "0 auto" }}
          >
            Structured roadmaps designed to take you from absolute beginner to industry-ready professional.
          </motion.p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "var(--container-padding)"
        }}>
          {paths.map((path, i) => (
            <motion.div
              key={path.title}
              className="path-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                padding: "48px 40px",
                border: "1px solid var(--border-primary)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-12px)";
                e.currentTarget.style.boxShadow = `0 20px 40px -12px ${path.color}15`;
                e.currentTarget.style.borderColor = path.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "var(--border-primary)";
              }}
            >
              {/* Background Glow */}
              <div style={{
                position: "absolute",
                top: "-20%",
                right: "-20%",
                width: "120px",
                height: "120px",
                background: path.color,
                filter: "blur(60px)",
                opacity: 0.05,
                pointerEvents: "none"
              }} />

              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "22px",
                background: `${path.color}10`,
                color: path.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "32px",
                border: `1px solid ${path.color}20`
              }}>
                {path.icon}
              </div>

              <h3 style={{ 
                fontSize: "24px", 
                fontWeight: 900, 
                marginBottom: "20px", 
                color: "var(--text-primary)",
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.5px"
              }}>
                {path.title}
              </h3>

              <p style={{ 
                color: "var(--text-secondary)", 
                marginBottom: "40px", 
                fontSize: "15px", 
                lineHeight: 1.7,
                fontWeight: 500
              }}>
                {path.desc}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "48px" }}>
                {path.skills.map(skill => (
                  <span key={skill} style={{
                    padding: "8px 16px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    transition: "all 0.2s ease"
                  }}>
                    {skill}
                  </span>
                ))}
              </div>

              <Link
                href={`/paths/${path.slug}`}
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: path.color,
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: "15px",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                Explore Roadmap <ArrowRight size={20} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .path-card {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
