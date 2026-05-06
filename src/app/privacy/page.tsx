"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, Trash2, Mail } from "lucide-react";

const PAGE_TOP = "clamp(128px, 15vw, 160px)";

export default function PrivacyPage() {
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
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", letterSpacing: "-1px" }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Last Updated: May 6, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "80px var(--container-padding)" }}>
        <div className="section-container" style={{ maxWidth: "800px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>1. Information We Collect</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p>We collect information you provide directly to us when you create an account, participate in any interactive features of our services, fill out a form, or communicate with us.</p>
                <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li>Name and email address</li>
                  <li>Account password (hashed and encrypted)</li>
                  <li>Profile information (role, bio, interests)</li>
                  <li>Payment information (processed by third-party providers)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>2. How We Use Your Information</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p>We use the information we collect to:</p>
                <div className="privacy-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {[
                    { icon: <Lock size={20} />, text: "Provide and maintain our services" },
                    { icon: <Eye size={20} />, text: "Personalize your learning experience" },
                    { icon: <Shield size={20} />, text: "Ensure security and prevent fraud" },
                    { icon: <Mail size={20} />, text: "Send technical and promotional emails" },
                  ].map((use, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
                      <div style={{ color: "var(--brand-primary)" }}>{use.icon}</div>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{use.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>3. Data Retention and Deletion</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p>We retain your data as long as your account is active. You have the right to request deletion of your account and all associated personal information at any time.</p>
                <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <Trash2 color="#ef4444" size={24} style={{ marginTop: "4px" }} />
                  <div>
                    <p style={{ fontWeight: 700, color: "#ef4444", marginBottom: "4px" }}>Right to be Forgotten</p>
                    <p style={{ fontSize: "0.9rem" }}>If you wish to delete your data, please visit your account settings or contact us at privacy@boxspox.com.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>4. Cookies</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p>We use cookies to keep you logged in and remember your preferences. You can disable cookies in your browser settings, but some features of Boxspox may not function correctly.</p>
              </div>
            </div>

            <div style={{ padding: "40px", borderRadius: "24px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", textAlign: "center" }}>
              <h3 style={{ fontWeight: 800, marginBottom: "12px" }}>Questions about our privacy policy?</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>We&apos;re here to help you understand how your data is handled.</p>
              <Link href="mailto:privacy@boxspox.com" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>privacy@boxspox.com</Link>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .privacy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
