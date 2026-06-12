"use client";

import React from "react";
import Link from "next/link";
import { FileText, AlertCircle, Scale, CheckCircle } from "lucide-react";

const PAGE_TOP = "clamp(128px, 15vw, 160px)";

export default function TermsPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{
        paddingTop: PAGE_TOP,
        paddingBottom: "60px",
        paddingLeft: "var(--container-padding)",
        paddingRight: "var(--container-padding)",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-primary)"
      }}>
        <div className="section-container" style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", letterSpacing: "-1px" }}>Terms of Service</h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Agreement last modified: May 6, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "80px var(--container-padding)" }}>
        <div className="section-container" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

            <div style={{ padding: "32px", borderRadius: "24px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <AlertCircle color="var(--brand-primary)" size={24} style={{ marginTop: "4px", flexShrink: 0 }} />
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: "8px" }}>Please read carefully</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>By using Pandaschool, you agree to these terms. If you do not agree to all these terms, do not use our services.</p>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>1. Account Eligibility</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>You must be at least 13 years old to use Pandaschool. If you are under 18, you must have the consent of a parent or legal guardian to create an account.</p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>2. Acceptable Use</h2>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p style={{ marginBottom: "16px" }}>You agree not to use Pandaschool for any unlawful purpose or to:</p>
                <ul style={{ paddingLeft: "0", display: "flex", flexDirection: "column", gap: "12px", listStyle: "none" }}>
                  {[
                    "Attempt to gain unauthorized access to our systems or other users' accounts.",
                    "Upload or share any content that is offensive, harmful, or infringes on intellectual property rights.",
                    "Use automated systems (bots) to scrape data from our platform.",
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: "12px" }}>
                      <CheckCircle size={18} color="var(--brand-primary)" style={{ marginTop: "4px", flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>3. Subscriptions and Payments</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>Certain features require a paid subscription. All payments are non-refundable unless required by law. You can cancel your subscription at any time through your dashboard.</p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>4. Intellectual Property</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>The content provided by Pandaschool, including lessons, videos, and code examples, is owned by Pandaschool and protected by copyright law. You are granted a limited license to use this content for personal learning only.</p>
            </div>

            <div style={{ padding: "40px", borderRadius: "24px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", textAlign: "center" }}>
              <Scale size={40} color="var(--text-tertiary)" style={{ marginBottom: "20px" }} />
              <h3 style={{ fontWeight: 800, marginBottom: "12px" }}>Legal Notice</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Pandaschool provides its services &quot;as is&quot; and disclaims all warranties to the fullest extent permitted by law.</p>
              <Link href="mailto:legal@pandaschool.in" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>legal@pandaschool.in</Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
