import React from "react";
import Link from "next/link";
import { Plus, Search, FileText, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function ExamsList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch exams for this instructor
  // Since we might not have pushed the DB schema yet, we use a try-catch to fail gracefully
  let exams: any[] = [];
  try {
    const { data } = await supabase
      .from("exams")
      .select("*, courses(title)")
      .eq("created_by", user?.id)
      .order("created_at", { ascending: false });
    if (data) exams = data;
  } catch (err) {
    console.error("Failed to fetch exams", err);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            Exams
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Create and manage secure exams for your students.
          </p>
        </div>

        <Link href="/instructor/exams/create" style={{
          padding: "12px 24px",
          background: "var(--brand-primary)",
          color: "white",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(15, 110, 86, 0.2)"
        }}>
          <Plus size={18} /> Create Exam
        </Link>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
      }}>
        {/* Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <Search size={18} color="var(--text-tertiary)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search exams..." 
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "10px",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Exams Table/List */}
        {exams.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "rgba(15,110,86,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--brand-primary)" }}>
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>No exams yet</h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: "14px", maxWidth: "300px", margin: "0 auto 24px" }}>
              You haven't created any exams yet. Create your first exam to test your students' knowledge!
            </p>
            <Link href="/instructor/exams/create" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
              borderRadius: "10px",
              fontWeight: 600,
              textDecoration: "none"
            }}>
              <Plus size={16} /> Create Exam
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)", textAlign: "left" }}>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Exam Title</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Time Limit</th>
                  <th style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{exam.title}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Course: {exam.courses?.title || "Standalone"}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {exam.is_published ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                          <CheckCircle size={14} /> Published
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: "20px" }}>
                          Draft
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                         <Clock size={16} /> {exam.time_limit_minutes} min
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <Link href={`/instructor/exams/${exam.id}/submissions`} style={{
                          padding: "8px 16px",
                          background: "var(--brand-primary)",
                          border: "none",
                          color: "white",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: "13px"
                        }}>
                          Submissions
                        </Link>
                        <Link href={`/instructor/exams/${exam.id}/analytics`} style={{
                          padding: "8px 16px",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--brand-primary)",
                          color: "var(--brand-primary)",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: "13px"
                        }}>
                          Analytics
                        </Link>
                        <Link href={`/instructor/exams/${exam.id}/edit`} style={{
                          padding: "8px 16px",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-primary)",
                          color: "var(--text-primary)",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: "13px"
                        }}>
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
