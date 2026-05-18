"use client";

import React, { useState, useEffect } from "react";
import { Clock, Code2, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const SandpackEditor = dynamic<any>(() => import("@/components/editor/SandpackEditor"), {
  ssr: false,
  loading: () => <div style={{ height: "400px", background: "#1e293b", borderRadius: "12px" }} />
});

function QuestionBody({ q, currentIdx, answers, handleCodeChange, handleSelectOption }: any) {
  const isCoding = q.question_type === "coding";

  // Memoize files to prevent Sandpack infinite re-renders on timer tick
  const files = React.useMemo(() => ({
    "/App.js": answers[currentIdx] || q.code_template || "// Write your solution here...\n"
  }), [answers, currentIdx, q.code_template]);

  if (isCoding) {
    return (
      <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-primary)" }}>
        <SandpackEditor 
          files={files}
          template="vanilla"
          theme="dark"
        />
        <div style={{ padding: "16px", background: "#F8FAFC", fontSize: "13px", color: "var(--text-secondary)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>Your code will be evaluated by our AI grading engine upon submission. Ensure it meets the requirements mentioned in the question.</span>
        </div>
      </div>
    );
  }

  if (q.question_type === "short_answer") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input 
          type="text" 
          value={answers[currentIdx] || ""} 
          onChange={(e) => handleCodeChange(e.target.value)} 
          placeholder="Type your answer here..."
          style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "16px", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
          onFocus={(e) => e.target.style.borderColor = "var(--brand-primary)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
        />
      </div>
    );
  }
  if (q.question_type === "fill_in_the_blank") {
    const parts = q.question.split("___");
    const currentAns = answers[currentIdx] || [];
    
    return (
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.8 }}>
        {parts.map((part: string, i: number) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <input 
                type="text"
                value={currentAns[i] || ""}
                onChange={(e) => {
                  const newA = [...currentAns];
                  newA[i] = e.target.value;
                  handleCodeChange(newA);
                }}
                style={{
                  display: "inline-block", minWidth: "120px", maxWidth: "200px", margin: "0 8px", padding: "4px 12px",
                  background: "var(--bg-secondary)", border: "none", borderBottom: "3px solid var(--brand-primary)",
                  color: "var(--brand-primary)", fontSize: "24px", fontWeight: 800, textAlign: "center", outline: "none"
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
  if (q.question_type === "match_the_following") {
    const currentAns = answers[currentIdx] || [];
    const rightOptions = [...new Set(q.options.map((o: any) => o.matchTarget))].sort();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {q.options.map((opt: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", background: "var(--bg-secondary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
            <div style={{ flex: 1, fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>{opt.text}</div>
            <ArrowRight size={20} color="var(--text-tertiary)" />
            <div style={{ flex: 1 }}>
              <select 
                value={currentAns[i] || ""} 
                onChange={(e) => {
                  const newA = [...currentAns];
                  newA[i] = e.target.value;
                  handleCodeChange(newA);
                }}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid var(--border-primary)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none", cursor: "pointer" }}
              >
                <option value="" disabled>Select match...</option>
                {rightOptions.map((ro: any, j: number) => (
                  <option key={j} value={ro}>{ro as string}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {q.options?.map((opt: any, oIdx: number) => {
        const isSelected = answers[currentIdx] === oIdx;
        return (
          <button
            key={oIdx}
            onClick={() => handleSelectOption(oIdx)}
            style={{
              width: "100%", padding: "20px", borderRadius: "16px",
              background: isSelected ? "rgba(15, 110, 86, 0.05)" : "var(--bg-secondary)",
              border: `2px solid ${isSelected ? "var(--brand-primary)" : "transparent"}`,
              display: "flex", alignItems: "center", gap: "16px",
              cursor: "pointer", transition: "all 0.2s", textAlign: "left"
            }}
          >
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${isSelected ? "var(--brand-primary)" : "#CBD5E1"}`, display: "flex", alignItems: "center", justifyContent: "center", background: isSelected ? "var(--brand-primary)" : "transparent" }}>
              {isSelected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white" }} />}
            </div>
            <span style={{ fontSize: "16px", fontWeight: isSelected ? 700 : 500, color: "var(--text-primary)" }}>{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ActiveExam({ course, questions, timeLimitMinutes, submitAction }: any) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array prevents re-running the effect on every tick

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const handleCodeChange = (code: string) => {
    setAnswers({ ...answers, [currentIdx]: code });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await submitAction(answers);
    } catch (err: any) {
      console.error("Grading failed:", err);
      setErrorMsg(err.message || "Failed to grade exam. Please try again or contact support.");
      setIsSubmitting(false);
    }
  };

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIdx];
  const isCoding = q.question_type === "coding";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", display: "flex", flexDirection: "column" }}>
      {/* Exam Header */}
      <div style={{ background: "var(--bg-primary)", padding: "16px 32px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 800, fontSize: "16px" }}>{course.title} - Final Exam</div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: timeLeft < 60 ? "#FEF2F2" : "#F8FAFC", padding: "8px 16px", borderRadius: "20px", color: timeLeft < 60 ? "#DC2626" : "var(--text-primary)", fontWeight: 700, border: `1px solid ${timeLeft < 60 ? "#FECACA" : "#E2E8F0"}` }}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ flex: 1, padding: "40px 20px", maxWidth: isCoding ? "1200px" : "800px", margin: "0 auto", width: "100%", transition: "max-width 0.3s ease" }}>
        
        {/* Progress Bar */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "32px" }}>
          {questions.map((_: any, i: number) => (
            <div key={i} style={{ flex: 1, height: "6px", borderRadius: "3px", background: i === currentIdx ? "var(--brand-primary)" : answers[i] !== undefined ? "#10B981" : "#E2E8F0", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ background: "var(--bg-primary)", borderRadius: "24px", padding: "40px", border: "1px solid var(--border-primary)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Question {currentIdx + 1} of {questions.length}
            </span>
            {isCoding && (
              <span style={{ background: "#F3E8FF", color: "#9333EA", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                <Code2 size={14} /> Coding Challenge
              </span>
            )}
            {q.question_type === "short_answer" && (
              <span style={{ background: "#FCE7F3", color: "#DB2777", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 800 }}>
                Short Answer
              </span>
            )}
            {q.question_type === "fill_in_the_blank" && (
              <span style={{ background: "#E0E7FF", color: "#4F46E5", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 800 }}>
                Fill in the Blanks
              </span>
            )}
            {q.question_type === "match_the_following" && (
              <span style={{ background: "#D1FAE5", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 800 }}>
                Matching
              </span>
            )}
          </div>

          {q.question_type !== "fill_in_the_blank" && (
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "32px", lineHeight: 1.4 }}>
              {q.question}
            </h2>
          )}

          <QuestionBody 
            q={q} 
            currentIdx={currentIdx} 
            answers={answers} 
            handleCodeChange={handleCodeChange} 
            handleSelectOption={handleSelectOption} 
          />

        </div>

        {errorMsg && (
          <div style={{ marginTop: "24px", padding: "16px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
          <button 
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            style={{ padding: "14px 24px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-primary)", fontWeight: 700, cursor: currentIdx === 0 ? "not-allowed" : "pointer", opacity: currentIdx === 0 ? 0.5 : 1, display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {currentIdx === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: "14px 32px", borderRadius: "12px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 800, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.4)" }}
            >
              {isSubmitting ? "Grading Exam..." : "Submit Exam"} <CheckCircle2 size={18} />
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              style={{ padding: "14px 32px", borderRadius: "12px", border: "none", background: "#111827", color: "white", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            >
              Next <ArrowRight size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
