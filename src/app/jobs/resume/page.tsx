"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Sparkles, CheckCircle2, AlertCircle, Building2, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  team: string;
  link: string;
}

interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  matchedJobs: Job[];
}

export default function ResumeReviewerPage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) {
      showToast("Please paste a valid resume (at least 50 characters).", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/resume-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze resume.");

      setResult(data.analysis);
      showToast("Resume analyzed successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981"; // Green
    if (score >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", paddingBottom: "120px" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Link href="/jobs" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", textDecoration: "none", fontWeight: 700, fontSize: "14px", marginBottom: "24px" }}>
            <ArrowLeft size={16} /> Back to Job Hub
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, var(--brand-primary), #059669)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 10px 20px -5px rgba(15,110,86,0.3)" }}>
              <Sparkles size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-heading)", letterSpacing: "-0.5px" }}>AI Resume Reviewer</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "4px", fontWeight: 500 }}>Paste your resume and let our AI Recruiter score it and match you with open roles.</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "40px auto 0", padding: "0 24px", display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Input Section */}
        <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Upload size={20} color="var(--brand-primary)" /> Paste Your Resume
          </h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your plain-text resume here... (Experience, Education, Skills, Projects)"
            style={{
              width: "100%",
              height: result ? "300px" : "400px",
              padding: "20px",
              borderRadius: "16px",
              border: "2px dashed var(--border-primary)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontSize: "15px",
              lineHeight: 1.6,
              resize: "none",
              outline: "none",
              fontFamily: "var(--font-mono, monospace)",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--brand-primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || resumeText.length < 50}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "16px",
              background: "var(--brand-primary)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 800,
              cursor: loading || resumeText.length < 50 ? "not-allowed" : "pointer",
              opacity: loading || resumeText.length < 50 ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 10px 20px -5px rgba(15,110,86,0.2)"
            }}
          >
            {loading ? <><Loader2 size={20} className="animate-spin" /> Analyzing Profile...</> : <><Sparkles size={20} /> Analyze & Match Jobs</>}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* Score Card */}
            <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "32px", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}>
              <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-primary)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke={getScoreColor(result.score)} strokeWidth="12" strokeDasharray={`${(result.score / 100) * 339} 339`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease-out" }} />
                </svg>
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{result.score}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, marginTop: "4px" }}>/ 100</div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Overall ATS Score</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.5 }}>
                  {result.score >= 80 ? "Excellent resume! You are highly competitive for top tech roles." : result.score >= 60 ? "Good foundation, but your resume needs some optimization to beat the ATS." : "Your resume needs significant improvements to stand out to recruiters."}
                </p>
              </div>
            </div>

            {/* Feedback Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "20px", border: "1px solid #D1FAE5" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#059669", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <CheckCircle2 size={18} /> Strengths
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {result.strengths.map((strength, i) => (
                    <li key={i} style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ color: "#10B981", flexShrink: 0, marginTop: "2px" }}>•</span> {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "20px", border: "1px solid #FEE2E2" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#DC2626", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <AlertCircle size={18} /> Weaknesses
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {result.weaknesses.map((weakness, i) => (
                    <li key={i} style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{ color: "#EF4444", flexShrink: 0, marginTop: "2px" }}>•</span> {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Job Matches */}
            <div style={{ marginTop: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="var(--brand-primary)" /> Top Handpicked Matches
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {result.matchedJobs.map(job => (
                  <div key={job.id} style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "transform 0.2s, box-shadow 0.2s" }} className="job-match-card">
                    <div>
                      <h4 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{job.title}</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 600 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={14} /> {job.company}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14} /> {job.location}</span>
                      </div>
                    </div>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#111827", color: "white", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
                      Apply <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
                {result.matchedJobs.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center", background: "var(--bg-card)", borderRadius: "20px", border: "1px dashed var(--border-primary)", color: "var(--text-tertiary)" }}>
                    No exact matches found in our database right now. Keep leveling up your skills!
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .job-match-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
          border-color: var(--brand-primary) !important;
        }
      ` }} />
    </div>
  );
}
