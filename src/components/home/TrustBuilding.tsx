"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Award, Users, TrendingUp } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Data Scientist at TechCorp",
    image: "https://i.pravatar.cc/150?u=rahul",
    text: "The AI & Data Science bundle completely transformed my career. Within 3 months of completing the curriculum, I landed my dream job. The practical projects were exactly what interviewers were looking for.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Senior Frontend Developer",
    image: "https://i.pravatar.cc/150?u=priya",
    text: "I loved the Real-time Editor. It made learning React and Next.js so much faster. I didn't have to worry about local setup, I could just code directly in the browser and see results instantly.",
    rating: 5
  },
  {
    name: "Amit Kumar",
    role: "Freelance Digital Marketer",
    image: "https://i.pravatar.cc/150?u=amit",
    text: "The SEO and Marketing modules are top-notch. I applied the strategies to my own consulting business and saw a 40% increase in organic traffic in just a few weeks. Highly recommend Boxspox!",
    rating: 5
  }
];

export function TrustBuilding() {
  return (
    <section style={{ padding: "80px 0", background: "var(--bg-secondary)", position: "relative", overflow: "hidden" }}>
      <div className="section-container">
        
        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
          marginBottom: "80px"
        }}>
          {[
            { icon: <Users size={32} color="var(--brand-primary)" />, stat: "50,000+", label: "Active Students" },
            { icon: <Star size={32} color="#F59E0B" />, stat: "4.9/5", label: "Average Rating" },
            { icon: <Award size={32} color="#3B82F6" />, stat: "12,000+", label: "Certificates Issued" },
            { icon: <TrendingUp size={32} color="#10B981" />, stat: "85%", label: "Placement Rate" }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)",
                padding: "32px",
                borderRadius: "20px",
                textAlign: "center",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{ background: "rgba(15, 110, 86, 0.1)", padding: "16px", borderRadius: "50%" }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
                {s.stat}
              </div>
              <div style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 600 }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            Don't Just Take Our <span style={{ color: "var(--brand-primary)" }}>Word For It</span>
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Read real success stories from students who have transformed their careers using our platform.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px"
        }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)",
                padding: "32px",
                borderRadius: "20px",
                border: "1px solid var(--border-primary)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} size={18} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              
              <p style={{ color: "var(--text-primary)", fontSize: "16px", lineHeight: 1.6, flex: 1, marginBottom: "24px", fontStyle: "italic" }}>
                "{t.text}"
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img src={t.image} alt={t.name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px" }}>{t.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
