import React from "react";
import Link from "next/link";
import { XCircle, CheckCircle2, RefreshCcw, ArrowRight, BookOpen } from "lucide-react";

export default async function ExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ language: string }>;
  searchParams: Promise<{ score?: string; passed?: string }>;
}) {
  const { language } = await params;
  const { score, passed } = await searchParams;

  const isPassed = passed === "true";
  const numScore = parseInt(score || "0", 10);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "var(--bg-card)", padding: "48px", borderRadius: "24px", border: "1px solid var(--border-primary)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", maxWidth: "500px", width: "100%", textAlign: "center" }}>
        
        {isPassed ? (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle2 size={40} />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>Congratulations!</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>You passed the exam with an excellent score.</p>
          </div>
        ) : (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#FEE2E2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <XCircle size={40} />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>Not Quite There</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Don't worry, you can always review the material and try again.</p>
          </div>
        )}

        <div style={{ background: "var(--bg-secondary)", padding: "24px", borderRadius: "16px", marginBottom: "32px", display: "inline-block", width: "100%" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Your Score</div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: isPassed ? "#059669" : "#DC2626" }}>
            {numScore}%
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {!isPassed ? (
            <>
              <Link href={`/tutorials/${language}/exam`} style={{ textDecoration: "none", width: "100%" }}>
                <button style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 800, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.4)" }}>
                  <RefreshCcw size={18} /> Retry Exam
                </button>
              </Link>
              <Link href={`/tutorials/${language}`} style={{ textDecoration: "none", width: "100%" }}>
                <button style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
                  <BookOpen size={18} /> Review Course Material
                </button>
              </Link>
            </>
          ) : (
            <Link href="/certifications" style={{ textDecoration: "none", width: "100%" }}>
              <button style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 800, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.4)" }}>
                View Certificate <ArrowRight size={18} />
              </button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
