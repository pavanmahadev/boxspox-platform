"use client";

import React, { useState, useEffect, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, ChevronRight, Award, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ExamResults() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.id as string;
  const supabase = createClient();

  const [exam, setExam] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch Exam
        const { data: eData } = await supabase.from("exams").select("*").eq("id", examId).single();
        if (eData) setExam(eData);

        // Fetch Questions for review mode
        const { data: qData } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).order("order_index");
        if (qData) setQuestions(qData);

        // Fetch Submission
        const { data: sData } = await supabase.from("exam_submissions").select("*").eq("exam_id", examId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single();
        if (sData) setSubmission(sData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId, supabase, router]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-primary)" }}>Loading...</div>;

  if (!exam || !submission) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "var(--bg-primary)" }}>Results not found.</div>;
  }

  const passed = submission.passed;
  const answers = submission.answers || {};

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "60px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Summary Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "24px", padding: "40px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", marginBottom: "40px" }}>
          <div style={{ 
            width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto 24px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: passed ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: passed ? "#10B981" : "#EF4444"
          }}>
            {passed ? <Award size={50} /> : <XCircle size={50} />}
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            {passed ? "Congratulations!" : "Keep Practicing"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "32px" }}>
            You have {passed ? "passed" : "failed"} the <strong>{exam.title}</strong> exam.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 600, marginBottom: "8px" }}>Your Score</div>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--brand-primary)", lineHeight: 1 }}>{Math.round(submission.score)}%</div>
            </div>
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
              <div style={{ fontSize: "14px", color: "var(--text-tertiary)", fontWeight: 600, marginBottom: "8px" }}>Passing Score</div>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{exam.passing_score}%</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", alignItems: "center", flexDirection: "column" }}>
            {passed ? (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "16px 24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", animation: "pulse 2s infinite" }}>
                <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)" }}>
                  <Award size={20} color="white" />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#10B981" }}>Badge Unlocked!</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Check your dashboard to view your new badge.</div>
                </div>
              </div>
            ) : null}
            
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/dashboard" style={{
                padding: "16px 32px", background: "var(--bg-secondary)", color: "var(--text-primary)", borderRadius: "12px", border: "1px solid var(--border-primary)", fontSize: "15px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center"
              }}>
                Back to Dashboard
              </Link>
              {!passed ? (
                <Link href={`/exams/${exam.id}`} style={{
                  padding: "16px 32px", background: "#EF4444", color: "white", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)"
                }}>
                  Retake Exam <ChevronRight size={18} />
                </Link>
              ) : (
                <Link href={`/exams/${exam.id}`} style={{
                  padding: "16px 32px", background: "var(--brand-primary)", color: "white", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 24px rgba(15, 110, 86, 0.2)"
                }}>
                  Take Again <ChevronRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Review Answers Toggle */}
        <button 
          onClick={() => setShowReview(!showReview)}
          style={{ width: "100%", padding: "20px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: "24px" }}
        >
          <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Review Your Answers</span>
          {showReview ? <ChevronUp size={24} color="var(--text-tertiary)" /> : <ChevronDown size={24} color="var(--text-tertiary)" />}
        </button>

        {/* Review Answers Details */}
        {showReview && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {questions.map((q, i) => {
              const userAnswer = answers[q.id];
              const type = q.question_type || "multiple_choice";
              
              let isCorrect = false;
              if (type === "multiple_choice") {
                isCorrect = userAnswer === q.correct_answer;
              } else if (type === "fill_in_the_blank") {
                const normalize = (s: string) => (s || "").replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
                isCorrect = normalize(userAnswer) === normalize(q.correct_answer);
              } else if (type === "coding") {
                // Do not evaluate student code during render to avoid infinite loops and XSS
                isCorrect = false;
              } else if (type === "match_the_following") {
                try {
                  const cMap = JSON.parse(q.correct_answer);
                  const uMap = JSON.parse(userAnswer || "{}");
                  let all = true;
                  for (const k of Object.keys(cMap)) if (uMap[k] !== cMap[k]) all = false;
                  if (Object.keys(uMap).length !== Object.keys(cMap).length) all = false;
                  isCorrect = all;
                } catch(e) {}
              }

              const hasAnswered = !!userAnswer && userAnswer !== "{}" && userAnswer !== "[]";

              return (
                <div key={q.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "6px", background: !hasAnswered ? "var(--text-tertiary)" : isCorrect ? "#10B981" : "#EF4444" }} />
                  
                  <div style={{ paddingLeft: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                        <span style={{ color: "var(--text-tertiary)", marginRight: "8px" }}>{i + 1}.</span>
                        {q.question_text}
                      </h3>
                      {!hasAnswered ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: "20px" }}>
                          Unanswered
                        </span>
                      ) : isCorrect ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                          <CheckCircle size={14} /> Correct
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#EF4444", background: "rgba(239, 68, 68, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                          <XCircle size={14} /> Incorrect
                        </span>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", background: "var(--bg-secondary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Your Answer</div>
                        {type === "coding" ? (
                          <pre style={{ margin: 0, padding: "12px", background: "#111827", color: "#f3f4f6", borderRadius: "8px", fontSize: "13px", overflowX: "auto" }}>{userAnswer || "// No code submitted"}</pre>
                        ) : type === "match_the_following" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {Object.entries(JSON.parse(userAnswer || "{}")).map(([k, v]) => (
                              <div key={k} style={{ fontSize: "14px", color: "var(--text-primary)" }}><strong>{k}</strong> = {v as string}</div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>{userAnswer || <span style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>Blank</span>}</div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Correct Answer</div>
                        {type === "coding" ? (
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Based on passing all hidden test cases.</div>
                        ) : type === "match_the_following" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {Object.entries(JSON.parse(q.correct_answer || "{}")).map(([k, v]) => (
                              <div key={k} style={{ fontSize: "14px", color: "var(--text-primary)" }}><strong>{k}</strong> = {v as string}</div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>{q.correct_answer}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
