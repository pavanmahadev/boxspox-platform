"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Send, CheckCircle2 } from "lucide-react";

export function LeadGeneration() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call to save lead
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <section style={{ padding: "80px 0", background: "var(--bg-primary)" }}>
      <div className="section-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
        
        {/* Ebook Download Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
            padding: "40px",
            borderRadius: "24px",
            color: "white",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: "-50px", right: "-50px", opacity: 0.1 }}>
            <BookOpen size={200} />
          </div>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "50px", fontSize: "13px", fontWeight: 700, marginBottom: "20px", color: "#FCA5A5" }}>
              🎁 Free Resource
            </div>
            <h3 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "16px", lineHeight: 1.2 }}>
              Get The Ultimate Developer Roadmap 2026
            </h3>
            <p style={{ color: "#D1D5DB", fontSize: "15px", marginBottom: "32px", lineHeight: 1.6 }}>
              Download our 50-page guide on exactly what languages and frameworks to learn to land a high-paying job this year.
            </p>

            {submitted ? (
              <div style={{ background: "rgba(16, 185, 129, 0.2)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={24} color="#10B981" />
                <div>
                  <div style={{ fontWeight: 800, color: "white", fontSize: "16px" }}>Guide Sent!</div>
                  <div style={{ color: "#D1D5DB", fontSize: "14px" }}>Check your inbox in a few minutes.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.2)",
                    color: "white",
                    outline: "none",
                    fontSize: "15px"
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "var(--brand-primary)",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: 800,
                    fontSize: "16px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    opacity: loading ? 0.8 : 1
                  }}
                >
                  {loading ? "Sending..." : (
                    <>
                      Send Me The Free Guide <Send size={18} />
                    </>
                  )}
                </button>
                <div style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", marginTop: "4px" }}>
                  We respect your privacy. No spam.
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* WhatsApp Community Banner */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            padding: "40px",
            borderRadius: "24px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", bottom: "-40px", right: "-20px", opacity: 0.1 }}>
            <MessageCircle size={180} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: "64px", height: "64px", background: "white", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
              <MessageCircle size={32} color="#10B981" />
            </div>
            <h3 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "16px", lineHeight: 1.2 }}>
              Join Our VIP WhatsApp Community
            </h3>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "15px", marginBottom: "32px", lineHeight: 1.6 }}>
              Get daily coding tips, instant job alerts, and exclusive weekend discount codes dropped directly to your phone.
            </p>

            <a
              href="https://chat.whatsapp.com/example"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                background: "white",
                color: "#059669",
                padding: "16px 32px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 900,
                fontSize: "16px",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Join WhatsApp Group <MessageCircle size={20} />
            </a>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px" }}>
              <div style={{ display: "flex" }}>
                {[1, 2, 3].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} alt="Member" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #10B981", marginLeft: i > 1 ? "-12px" : "0" }} />
                ))}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>1,200+ members already joined</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
