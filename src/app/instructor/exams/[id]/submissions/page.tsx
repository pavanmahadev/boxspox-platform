import React from "react";
import Link from "next/link";
import { ChevronLeft, Users, Clock, Award, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function ExamSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch submissions with profile info
  const { data: submissions, error: subErr } = await supabase
    .from("exam_submissions")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .eq("exam_id", examId)
    .order("created_at", { ascending: false });

  const passedCount = submissions?.filter((s: any) => s.passed).length || 0;
  const avgScore = submissions?.length ? Math.round(submissions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / submissions.length) : 0;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/instructor/exams" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
          <ChevronLeft size={16} /> Back to Exams
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            {exam.title} - Submissions
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Review student submissions, grades, and analytics for this exam.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}>
             <Users size={18} /> Total Submissions
          </div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)" }}>{submissions?.length || 0}</div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}>
             <Award size={18} /> Average Score
          </div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--brand-primary)" }}>{avgScore}%</div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-tertiary)", marginBottom: "12px", fontWeight: 600, fontSize: "14px" }}>
             <CheckCircle size={18} /> Pass Rate
          </div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: "#10B981" }}>
            {submissions?.length ? Math.round((passedCount / submissions.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", overflow: "hidden" }}>
        {submissions?.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "var(--bg-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--text-tertiary)" }}>
              <Users size={32} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>No submissions yet</h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
              Students haven't completed this exam yet.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)", textAlign: "left" }}>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Student Name</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Submitted At</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Score</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Warnings</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions?.map((sub: any) => {
                  const student = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
                  const name = student?.full_name || "Unknown Student";
                  const email = student?.email || "No email";
                  const dateStr = sub.completed_at ? new Date(sub.completed_at).toLocaleString() : "In Progress";
                  
                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{name}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>{email}</div>
                      </td>
                      <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                           <Clock size={16} /> {dateStr}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: sub.passed ? "#10B981" : "#EF4444" }}>
                          {sub.score !== null ? `${Math.round(sub.score)}%` : "-"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        {sub.warnings_count > 0 ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>
                            {sub.warnings_count} Warning{sub.warnings_count > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 500 }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        {sub.passed ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                            <CheckCircle size={14} /> Passed
                          </span>
                        ) : sub.completed_at ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#EF4444", background: "rgba(239, 68, 68, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                            <XCircle size={14} /> Failed
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: "20px" }}>
                            <Clock size={14} /> In Progress
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {sub.completed_at && (
                          <Link href={`/instructor/exams/${examId}/submissions/${sub.id}`} style={{
                            padding: "8px 16px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-primary)",
                            color: "var(--text-primary)",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 600,
                            fontSize: "13px"
                          }}>
                            Review Answers
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
