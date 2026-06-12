"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

export function AIFeature() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: "Error Detected",
      icon: <AlertCircle size={20} color="#EF4444" />,
      content: "ReferenceError: pandaschool is not defined",
      ai: "Looks like you have a typo in your variable name."
    },
    {
      title: "AI Analyzing",
      icon: <Bot size={20} color="var(--brand-primary)" />,
      content: "Scanning your code for similar patterns...",
      ai: "I found the issue! You meant 'Pandaschool' with a capital B."
    },
    {
      title: "Fixed!",
      icon: <CheckCircle2 size={20} color="#10B981" />,
      content: "const Pandaschool = () => { ... }",
      ai: "Your code is now working perfectly. Great job!"
    }
  ];

  return (
    <section style={{ padding: "100px 0", background: "var(--bg-primary)" }}>
      <div className="section-container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "center" }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: "#111827",
              borderRadius: "24px",
              padding: "40px",
              color: "white",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* AI Animation Mockup */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F" }} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "14px" }}
                >
                  <div style={{ color: "#9CA3AF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    {steps[activeStep].icon}
                    {steps[activeStep].title}
                  </div>
                  <div style={{ background: "#1F2937", padding: "16px", borderRadius: "12px", border: "1px solid #374151", marginBottom: "20px" }}>
                    {steps[activeStep].content}
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ width: "32px", height: "32px", background: "var(--brand-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={18} color="white" />
                    </div>
                    <div style={{ background: "#374151", padding: "12px 16px", borderRadius: "0 16px 16px 16px", fontSize: "13px", lineHeight: 1.5 }}>
                      {steps[activeStep].ai}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#EEF2FF",
              color: "#6366F1",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "24px"
            }}>
              <Sparkles size={14} />
              <span>AI Learning Companion</span>
            </div>

            <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "24px", fontFamily: "var(--font-heading)" }}>
              Your Personal <span style={{ color: "var(--brand-primary)" }}>AI Tutor</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "32px" }}>
              Never get stuck again. Our AI companion helps you debug code, explains complex concepts, and provides personalized hints based on your progress.
            </p>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                "Instant error fixing and explanations",
                "Personalized learning suggestions",
                "Conceptual help without giving the answer",
                "24/7 availability for all premium courses"
              ].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px", color: "#374151", fontWeight: 600 }}>
                  <CheckCircle2 size={18} color="var(--brand-primary)" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
