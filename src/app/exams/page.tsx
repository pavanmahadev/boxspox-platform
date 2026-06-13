"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Clock, FileText, CheckCircle, ChevronRight, ShieldAlert, Award, Search, BookOpen } from "lucide-react";

export default function StudentExamsList() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("*, exam_questions(count)")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setExams(data);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [supabase]);

  const filteredExams = exams.filter(e => e.title?.toLowerCase().includes(searchTerm.toLowerCase()) || e.description?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", paddingTop: "140px", paddingBottom: "80px" }}>
      {/* Premium Hero Section */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", marginBottom: "60px" }}>
        <div style={{ 
          background: "linear-gradient(135deg, rgba(15,110,86,0.1), rgba(15,110,86,0.02))",
          border: "1px solid rgba(15,110,86,0.2)",
          borderRadius: "24px",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.02)"
        }}>
          {/* Decorative background elements */}
          <div style={{ position: "absolute", top: "-20%", left: "-5%", width: "300px", height: "300px", background: "var(--brand-primary)", filter: "blur(100px)", opacity: 0.1, borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "-5%", width: "300px", height: "300px", background: "var(--brand-secondary, #10B981)", filter: "blur(100px)", opacity: 0.1, borderRadius: "50%" }} />
          
          <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "0 10px 30px rgba(15,110,86,0.15)", border: "1px solid var(--border-primary)", position: "relative", zIndex: 1 }}>
            <Award size={40} color="var(--brand-primary)" />
          </div>
          
          <h1 style={{ fontSize: "42px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-heading)", marginBottom: "16px", letterSpacing: "-0.5px", position: "relative", zIndex: 1 }}>
            Professional Certifications
          </h1>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "600px", lineHeight: 1.6, marginBottom: "32px", position: "relative", zIndex: 1 }}>
            Prove your expertise, test your knowledge, and earn globally recognized certificates by completing our proctored industry exams.
          </p>

          <div style={{ position: "relative", width: "100%", maxWidth: "500px", zIndex: 1 }}>
            <Search size={20} color="var(--text-tertiary)" style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search for an exam..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", padding: "18px 20px 18px 54px", borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.1)", background: "white", color: "var(--text-primary)",
                fontSize: "16px", outline: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                fontWeight: 500
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", color: "var(--text-secondary)", gap: "16px" }}>
            <div className="loader-spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-primary)", borderTopColor: "var(--brand-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontWeight: 600 }}>Loading active exams...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredExams.length === 0 ? (
          <div style={{ padding: "60px 40px", textAlign: "center", background: "var(--bg-card)", borderRadius: "24px", border: "1px dashed var(--border-primary)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "70px", height: "70px", background: "rgba(15,110,86,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "var(--text-tertiary)" }}>
              <ShieldAlert size={32} />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>No exams available right now</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "400px" }}>We couldn't find any published exams matching your criteria. Please check back later!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "32px" }}>
            {filteredExams.map((exam) => (
              <div key={exam.id} style={{ 
                background: "var(--bg-card)", borderRadius: "24px", border: "1px solid var(--border-primary)", 
                padding: "32px", display: "flex", flexDirection: "column", 
                transition: "all 0.3s ease", cursor: "default", position: "relative", overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(15,110,86,0.1)";
                e.currentTarget.style.borderColor = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.03)";
                e.currentTarget.style.borderColor = "var(--border-primary)";
              }}>
                {/* Decorative Accent */}
                <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "var(--brand-primary)", opacity: 0.05, borderBottomLeftRadius: "100px", pointerEvents: "none" }} />
                
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ width: "48px", height: "48px", background: "rgba(15,110,86,0.1)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", flexShrink: 0 }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "6px" }}>
                      {exam.title}
                    </h2>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-primary)", background: "rgba(15,110,86,0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                      Certification Exam
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "32px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.6 }}>
                  {exam.description || "Comprehensive assessment to evaluate your skills and knowledge."}
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px", background: "var(--bg-secondary)", padding: "16px", borderRadius: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    <div style={{ width: "32px", height: "32px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      <Clock size={16} color="var(--text-secondary)" />
                    </div>
                    {exam.time_limit_minutes} Mins
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                    <div style={{ width: "32px", height: "32px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      <FileText size={16} color="var(--text-secondary)" />
                    </div>
                    {exam.exam_questions?.[0]?.count || 0} Qs
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", gridColumn: "span 2" }}>
                    <div style={{ width: "32px", height: "32px", background: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      <CheckCircle size={16} color="#10B981" />
                    </div>
                    {exam.passing_score}% Score required to pass
                  </div>
                </div>
                
                <div style={{ marginTop: "auto" }}>
                  <Link href={`/exams/${exam.id}`} style={{ 
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", 
                    padding: "16px", background: "var(--text-primary)", color: "var(--bg-primary)", 
                    borderRadius: "14px", fontSize: "16px", fontWeight: 800, textDecoration: "none", 
                    transition: "all 0.2s", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" 
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-primary)"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(15,110,86,0.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--text-primary)"; e.currentTarget.style.color = "var(--bg-primary)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"; }}
                  >
                    Start Certification <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
