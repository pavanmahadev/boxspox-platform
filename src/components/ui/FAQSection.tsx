"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQSchema } from "@/components/seo/FAQSchema";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQ[];
}

export function FAQSection({ title = "Frequently Asked Questions", faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section" style={{ marginTop: "48px", marginBottom: "48px" }}>
      <FAQSchema faqs={faqs} />
      <h2 style={{ fontSize: "var(--h2-size)", fontWeight: 800, marginBottom: "24px", color: "var(--text-primary)" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              style={{
                border: "1px solid var(--border-primary)",
                borderRadius: "12px",
                background: "var(--bg-card)",
                overflow: "hidden",
                transition: "all 0.3s ease"
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text-primary)"
                }}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  style={{ 
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
                    transition: "transform 0.3s ease",
                    color: "var(--text-tertiary)"
                  }} 
                />
              </button>
              
              <div 
                style={{
                  maxHeight: isOpen ? "500px" : "0",
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.3s ease-in-out",
                  padding: isOpen ? "0 20px 20px 20px" : "0 20px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  fontSize: "15px"
                }}
              >
                {faq.answer}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
