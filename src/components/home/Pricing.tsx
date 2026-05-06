"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Rocket, Star } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started with basics.",
    features: ["Access to basic tutorials", "Interactive code editor", "Community support", "Public profile"],
    icon: <Star size={24} />,
    color: "var(--text-tertiary)"
  },
  {
    name: "Pro",
    price: "19",
    description: "Everything you need to become a pro.",
    features: ["All premium tutorials", "AI-powered debugging", "Certificate of completion", "Project-based curriculum", "Priority support"],
    popular: true,
    icon: <Zap size={24} />,
    color: "var(--brand-primary)"
  },
  {
    name: "Team",
    price: "49",
    description: "For small teams and startups.",
    features: ["Everything in Pro", "Team collaboration tools", "Custom learning paths", "Advanced analytics", "Dedicated account manager"],
    icon: <Rocket size={24} />,
    color: "var(--text-primary)"
  }
];

export function Pricing() {
  return (
    <section style={{ padding: "120px 0", background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            Simple, Transparent <span style={{ color: "var(--brand-primary)" }}>Pricing</span>
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Choose the plan that's right for your career goals. No hidden fees.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          alignItems: "stretch"
        }}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)",
                padding: "48px 40px",
                borderRadius: "24px",
                border: plan.popular ? "2px solid var(--brand-primary)" : "1px solid #E5E7EB",
                boxShadow: plan.popular ? "0 20px 25px -5px rgba(15,110,86,0.1)" : "0 4px 6px -1px rgba(0,0,0,0.05)",
                position: "relative",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "var(--brand-primary)",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ color: plan.color, marginBottom: "24px" }}>
                {plan.icon}
              </div>

              <h3 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>{plan.name}</h3>
              <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "32px", minHeight: "40px" }}>{plan.description}</p>

              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "40px" }}>
                <span style={{ fontSize: "40px", fontWeight: 900, color: "var(--text-primary)" }}>${plan.price}</span>
                <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>/month</span>
              </div>

              <div style={{ flex: 1, marginBottom: "40px" }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", fontSize: "14px" }}>What's included:</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: "12px", fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      <Check size={18} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/register" style={{
                padding: "16px",
                textAlign: "center",
                borderRadius: "14px",
                background: plan.popular ? "var(--brand-primary)" : "#111827",
                color: "white",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "15px",
                transition: "opacity 0.2s"
              }}>
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
