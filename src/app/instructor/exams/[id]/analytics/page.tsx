import React from "react";
import Link from "next/link";
import { ChevronLeft, BarChart2, Clock, AlertTriangle, Target, HelpCircle, User } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function ExamAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: examId } = await params;

  // Verify instructor owns this exam
  const { data: { user } } = await supabase.auth.getUser();
  const { data: exam, error: examErr } = await supabase.from("exams").select("*").eq("id", examId).single();
  
  if (examErr || !exam || exam.created_by !== user?.id) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
        Exam not found or unauthorized.
      </div>
    );
  }

  // Fetch submissions
  const { data: submissionsRaw } = await supabase
    .from("exam_submissions")
    .select("*")
    .eq("exam_id", examId);

  const submissions = submissionsRaw || [];

  // Fetch questions
  const { data: questionsRaw } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("exam_id", examId)
    .order("order_index");

  const questions = questionsRaw || [];

  // If no submissions, show empty state
  if (submissions.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: "24px" }}>
          <Link href={`/instructor/exams/${examId}/submissions`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
            <ChevronLeft size={16} /> Back to Submissions
          </Link>
        </div>
        <div style={{ padding: "60px 20px", textAlign: "center", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
          <div style={{ width: "64px", height: "64px", background: "var(--bg-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--text-tertiary)" }}>
            <BarChart2 size={32} />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>No Analytics Available</h3>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
            Students haven't submitted this exam yet. Analytics will appear once there is data to analyze.
          </p>
        </div>
      </div>
    );
  }

  // Analytics Calculations
  const totalSubmissions = submissions.length;
  let totalScore = 0;
  let totalTimeMs = 0;
  let timeTrackedCount = 0;

  // 1. Score Distribution
  const scoreBins = [
    { label: "0-10%", count: 0, min: 0, max: 10 },
    { label: "11-20%", count: 0, min: 11, max: 20 },
    { label: "21-30%", count: 0, min: 21, max: 30 },
    { label: "31-40%", count: 0, min: 31, max: 40 },
    { label: "41-50%", count: 0, min: 41, max: 50 },
    { label: "51-60%", count: 0, min: 51, max: 60 },
    { label: "61-70%", count: 0, min: 61, max: 70 },
    { label: "71-80%", count: 0, min: 71, max: 80 },
    { label: "81-90%", count: 0, min: 81, max: 90 },
    { label: "91-100%", count: 0, min: 91, max: 100 },
  ];

  // 2. Item Analysis
  const itemStats: Record<string, { correct: number, total: number }> = {};
  questions.forEach(q => itemStats[q.id] = { correct: 0, total: 0 });

  submissions.forEach(sub => {
    totalScore += (sub.score || 0);

    // Time calculation
    if (sub.started_at && sub.completed_at) {
      const start = new Date(sub.started_at).getTime();
      const end = new Date(sub.completed_at).getTime();
      if (end > start) {
        totalTimeMs += (end - start);
        timeTrackedCount++;
      }
    }

    // Score binning
    const score = Math.round(sub.score || 0);
    const bin = scoreBins.find(b => score >= b.min && score <= b.max);
    if (bin) bin.count++;

    // Question performance
    const answers = sub.answers || {};
    questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (userAnswer === undefined) return;

      itemStats[q.id].total++;
      
      let isCorrect = false;
      const type = q.question_type || "multiple_choice";
      if (type === "multiple_choice") {
        isCorrect = userAnswer === q.correct_answer;
      } else if (type === "fill_in_the_blank") {
        const normalize = (s: string) => (s || "").replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        isCorrect = normalize(userAnswer) === normalize(q.correct_answer);
      } else if (type === "match_the_following") {
        try {
          const cMap = JSON.parse(q.correct_answer);
          const uMap = JSON.parse(userAnswer || "{}");
          let all = true;
          for (const k of Object.keys(cMap)) if (uMap[k] !== cMap[k]) all = false;
          if (Object.keys(uMap).length !== Object.keys(cMap).length) all = false;
          isCorrect = all;
        } catch(e) {}
      } else if (type === "coding") {
        // Coding questions are manually graded, we can approximate by seeing if they got points 
        // OR we just skip them for auto-analysis. Let's mark as indeterminate for now.
        // We will assume "correct" if score is high, but we can't easily tell per-question for coding unless we run tests.
      }

      if (isCorrect) itemStats[q.id].correct++;
    });
  });

  const avgScore = Math.round(totalScore / totalSubmissions);
  const avgTimeMinutes = timeTrackedCount > 0 ? Math.round((totalTimeMs / timeTrackedCount) / 60000) : 0;
  const maxBinCount = Math.max(...scoreBins.map(b => b.count), 1); // Avoid division by zero

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href={`/instructor/exams/${examId}/submissions`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", textDecoration: "none" }}>
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "4px", fontFamily: "var(--font-heading)" }}>
              Advanced Analytics
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
              {exam.title} • {totalSubmissions} Submissions
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}>
             <Target size={18} /> Average Score
          </div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--brand-primary)" }}>{avgScore}%</div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}>
             <Clock size={18} /> Avg Completion Time
          </div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)" }}>{avgTimeMinutes} <span style={{ fontSize: "16px", color: "var(--text-tertiary)", fontWeight: 600 }}>mins</span></div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}>
             <User size={18} /> Completion Rate
          </div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "#10B981" }}>
            100% <span style={{ fontSize: "16px", color: "var(--text-tertiary)", fontWeight: 600 }}>of starts</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        {/* Score Distribution Chart */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "20px", padding: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart2 size={22} color="var(--brand-primary)" /> Score Distribution
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {scoreBins.map((bin, i) => {
              const percentage = (bin.count / maxBinCount) * 100;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "80px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textAlign: "right", flexShrink: 0 }}>
                    {bin.label}
                  </div>
                  <div style={{ flex: 1, height: "24px", background: "var(--bg-secondary)", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: "100%", 
                      background: "linear-gradient(90deg, var(--brand-primary), #34D399)", 
                      borderRadius: "12px",
                      transition: "width 1s ease-in-out"
                    }} />
                  </div>
                  <div style={{ width: "40px", fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {bin.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item Analysis */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "20px", padding: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <HelpCircle size={22} color="var(--brand-primary)" /> Item Analysis
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-primary)", textAlign: "left" }}>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>#</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Question Text</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Type</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Success Rate</th>
                  <th style={{ padding: "16px", fontSize: "13px", color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => {
                  const stat = itemStats[q.id];
                  const successRate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                  const isHard = successRate < 40 && stat.total > 0;
                  const isCoding = q.question_type === "coding";

                  return (
                    <tr key={q.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                      <td style={{ padding: "20px 16px", fontWeight: 800, color: "var(--text-secondary)" }}>{i + 1}</td>
                      <td style={{ padding: "20px 16px", color: "var(--text-primary)", fontWeight: 500, maxWidth: "300px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {q.question_text}
                        </div>
                      </td>
                      <td style={{ padding: "20px 16px", fontSize: "13px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                        {(q.question_type || "multiple_choice").replace(/_/g, " ")}
                      </td>
                      <td style={{ padding: "20px 16px" }}>
                        {isCoding ? (
                          <span style={{ color: "var(--text-tertiary)", fontSize: "13px", fontStyle: "italic" }}>Manual Grade</span>
                        ) : stat.total === 0 ? (
                          <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>No Data</span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "80px", height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${successRate}%`, height: "100%", background: successRate > 70 ? "#10B981" : successRate > 40 ? "#F59E0B" : "#EF4444" }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: "14px", color: successRate > 70 ? "#10B981" : successRate > 40 ? "#F59E0B" : "#EF4444" }}>
                              {successRate}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "20px 16px", textAlign: "right" }}>
                        {isHard && !isCoding && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#EF4444", background: "rgba(239, 68, 68, 0.1)", padding: "6px 12px", borderRadius: "20px" }}>
                            <AlertTriangle size={14} /> Needs Review
                          </span>
                        )}
                        {!isHard && !isCoding && stat.total > 0 && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "6px 12px", borderRadius: "20px" }}>
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
