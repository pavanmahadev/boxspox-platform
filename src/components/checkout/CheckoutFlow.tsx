"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Lock, CreditCard, Sparkles, MoveRight, Loader2, Award, Zap, CheckCircle2 } from "lucide-react";
import { simulatePurchase } from "@/app/checkout/[id]/actions";
import { useRouter } from "next/navigation";
import Script from "next/script";

interface CheckoutFlowProps {
  course: {
    id: string;
    title: string;
    slug: string;
    exam_fee?: number;
    description?: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default function CheckoutFlow({ course, user }: CheckoutFlowProps) {
  const [step, setStep] = useState<"billing" | "processing" | "success">("billing");
  const [loading, setLoading] = useState(false);
  const [cardHolder, setCardHolder] = useState(user.name || "LEARNER NAME");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processingText, setProcessingText] = useState("Establishing secure payment tunnel...");
  const router = useRouter();

  // Rotate loading texts to make checkout feel like a high-tech transaction
  useEffect(() => {
    if (step !== "processing") return;
    
    const timers = [
      setTimeout(() => setProcessingText("Verifying secure transaction signature..."), 1200),
      setTimeout(() => setProcessingText("Authorizing sandbox credentials..."), 2400),
      setTimeout(() => setProcessingText("Provisioning exam access keys..."), 3600),
      setTimeout(() => setProcessingText("Generating digital certification vault..."), 4800)
    ];

    return () => timers.forEach(clearTimeout);
  }, [step]);

  // Clean formatting for Mock Card input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 3));
  };

  const triggerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep("processing");

    try {
      // Simulate purchase using the Server Action
      const result = await simulatePurchase(course.id);
      
      // Delay slightly to allow the beautiful high-fidelity vault authorization visual sequence to play
      setTimeout(() => {
        if (result.success) {
          setStep("success");
        } else {
          alert("Simulation failed");
          setStep("billing");
        }
        setLoading(false);
      }, 5500);

    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
      setStep("billing");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", paddingTop: "120px", paddingBottom: "80px", color: "var(--text-primary)" }}>
      
      {/* Visual Step Banner */}
      <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: step === "billing" ? 1 : 0.5, transition: "opacity 0.3s" }}>
          <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "var(--brand-primary)", color: "white", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>1</span>
          <span style={{ fontWeight: 700 }}>Billing</span>
        </div>
        <div style={{ width: "40px", height: "1px", background: "var(--border-primary)", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: step === "processing" ? 1 : 0.5, transition: "opacity 0.3s" }}>
          <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: step === "processing" || step === "success" ? "var(--brand-primary)" : "var(--bg-primary)", color: step === "processing" || step === "success" ? "white" : "var(--text-tertiary)", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>2</span>
          <span style={{ fontWeight: 700 }}>Processing</span>
        </div>
        <div style={{ width: "40px", height: "1px", background: "var(--border-primary)", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: step === "success" ? 1 : 0.5, transition: "opacity 0.3s" }}>
          <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: step === "success" ? "var(--brand-primary)" : "var(--bg-primary)", color: step === "success" ? "white" : "var(--text-tertiary)", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>3</span>
          <span style={{ fontWeight: 700 }}>Success</span>
        </div>
      </div>

      {step === "billing" && (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "48px" }}>
          
          {/* LEFT COLUMN: Course Certification Info & Premium Credit Card Mockup */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div>
              <span style={{ 
                background: "rgba(16, 185, 129, 0.1)", color: "#10b981", 
                padding: "6px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "1px", border: "1px solid rgba(16, 185, 129, 0.2)"
              }}>
                💎 Premium Certification
              </span>
              <h1 style={{ fontSize: "38px", fontWeight: 900, color: "var(--text-primary)", marginTop: "16px", letterSpacing: "-1.2px", lineHeight: 1.1 }}>
                Unlock {course.title} Exam
              </h1>
              <p style={{ fontSize: "16px", color: "var(--text-secondary)", marginTop: "12px", lineHeight: 1.6 }}>
                Unlock the certification portal, sit for the official industry exam, and receive a secure verified credentials badge.
              </p>
            </div>

            {/* Interactive Credit Card Mockup */}
            <div style={{ 
              position: "relative",
              width: "100%",
              height: "230px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              overflow: "hidden",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transformStyle: "preserve-3d",
              transition: "transform 0.5s ease"
            }} className="credit-card-hover">
              {/* Card Hologram Details */}
              <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
                <div>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Boxspox Certified Learner</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", marginTop: "4px" }}>PLATINUM ACCESS</div>
                </div>
                {/* Chip Icon */}
                <div style={{ width: "42px", height: "32px", borderRadius: "6px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "1px solid rgba(255,255,255,0.15)", position: "relative" }}>
                  <div style={{ position: "absolute", top: "8px", left: "6px", width: "30px", height: "16px", borderRight: "1px solid rgba(0,0,0,0.15)", borderLeft: "1px solid rgba(0,0,0,0.15)" }} />
                </div>
              </div>

              {/* Card Number */}
              <div style={{ fontSize: "22px", fontFamily: "monospace", letterSpacing: "3px", color: "#fff", wordSpacing: "4px", textShadow: "0 2px 4px rgba(0,0,0,0.4)", zIndex: 2 }}>
                {cardNumber || "•••• •••• •••• ••••"}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 2 }}>
                <div>
                  <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)" }}>Card Holder</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>{cardHolder}</div>
                </div>
                <div style={{ display: "flex", gap: "20px" }}>
                  <div>
                    <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)" }}>Expires</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{cardExpiry || "MM/YY"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)" }}>CVV</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{cardCvv || "•••"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              {[
                { title: "Dual-Attempt Examination Portal", desc: "Gain 2 comprehensive attempts to clear the exam to account for system drops." },
                { title: "Tamper-Proof Certificate Security", desc: "Cryptographically signed credentials hosted directly in Supabase vault." },
                { title: "Global LinkedIn Digital Badging", desc: "Integrate certificate directly with standard professional credentials galleries." }
              ].map((feat, i) => (
                <div key={i} style={{ display: "flex", gap: "16px" }}>
                  <div style={{ minWidth: "24px", height: "24px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: "2px" }}>
                    <Check size={14} color="#10b981" strokeWidth={3} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0 }}>{feat.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: "4px", margin: 0 }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Premium Torn-Receipt Invoice Form */}
          <div>
            <form onSubmit={triggerPayment} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Invoice Container with glassmorphism receipt look */}
              <div style={{ 
                background: "var(--bg-primary)", 
                border: "1px solid var(--border-primary)", 
                borderRadius: "24px", 
                padding: "32px",
                position: "relative",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
              }}>
                <h2 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={18} color="var(--brand-primary)" /> Billing & Invoice Summary
                </h2>

                <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "14px", padding: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10b981", fontSize: "13px", fontWeight: 800 }}>
                    <Zap size={14} /> SIMULATION VAULT TUNNEL ACTIVE
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                    No actual charge will be made. Enter any mock card numbers below to trigger simulation credentials.
                  </p>
                </div>

                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>Cardholder Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Jane Doe" 
                      value={cardHolder} 
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>Card Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="4111 2222 3333 4444" 
                      value={cardNumber} 
                      onChange={handleCardNumberChange}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none", fontFamily: "monospace", letterSpacing: "1px" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>Expiry Date</label>
                      <input 
                        type="text" 
                        required
                        placeholder="MM/YY" 
                        value={cardExpiry} 
                        onChange={handleExpiryChange}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "6px", textTransform: "uppercase" }}>CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="•••" 
                        value={cardCvv} 
                        onChange={handleCvvChange}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Receipt Box */}
                <div style={{ borderTop: "2px dashed var(--border-primary)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "14px" }}>
                    <span>Examination Access Key</span>
                    <span style={{ fontWeight: 700 }}>₹{course.exam_fee || 199}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "14px" }}>
                    <span>Digital Verification Certificate</span>
                    <span style={{ fontWeight: 700, color: "#10b981" }}>FREE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", paddingTop: "8px" }}>
                    <span>Total</span>
                    <span style={{ color: "var(--brand-primary)" }}>₹{course.exam_fee || 199}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: "var(--brand-primary)",
                    color: "white",
                    padding: "16px",
                    borderRadius: "14px",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 8px 24px rgba(15, 110, 86, 0.25)",
                    transition: "transform 0.2s"
                  }}
                >
                  Pay & Unlock Credentials <MoveRight size={18} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginTop: "16px", color: "var(--text-tertiary)", fontSize: "12px", fontWeight: 600 }}>
                  <Lock size={12} /> SSL Secured Sandbox Tunnel
                </div>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* STEP 2: PROCESSING SCREEN */}
      {step === "processing" && (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
          <div style={{ position: "relative", marginBottom: "32px" }}>
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", border: "4px solid rgba(15, 110, 86, 0.1)", borderTopColor: "var(--brand-primary)", animation: "spin 1s linear infinite" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <Lock size={32} color="var(--brand-primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "12px" }}>Authorizing Secure Simulation</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
            {processingText}
          </p>
        </div>
      )}

      {/* STEP 3: SUCCESS CELEBRATION PORTAL */}
      {step === "success" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          
          <div style={{ 
            background: "var(--bg-primary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "32px",
            padding: "48px 32px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            zIndex: 2
          }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={44} color="#10b981" />
            </div>

            <div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-1px" }}>Payment Verified Successfully!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "8px", maxWidth: "450px", margin: "8px auto 0 auto", lineHeight: 1.5 }}>
                Your certification credentials and final exam for the <strong>{course.title}</strong> course have been successfully unlocked!
              </p>
            </div>

            {/* Premium Digital Certificate Preview Mockup */}
            <div style={{
              width: "100%",
              maxWidth: "480px",
              background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
              border: "12px solid #0f172a",
              boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
              padding: "24px",
              borderRadius: "4px",
              textAlign: "center",
              position: "relative",
              color: "#0f172a",
              fontFamily: "serif"
            }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#64748b", fontWeight: 700, fontFamily: "sans-serif" }}>Official Certificate of Completion</div>
              
              <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "16px", color: "#0f172a" }}>{cardHolder}</div>
              <div style={{ height: "1px", width: "120px", background: "#cbd5e1", margin: "8px auto" }} />
              
              <div style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", fontFamily: "sans-serif" }}>has successfully met all curriculum requirements for the certification exam</div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f6e56", marginTop: "10px", fontFamily: "sans-serif" }}>{course.title}</div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "24px" }}>
                <div style={{ textAlign: "left", fontFamily: "sans-serif" }}>
                  <div style={{ fontSize: "8px", color: "#94a3b8" }}>Verification ID:</div>
                  <div style={{ fontSize: "9px", fontWeight: 700, color: "#475569" }}>{course.id.substring(0, 8).toUpperCase()}-MOCK</div>
                </div>
                <div style={{ width: "40px", height: "40px", border: "1px solid #e2e8f0", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* Decorative Stamp */}
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#0f6e56", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award size={18} color="white" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(`/tutorials/${course.slug}/exam`)}
              style={{
                width: "100%",
                maxWidth: "350px",
                background: "var(--brand-primary)",
                color: "white",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                fontSize: "15px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 24px rgba(15, 110, 86, 0.25)",
                marginTop: "16px"
              }}
            >
              Proceed to Certification Exam <MoveRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Styled inline animations to make mockup elements pristine */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .credit-card-hover:hover {
          transform: translateY(-8px) rotateX(4deg) rotateY(-4deg);
          box-shadow: 0 30px 60px rgba(16, 185, 129, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
