"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Code2,
  Database,
  Terminal,
  Cpu,
  Layout,
  Layers,
  Boxes,
  FileCode,
  Monitor,
  BrainCircuit,
  Box,
  Braces
} from "lucide-react";

const trendingItems = [
  { name: "Python", category: "Programming", icon: <Terminal size={24} color="#3776ab" />, rank: "#1" },
  { name: "Java", category: "Programming", icon: <Code2 size={24} color="#f8981d" />, rank: "#2" },
  { name: "JavaScript", category: "Web Dev", icon: <FileCode size={24} color="#f7df1e" />, rank: "#3" },
  { name: "C++", category: "Programming", icon: <Terminal size={24} color="#00599c" />, rank: "#4" },
  { name: "SQL", category: "Databases", icon: <Database size={24} color="#00758f" />, rank: "#5" },
  { name: "ReactJS", category: "Web Dev", icon: <Layers size={24} color="#61dafb" />, rank: "#6" },
  { name: "DSA", category: "CS", icon: <Boxes size={24} color="#04AA6D" />, rank: "#7" },
  { name: "Machine Learning", category: "AI", icon: <BrainCircuit size={24} color="#ff4d4d" />, rank: "#8" },
  { name: "Docker", category: "DevOps", icon: <Box size={24} color="#2496ed" />, rank: "#9" },
  { name: "Spring Boot", category: "Java", icon: <Monitor size={24} color="#6db33f" />, rank: "#10" },
  { name: "HTML", category: "Web Dev", icon: <Layout size={24} color="#e34c26" />, rank: "#11" },
  { name: "CSS", category: "Web Dev", icon: <Braces size={24} color="#264de4" />, rank: "#12" },
];

export function TrendingTutorials() {
  return (
    <section style={{ padding: "60px 0", background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Trending Tutorials
          </h2>
          <span style={{
            background: "#04AA6D",
            color: "white",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Popular
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px"
        }}>
          {trendingItems.map((item, i) => {
            const categoryMap: Record<string, string> = {
              "AI": "ai-and-data-science",
              "Web Dev": "technology",
              "Programming": "technology",
              "CS": "technology",
              "DevOps": "technology",
              "Java": "technology"
            };
            const catSlug = categoryMap[item.category] || "technology";
            return (
              <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}
                >
                  <Link
                    href={`/learn/${catSlug}/${item.name.toLowerCase().replace(" ", "-")}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "20px",
                      background: "var(--bg-card)",
                      borderRadius: "16px",
                      border: "1px solid var(--border-primary)",
                      textDecoration: "none",
                      position: "relative"
                    }}
                  >
                <span style={{
                  position: "absolute",
                  top: "10px",
                  right: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#ccc"
                }}>
                  {item.rank}
                </span>

                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>

                <div>
                  <h4 style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "2px"
                  }}>
                    {item.name}
                  </h4>
                  <p style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: "var(--text-tertiary)"
                  }}>
                    {item.category}
                  </p>
                </div>
              </Link>
            </motion.div>
          ); })}
        </div>
      </div>
    </section>
  );
}
