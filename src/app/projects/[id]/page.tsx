import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProjectSubmissionForm } from "@/components/projects/ProjectSubmissionForm";
import { Database, Palette, Globe, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

import { projects } from "@/data/projects";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find(p => p.id === id);

  if (!project) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let submission = null;
  if (user) {
    const { data } = await supabase
      .from("project_submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", id)
      .single();
    submission = data;
  }

  return (
    <div style={{ paddingTop: "112px", background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <div className="section-container" style={{ padding: "40px 24px" }}>
        <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", textDecoration: "none", fontWeight: 600, marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px", alignItems: "start" }}>
          {/* Project Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", background: "var(--bg-card)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-primary)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                {project.icon}
              </div>
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                  {project.title}
                </h1>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-primary)", background: "#E1F5EE", padding: "4px 10px", borderRadius: "6px" }}>
                    {project.difficulty}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", background: "var(--bg-tertiary)", padding: "4px 10px", borderRadius: "6px" }}>
                    {project.category}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border-primary)", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px" }}>Project Overview</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6, marginBottom: "32px" }}>
                {project.description}
              </p>

              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>Requirements</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "12px", padding: 0, listStyle: "none" }}>
                {project.requirements.map((req, idx) => (
                  <li key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start", color: "var(--text-primary)", fontSize: "15px" }}>
                    <CheckCircle size={20} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Submission Area */}
          <div style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border-primary)", position: "sticky", top: "120px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Your Submission</h2>
            
            {!user ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "var(--text-tertiary)", marginBottom: "16px" }}>Please log in to submit your project.</p>
                <Link href={`/login?next=/projects/${id}`} className="btn-primary" style={{ display: "inline-flex" }}>
                  Log In
                </Link>
              </div>
            ) : submission ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "16px", borderRadius: "12px", background: submission.status === "approved" ? "#ECFDF5" : submission.status === "rejected" ? "#FEF2F2" : submission.status === "reviewed" ? "#EFF6FF" : "#F3F4F6", border: `1px solid ${submission.status === "approved" ? "#A7F3D0" : submission.status === "rejected" ? "#FECACA" : submission.status === "reviewed" ? "#BFDBFE" : "#E5E7EB"}` }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "4px" }}>Status</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: submission.status === "approved" ? "#059669" : submission.status === "rejected" ? "#DC2626" : submission.status === "reviewed" ? "#2563EB" : "#4B5563" }}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>GitHub Repository</div>
                  <a href={submission.github_url} target="_blank" rel="noreferrer" style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}>
                    {submission.github_url}
                  </a>
                </div>

                {submission.live_url && (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "4px" }}>Live Demo</div>
                    <a href={submission.live_url} target="_blank" rel="noreferrer" style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" }}>
                      {submission.live_url}
                    </a>
                  </div>
                )}

                {submission.feedback && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-primary)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>Reviewer Feedback</div>
                    <p style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.5 }}>{submission.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <ProjectSubmissionForm projectId={id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
