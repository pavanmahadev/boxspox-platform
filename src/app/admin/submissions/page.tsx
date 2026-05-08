import React from "react";
import { createClient } from "@/utils/supabase/server";
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Code2, 
  User, 
  BookOpen,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { projects } from "@/data/projects";

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const { data: submissions, error } = await supabase
    .from("project_submissions")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .order("submitted_at", { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          Project Submissions
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Review and grade student final projects.</p>
      </div>

      <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", overflowX: "auto", boxShadow: "var(--shadow-sm)" }}>
        <style>{`
          @media (max-width: 640px) {
            .table-cell-hide-mobile { display: none !important; }
          }
        `}</style>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
          <thead style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
            <tr>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Student</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Project</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Links</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Status</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Submitted</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions && submissions.length > 0 ? (
              submissions.map((sub: any) => {
                const project = projects.find(p => p.id === sub.project_id);
                return (
                  <tr key={sub.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                          {sub.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{sub.profiles?.full_name || "Unknown"}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{sub.profiles?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <BookOpen size={16} color="#6B7280" className="table-cell-hide-mobile" />
                        {project?.title || sub.project_id}
                      </div>
                    </td>
                    <td style={{ padding: "20px 24px" }} className="table-cell-hide-mobile">
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        {sub.github_url && (
                          <a href={sub.github_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }} title="GitHub Repo"><Code2 size={16} /></a>
                        )}
                        {sub.live_url && (
                          <a href={sub.live_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }} title="Live Demo"><ExternalLink size={16} /></a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: "var(--radius-full)", 
                        fontSize: "11px", 
                        fontWeight: 700,
                        background: sub.status === "approved" ? "#ECFDF5" : sub.status === "rejected" ? "#FEF2F2" : "#FFFBEB",
                        color: sub.status === "approved" ? "#059669" : sub.status === "rejected" ? "#DC2626" : "#D97706",
                        textTransform: "uppercase"
                      }}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px", fontSize: "13px", color: "var(--text-tertiary)" }} className="table-cell-hide-mobile">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "20px 24px" }}>
                      <Link 
                        href={`/admin/submissions/${sub.id}`}
                        style={{ 
                          background: "var(--bg-tertiary)", 
                          padding: "8px 16px", 
                          borderRadius: "8px", 
                          fontSize: "13px", 
                          fontWeight: 700, 
                          color: "var(--text-primary)", 
                          textDecoration: "none",
                          border: "1px solid var(--border-primary)"
                        }}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
                  No projects submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
