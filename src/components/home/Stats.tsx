"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Code2, Award } from "lucide-react";

const stats = [
  { number: "50+", label: "Tutorials", icon: <BookOpen size={20} /> },
  { number: "10K+", label: "Learners", icon: <Users size={20} /> },
  { number: "200+", label: "Exercises", icon: <Code2 size={20} /> },
  { number: "15+", label: "Certificates", icon: <Award size={20} /> },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export function Stats() {
  return (
    <section style={{ padding: "40px 0 80px" }}>
      <motion.div
        className="section-container"
        variants={stagger}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
        }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            style={{
              textAlign: "center",
              padding: "32px 16px",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              transition: "transform 0.3s ease",
            }}
            className="hover-lift"
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--brand-primary)",
              }}
            >
              {stat.icon}
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {stat.number}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
