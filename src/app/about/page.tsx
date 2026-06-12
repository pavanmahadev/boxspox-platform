"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Globe, Target, Shield, Heart, Award } from "lucide-react";

// --nav-height (64px) + --subnav-height (44px) = 108px total
const PAGE_TOP = "clamp(128px, 15vw, 160px)";

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section style={{
        paddingTop: PAGE_TOP,
        paddingBottom: "100px",
        paddingLeft: "var(--container-padding)",
        paddingRight: "var(--container-padding)",
        background: "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-primary) 100%)",
        textAlign: "center",
        borderBottom: "1px solid var(--border-primary)"
      }}>
        <div className="section-container" style={{ maxWidth: "800px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span style={{
              color: "var(--brand-primary)",
              fontWeight: 800,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              display: "block",
              marginBottom: "16px"
            }}>Our Mission</span>
            <h1 style={{
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              fontWeight: 900,
              color: "var(--text-primary)",
              marginBottom: "24px",
              lineHeight: 1.1,
              letterSpacing: "-2px"
            }}>
              Empowering the next generation of{" "}
              <span style={{ color: "var(--brand-primary)" }}>digital creators.</span>
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
              Pandaschool is a global community of learners, creators, and innovators. We believe that everyone should have access to world-class coding education.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "80px var(--container-padding)" }}>
        <div className="section-container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            textAlign: "center"
          }}>
            {[
              { label: "Students Worldwide", value: "2M+", icon: <Users size={32} /> },
              { label: "Countries Reached", value: "150+", icon: <Globe size={32} /> },
              { label: "Courses Published", value: "500+", icon: <Target size={32} /> },
              { label: "Hours Learned", value: "50M+", icon: <Award size={32} /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ padding: "32px", background: "var(--bg-card)", borderRadius: "24px", border: "1px solid var(--border-primary)" }}
              >
                <div style={{ color: "var(--brand-primary)", marginBottom: "16px", display: "flex", justifyContent: "center" }}>{stat.icon}</div>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "4px" }}>{stat.value}</div>
                <div style={{ color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ padding: "100px var(--container-padding)", background: "var(--bg-card)" }}>
        <div className="section-container">
          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "24px" }}>The Pandaschool Story</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p>Founded in 2024, Pandaschool started with a simple idea: coding shouldn't be boring or prohibitively expensive. We wanted to create a platform that feels like a studio—creative, inspiring, and professional.</p>
                <p>What began as a small collection of web development tutorials has grown into a comprehensive ecosystem of learning paths, interactive playgrounds, and professional certifications.</p>
                <p>Our team is composed of developers, designers, and educators who are passionate about open-source and the future of the web.</p>
              </div>
            </div>
            <div style={{
              aspectRatio: "4/3",
              background: "linear-gradient(135deg, var(--brand-primary) 0%, #06b6d4 100%)",
              borderRadius: "32px",
              boxShadow: "0 20px 40px rgba(15, 110, 86, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem"
            }}>
              🚀
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: "120px var(--container-padding)" }}>
        <div className="section-container">
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Our Core Values</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            {[
              { title: "Transparency", text: "We believe in clear communication and honest relationships with our community.", icon: <Shield /> },
              { title: "Inclusion", text: "Education is for everyone, regardless of background or financial status.", icon: <Heart /> },
              { title: "Excellence", text: "We push the boundaries of quality in everything we build and teach.", icon: <Award /> },
            ].map((value, i) => (
              <div key={i} style={{ padding: "40px", borderRadius: "24px", border: "1px solid var(--border-primary)" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", marginBottom: "24px" }}>{value.icon}</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>{value.title}</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
