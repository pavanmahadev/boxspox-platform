"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Frontend Developer at Google",
    content: "Boxspox helped me master React in weeks. The project-based approach is exactly what I needed to land my dream job.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Chen",
    role: "CS Student",
    content: "The AI tutor is a lifesaver. It explains 'why' something is wrong, not just 'how' to fix it. Best learning platform I've used.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Michael Smith",
    role: "Self-taught Developer",
    content: "From knowing nothing to building full-stack apps. The curriculum is so well structured and easy to follow.",
    avatar: "https://i.pravatar.cc/150?u=mike"
  }
];

export function Testimonials() {
  return (
    <section style={{ padding: "100px 0", background: "var(--bg-secondary)" }}>
      <div className="section-container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            What Our <span style={{ color: "var(--brand-primary)" }}>Students</span> Say
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={20} color="#FBBF24" fill="#FBBF24" />)}
          </div>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Trusted by 50,000+ learners worldwide</p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "32px" 
        }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)",
                padding: "40px",
                borderRadius: "24px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                border: "1px solid var(--border-primary)",
                position: "relative"
              }}
            >
              <Quote style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.05 }} size={60} />
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "32px", fontStyle: "italic", fontSize: "16px" }}>
                "{t.content}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img src={t.avatar} alt={t.name} style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid var(--brand-primary)" }} />
                <div>
                  <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px" }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
