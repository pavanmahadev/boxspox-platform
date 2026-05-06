"use client";

import { motion } from "framer-motion";
import { Code2, TrendingUp, Award, Sparkles, Zap, Star } from "lucide-react";

const features = [
  {
    icon: <Code2 size={24} />,
    title: "Try It Yourself",
    description: "Edit code and see results in real-time with our interactive code editor.",
    color: "#6366f1",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Track Progress",
    description: "Visual dashboards to monitor your learning journey and streaks.",
    color: "#06b6d4",
  },
  {
    icon: <Award size={24} />,
    title: "Get Certified",
    description: "Earn verifiable certificates to showcase your skills on LinkedIn.",
    color: "#f59e0b",
  },
  {
    icon: <Sparkles size={24} />,
    title: "AI Tutor",
    description: "Get instant help from our AI assistant that guides you without giving answers.",
    color: "#10b981",
  },
  {
    icon: <Zap size={24} />,
    title: "Daily Challenges",
    description: "Sharpen your skills with bite-sized coding challenges every day.",
    color: "#ef4444",
  },
  {
    icon: <Star size={24} />,
    title: "Learning Paths",
    description: "Follow structured career tracks from beginner to job-ready developer.",
    color: "#8b5cf6",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export function Features() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--brand-secondary)",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Our Professional Commitment
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              marginTop: "12px",
              letterSpacing: "-1px",
            }}
          >
            Quality Education for Technical &{" "}
            <span className="text-gradient-primary">Non-Technical Success</span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="hover-lift"
              style={{
                padding: "32px",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "var(--radius-md)",
                  background: `${feature.color}18`,
                  color: feature.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
