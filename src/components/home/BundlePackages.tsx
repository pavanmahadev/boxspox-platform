"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Database, Shield, Megaphone, Cloud } from "lucide-react";
import Link from "next/link";

const bundles = [
  {
    id: "ai-data",
    title: "AI & Data Science Bundle",
    icon: <Database size={32} color="#6366F1" />,
    courses: 8,
    projects: 12,
    bg: "rgba(99, 102, 241, 0.1)",
    description: "Master Machine Learning, Deep Learning, NLP, and Data Analytics.",
  },
  {
    id: "full-stack",
    title: "Full Stack Development Bundle",
    icon: <Briefcase size={32} color="#0F6E56" />,
    courses: 6,
    projects: 15,
    bg: "rgba(15, 110, 86, 0.1)",
    description: "Learn React, Node.js, Next.js, and modern web architecture.",
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Bundle",
    icon: <Shield size={32} color="#EF4444" />,
    courses: 5,
    projects: 8,
    bg: "rgba(239, 68, 68, 0.1)",
    description: "Ethical Hacking, Penetration Testing, and Network Security.",
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing Bundle",
    icon: <Megaphone size={32} color="#F59E0B" />,
    courses: 7,
    projects: 10,
    bg: "rgba(245, 158, 11, 0.1)",
    description: "SEO, SEM, Social Media Marketing, and Content Strategy.",
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Bundle",
    icon: <Cloud size={32} color="#3B82F6" />,
    courses: 6,
    projects: 14,
    bg: "rgba(59, 130, 246, 0.1)",
    description: "AWS, Docker, Kubernetes, CI/CD, and Infrastructure as Code.",
  }
];

export function BundlePackages() {
  return (
    <section style={{ padding: "80px 0", background: "#FFFFFF", position: "relative" }}>
      <div className="section-container">
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            Career-Ready <span style={{ color: "var(--brand-primary)" }}>Bundles</span>
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Don't just learn a tool, master an entire career path. Our comprehensive bundles guarantee job readiness.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {bundles.map((bundle, i) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid var(--border-primary)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s, box-shadow 0.3s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px -10px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: bundle.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                {bundle.icon}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                {bundle.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.5, flex: 1 }}>
                {bundle.description}
              </p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", borderTop: "1px solid var(--border-primary)", paddingTop: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  📚 {bundle.courses} Courses
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                  💻 {bundle.projects} Projects
                </div>
              </div>

              <Link href={`/bundles/${bundle.id}`} style={{
                display: "block",
                textAlign: "center",
                padding: "12px",
                background: "rgba(15, 110, 86, 0.05)",
                color: "var(--brand-primary)",
                borderRadius: "10px",
                fontWeight: 800,
                fontSize: "14px",
                textDecoration: "none",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(15, 110, 86, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(15, 110, 86, 0.05)"}
              >
                View Bundle
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
