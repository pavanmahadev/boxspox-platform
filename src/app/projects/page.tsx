"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Filter, Rocket, Palette, Database, Shield, Globe } from "lucide-react";
import React, { useState } from "react";

import { projects } from "@/data/projects";

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");

  return (
    <div style={{ paddingTop: "112px", background: "var(--bg-secondary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)", padding: "60px 0" }}>
        <div className="section-container">
          <h1 style={{ fontSize: "40px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-heading)" }}>
            Project-Based <span style={{ color: "var(--brand-primary)" }}>Learning</span>
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "600px" }}>
            Don't just learn syntax. Build real-world applications that you can add to your portfolio.
          </p>
        </div>
      </div>

      <div className="section-container" style={{ padding: "60px 24px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", overflowX: "auto", paddingBottom: "8px" }} className="hide-scrollbar">
          {["All", "Frontend", "Backend", "Full Stack", "Advanced"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                background: filter === f ? "var(--brand-primary)" : "white",
                color: filter === f ? "white" : "#4B5563",
                border: "1px solid var(--border-primary)",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {projects.filter(p => filter === "All" || p.category === filter || (filter === "Advanced" && p.difficulty === "Advanced")).map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                background: "var(--bg-card)",
                borderRadius: "16px",
                padding: "32px",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "48px", height: "48px", background: "var(--bg-tertiary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {project.icon}
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-primary)", background: "#E1F5EE", padding: "4px 10px", borderRadius: "6px" }}>
                  {project.difficulty}
                </span>
              </div>
              
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{project.title}</h3>
                <p style={{ color: "var(--text-tertiary)", fontSize: "14px", lineHeight: 1.5 }}>{project.description}</p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-tertiary)", padding: "4px 8px", borderRadius: "4px" }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <Link href={`/projects/${project.id}`} style={{ 
                marginTop: "12px",
                padding: "12px",
                textAlign: "center",
                borderRadius: "10px",
                background: "#111827",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                View Project Details <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
