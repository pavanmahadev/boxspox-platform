"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CTA() {
  return (
    <section className="section-padding" style={{ background: "var(--bg-secondary)" }}>
      <div className="section-container" style={{ textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "60px 40px",
            borderRadius: "var(--radius-xl)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.1))",
            border: "1px solid var(--border-primary)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              fontWeight: 800,
              marginBottom: "16px",
              letterSpacing: "-1px",
            }}
          >
            Ready to Start Your <span className="text-gradient-primary">Coding Journey</span>?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              marginBottom: "32px",
              lineHeight: 1.7,
            }}
          >
            Pandaschool is a leading Ed Tech company striving to provide the best learning material on technical and non-technical subjects.
            <br />
            It&apos;s free, interactive, and designed for you.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/tutorials/html"
              className="btn-primary"
              style={{ padding: "16px 36px", fontSize: "1rem" }}
            >
              Start with HTML <ArrowRight size={18} />
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              marginTop: "32px",
              flexWrap: "wrap",
            }}
          >
            {["No signup required", "100% Free", "Interactive tutorials"].map(
              (item, i) => (
                <span
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <CheckCircle2 size={16} color="var(--brand-success)" />
                  {item}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
