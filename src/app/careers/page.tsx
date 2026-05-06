"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight, Star, Coffee, Zap } from "lucide-react";

const PAGE_TOP = "clamp(128px, 15vw, 160px)";

const jobs = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "Remote / Bengaluru", type: "Full-time" },
  { title: "Product Designer (UI/UX)", team: "Design", location: "Remote", type: "Full-time" },
  { title: "Content Strategist", team: "Education", location: "Remote", type: "Full-time" },
  { title: "Fullstack Developer", team: "Engineering", location: "Remote / Bengaluru", type: "Contract" },
];

export default function CareersPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        paddingTop: PAGE_TOP,
        paddingBottom: "100px",
        paddingLeft: "var(--container-padding)",
        paddingRight: "var(--container-padding)",
        background: "radial-gradient(circle at top right, rgba(99,102,241,0.05), transparent 60%)",
        textAlign: "center"
      }}>
        <div className="section-container" style={{ maxWidth: "900px" }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "24px", letterSpacing: "-2px" }}
          >
            Join the <span style={{ color: "var(--brand-primary)" }}>Future</span> of Learning.
          </motion.h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 40px" }}>
            We&apos;re looking for passionate individuals to help us build the world&apos;s most engaging educational platform.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <a href="#openings" className="btn-primary" style={{ padding: "16px 40px" }}>View Open Roles</a>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section style={{ padding: "100px var(--container-padding)", background: "var(--bg-card)", borderTop: "1px solid var(--border-primary)" }}>
        <div className="section-container">
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, textAlign: "center", marginBottom: "60px" }}>Why Work at Boxspox?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
            {[
              { title: "Remote First", text: "Work from anywhere in the world. We value outcomes over hours.", icon: <Star size={24} /> },
              { title: "Unlimited Growth", text: "We provide a generous budget for books, courses, and conferences.", icon: <Zap size={24} /> },
              { title: "Modern Stack", text: "Work with the latest technologies and influence our architectural decisions.", icon: <Coffee size={24} /> },
            ].map((perk, i) => (
              <div key={i} style={{ padding: "40px", borderRadius: "24px", border: "1px solid var(--border-primary)", background: "var(--bg-primary)" }}>
                <div style={{ color: "var(--brand-primary)", marginBottom: "20px" }}>{perk.icon}</div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>{perk.title}</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{perk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section id="openings" style={{ padding: "120px var(--container-padding)" }}>
        <div className="section-container" style={{ maxWidth: "1000px" }}>
          <div className="careers-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "60px" }}>
            <div>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>Open Positions</h2>
              <p style={{ color: "var(--text-secondary)" }}>Come build something amazing with us.</p>
            </div>
            <div style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{jobs.length} Opportunities</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {jobs.map((job, i) => (
              <Link
                key={i}
                href="#"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "32px",
                  background: "var(--bg-card)",
                  borderRadius: "24px",
                  border: "1px solid var(--border-primary)",
                  transition: "all 0.2s"
                }}
                className="job-card"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>{job.title}</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "var(--text-tertiary)", fontSize: "0.9rem", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Briefcase size={16} /> {job.team}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {job.location}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={16} /> {job.type}</div>
                  </div>
                </div>
                <div className="job-apply-btn" style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                  transition: "all 0.2s",
                  flexShrink: 0
                }}>
                  <ArrowRight size={20} />
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: "60px", textAlign: "center", padding: "40px", background: "var(--bg-secondary)", borderRadius: "24px" }}>
            <h3 style={{ fontWeight: 800, marginBottom: "8px" }}>Don&apos;t see a fit?</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>We&apos;re always looking for talented people. Send us an open application.</p>
            <Link href="mailto:careers@boxspox.com" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>careers@boxspox.com</Link>
          </div>
        </div>
      </section>

      <style>{`
        .job-card:hover { transform: translateY(-4px); border-color: var(--brand-primary) !important; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .job-card:hover .job-apply-btn { background: var(--brand-primary) !important; color: white !important; }
        @media (max-width: 768px) {
          .job-card { flex-direction: column; align-items: flex-start !important; gap: 24px; }
          .job-apply-btn { width: 100% !important; }
          .careers-header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
        }
      `}</style>
    </div>
  );
}
