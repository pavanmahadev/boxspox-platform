"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Rocket, Star, Clock } from "lucide-react";
import Link from "next/link";
import { useSalesState } from "@/hooks/useSalesState";

const basePlans = [
  {
    id: 'SINGLE',
    name: "Single Course",
    regularPrice: 5111,
    description: "Perfect for learning a specific high-income skill.",
    features: ["Full lifetime access to 1 course", "Certificate of completion", "Community support", "Basic projects"],
    icon: <Star size={24} />,
    color: "var(--text-tertiary)"
  },
  {
    id: 'BUNDLE',
    name: "Career Bundle",
    regularPrice: 15999,
    description: "Everything you need to land a high-paying job.",
    features: ["Access to 5+ premium courses", "AI-powered debugging", "1-on-1 mentorship", "Resume building", "Priority support"],
    popular: true,
    icon: <Zap size={24} />,
    color: "var(--brand-primary)"
  },
  {
    id: 'LIFETIME',
    name: "Lifetime Access",
    regularPrice: 49999,
    description: "Unlimited access to all current and future content.",
    features: ["All Single Courses & Bundles", "Exclusive VIP community", "Early access to new content", "Direct instructor access", "Dedicated success manager"],
    icon: <Rocket size={24} />,
    color: "var(--text-primary)"
  }
];

export function Pricing() {
  // In Phase 2, this is fetched from Supabase globally
  const { saleMode, loading } = useSalesState();
  
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getDynamicPrice = (regularPrice: number, type: string) => {
    if (type === 'SINGLE') {
      if (saleMode === 'BLACK_FRIDAY') return 299;
      if (saleMode === 'FESTIVAL') return 499;
      return 999;
    }
    if (type === 'BUNDLE') {
      if (saleMode === 'BLACK_FRIDAY') return 999;
      if (saleMode === 'FESTIVAL') return 1499;
      return 2999;
    }
    if (type === 'LIFETIME') {
      if (saleMode === 'BLACK_FRIDAY') return 4999;
      if (saleMode === 'FESTIVAL') return 6999;
      return 9999;
    }
    return regularPrice;
  };

  const getSavings = (regular: number, sale: number) => {
    return Math.round(((regular - sale) / regular) * 100);
  };

  return (
    <section style={{ padding: "80px 0", background: "var(--bg-primary)", position: "relative" }}>
      <div className="section-container">
        
        {/* Sales Banner / Countdown */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "48px",
          background: saleMode === 'BLACK_FRIDAY' ? "#111827" : "rgba(15, 110, 86, 0.05)",
          padding: "24px",
          borderRadius: "20px",
          border: `1px solid ${saleMode === 'BLACK_FRIDAY' ? "#374151" : "rgba(15, 110, 86, 0.2)"}`
        }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ background: "#EF4444", color: "white", padding: "4px 12px", borderRadius: "50px", fontSize: "13px", fontWeight: 800 }}>
              🔥 Limited Time Offer
            </span>
            <span style={{ background: "#F59E0B", color: "white", padding: "4px 12px", borderRadius: "50px", fontSize: "13px", fontWeight: 800 }}>
              ⚡ High Demand
            </span>
            <span style={{ background: "var(--brand-primary)", color: "white", padding: "4px 12px", borderRadius: "50px", fontSize: "13px", fontWeight: 800 }}>
              🎓 10,000+ Enrolled
            </span>
          </div>
          
          <h2 style={{ fontSize: "28px", fontWeight: 900, color: saleMode === 'BLACK_FRIDAY' ? "white" : "var(--text-primary)", marginBottom: "12px", textAlign: "center" }}>
            {saleMode === 'BLACK_FRIDAY' ? "Black Friday Mega Sale" : saleMode === 'FESTIVAL' ? "Festival Special Sale" : "Monthly Promotional Sale"}
          </h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: saleMode === 'BLACK_FRIDAY' ? "#FCA5A5" : "#EF4444", fontWeight: 800, fontSize: "20px" }}>
            <Clock size={24} />
            Offer Ends In: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            Simple, Transparent <span style={{ color: "var(--brand-primary)" }}>Pricing</span>
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Choose the plan that's right for your career goals. No hidden fees. Lock in your discount before the timer expires.
          </p>
        </div>

        {/* Temporary controls removed as state is now fetched from Supabase */}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          alignItems: "stretch"
        }}>
          {basePlans.map((plan, i) => {
            const salePrice = getDynamicPrice(plan.regularPrice, plan.id);
            const savingsPercent = getSavings(plan.regularPrice, salePrice);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: "var(--bg-card)",
                  padding: "32px 24px",
                  borderRadius: "20px",
                  border: plan.popular ? "2px solid var(--brand-primary)" : "1px solid #E5E7EB",
                  boxShadow: plan.popular ? "0 20px 25px -5px rgba(15,110,86,0.1)" : "0 4px 6px -1px rgba(0,0,0,0.05)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden"
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translate(-50%, 0)",
                    background: "var(--brand-primary)",
                    color: "white",
                    padding: "6px 20px",
                    borderRadius: "0 0 12px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    zIndex: 2
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ color: plan.color, marginBottom: "20px", marginTop: plan.popular ? "16px" : "0" }}>
                  {plan.icon}
                </div>

                <h3 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>{plan.name}</h3>
                <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px", minHeight: "40px" }}>{plan.description}</p>

                {/* Pricing Section */}
                <div style={{ marginBottom: "32px", padding: "16px", background: "rgba(15, 110, 86, 0.04)", borderRadius: "16px", border: "1px dashed rgba(15, 110, 86, 0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: "#EF4444", fontWeight: 800, fontSize: "14px", background: "rgba(239, 68, 68, 0.1)", padding: "2px 8px", borderRadius: "6px" }}>
                      Save {savingsPercent}%
                    </span>
                    <span style={{ color: "var(--text-tertiary)", textDecoration: "line-through", fontSize: "16px", fontWeight: 600 }}>
                      ₹{plan.regularPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "42px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px" }}>
                      ₹{salePrice.toLocaleString('en-IN')}
                    </span>
                    {plan.id !== 'LIFETIME' && <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>/once</span>}
                  </div>
                </div>

                <div style={{ flex: 1, marginBottom: "40px" }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", fontSize: "14px" }}>What's included:</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", padding: 0 }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: "flex", gap: "12px", fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.4 }}>
                        <Check size={18} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/checkout?product=${plan.id}&price=${salePrice}&title=${encodeURIComponent(plan.name)}`} style={{
                  padding: "16px",
                  textAlign: "center",
                  borderRadius: "14px",
                  background: plan.popular ? "var(--brand-primary)" : "#111827",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "15px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: plan.popular ? "0 10px 20px -10px var(--brand-primary)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
                >
                  Enroll Now
                </Link>
                
                <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                  ⚡ Only 4 seats remaining!
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
