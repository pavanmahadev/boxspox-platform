"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle, XCircle, AlertTriangle, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

export default function SubmissionReview() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();
  const examId = params?.id as string;
  const subId = params?.subId as string;

  const [exam, setExam] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [overrideScore, setOverrideScore] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDetailedSubmission = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: eData } = await supabase.from("exams").select("*").eq("id", examId).single();
        if (eData) setExam(eData);

        const { data: qData } = await supabase.from("exam_questions").select("*").eq("exam_id", examId).order("order_index");
        if (qData) setQuestions(qData);

        const { data: sData } = await supabase
          .from("exam_submissions")
          .select(`*, profiles:user_id (full_name, email)`)
          .eq("id", subId)
          .single();
          
        if (sData) {
          setSubmission(sData);
          setOverrideScore(String(Math.round(sData.score || 0)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedSubmission();
  }, [examId, subId, supabase]);

  const handleUpdateScore = async () => {
    const newScore = parseFloat(overrideScore);
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      return showToast("Score must be between 0 and 100", "error");
    }
    
    setIsSaving(true);
    try {
      const passed = newScore >= (exam?.passing_score || 70);
      const { error } = await supabase
        .from("exam_submissions")
        .update({ score: newScore, passed })
        .eq("id", subId);

      if (error) throw error;
      
      setSubmission({ ...submission, score: newScore, passed });
      showToast("Score updated successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update score", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading submission...</div>;
  if (!exam || !submission) return <div style={{ padding: "40px", textAlign: "center" }}>Submission not found.</div>;

  const student = Array.isArray(submission.profiles) ? submission.profiles[0] : submission.profiles;
  const answers = submission.answers || {};

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Link href={`/instructor/exams/${examId}/submissions`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
          <ChevronLeft size={16} /> Back to Submissions
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            Review: {student?.full_name || "Unknown"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            {student?.email} • {exam.title}
          </p>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Current Score</div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: submission.passed ? "#10B981" : "#EF4444" }}>
              {Math.round(submission.score)}%
            </div>
          </div>
          <div style={{ width: "1px", height: "40px", background: "var(--border-primary)" }} />
          <div>
            <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Override Score</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="number" 
                value={overrideScore}
                onChange={e => setOverrideScore(e.target.value)}
                style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", outline: "none" }}
              />
              <button onClick={handleUpdateScore} disabled={isSaving} style={{ padding: "8px 16px", background: "var(--brand-primary)", border: "none", color: "white", borderRadius: "8px", fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer" }}>
                {isSaving ? "..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const type = q.question_type || "multiple_choice";
          
          let isCorrect = false;
          if (type === "multiple_choice") {
            isCorrect = userAnswer === q.correct_answer;
          } else if (type === "fill_in_the_blank") {
            isCorrect = (userAnswer || "").toLowerCase().trim() === (q.correct_answer || "").toLowerCase().trim();
          } else if (type === "coding") {
            isCorrect = false; // Code evaluation is complex to reconstruct statically, mark as manual review
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
                  {type === "coding" ? (
                     <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#F59E0B", background: "rgba(245, 158, 11, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                       <AlertTriangle size={14} /> Manual Grading Needed
                     </span>
                  ) : !hasAnswered ? (
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
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Student's Answer</div>
                    {type === "coding" ? (
                      <pre style={{ margin: 0, padding: "12px", background: "#111827", color: "#f3f4f6", borderRadius: "8px", fontSize: "13px", overflowX: "auto" }}>
                        {userAnswer || "// No code submitted"}
                      </pre>
                    ) : type === "match_the_following" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {Object.entries(JSON.parse(userAnswer || "{}")).map(([k, v]) => (
                          <div key={k} style={{ fontSize: "14px", color: "var(--text-primary)" }}><strong>{k}</strong> = {v as string}</div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>
                        {userAnswer || <span style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>Blank</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>Correct Answer</div>
                    {type === "coding" ? (
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        Based on test cases: {q.options?.[0]?.test_cases?.length || 0} tests.
                      </div>
                    ) : type === "match_the_following" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {Object.entries(JSON.parse(q.correct_answer || "{}")).map(([k, v]) => (
                          <div key={k} style={{ fontSize: "14px", color: "var(--text-primary)" }}><strong>{k}</strong> = {v as string}</div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500 }}>
                        {q.correct_answer}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
