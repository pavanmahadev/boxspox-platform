import React from "react";
import { createClient } from "@/utils/supabase/server";
import { 
  ArrowLeft,
  Code2, 
  ExternalLink,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { SubmissionAction } from "./SubmissionAction";
import { projects } from "@/data/projects";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sub, error } = await supabase
    .from("project_submissions")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .eq("id", id)
    .single();

  if (!sub) return <div>Submission not found</div>;
  
  const project = projects.find(p => p.id === sub.project_id);

  return (
    <div>
      <Link href="/admin/submissions" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", textDecoration: "none", fontSize: "14px", fontWeight: 600, marginBottom: "24px" }}>
        <ArrowLeft size={16} /> Back to Submissions
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
        <div>
          <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", padding: "32px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "32px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{project?.title || sub.project_id}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-tertiary)", fontSize: "14px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={16} /> {sub.profiles?.full_name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={16} /> Submitted {new Date(sub.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span style={{ 
                padding: "6px 16px", 
                borderRadius: "var(--radius-full)", 
                fontSize: "12px", 
                fontWeight: 700,
                background: sub.status === "approved" ? "#ECFDF5" : sub.status === "rejected" ? "#FEF2F2" : "#FFFBEB",
                color: sub.status === "approved" ? "#059669" : sub.status === "rejected" ? "#DC2626" : "#D97706",
                textTransform: "uppercase"
              }}>
                {sub.status.replace("_", " ")}
              </span>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Project Description</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "32px" }}>{project?.description || "No description provided."}</p>

            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Submission Links</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <a href={sub.github_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)", textDecoration: "none", color: "var(--text-primary)" }}>
                <Code2 size={20} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>GitHub Repository</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>View source code</div>
                </div>
              </a>
              {sub.live_url && (
                <a href={sub.live_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)", textDecoration: "none", color: "var(--text-primary)" }}>
                  <ExternalLink size={20} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700 }}>Live Demo</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>View production site</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <div>
          <SubmissionAction submission={sub} />
        </div>
      </div>
    </div>
  );
}
