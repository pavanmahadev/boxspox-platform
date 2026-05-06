"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { GitBranch, Globe, Loader2, Send } from "lucide-react";

export function ProjectSubmissionForm({ projectId }: { projectId: string }) {
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      showToast("GitHub URL is required", "error");
      return;
    }

    if (!githubUrl.includes("github.com")) {
      showToast("Please provide a valid GitHub URL", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, githubUrl, liveUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project");
      }

      showToast("Project submitted successfully! It is now pending review.", "success");
      router.refresh(); // Refresh the page to show the submitted state
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <GitBranch size={14} /> GitHub Repository URL *
        </label>
        <input
          type="url"
          required
          placeholder="https://github.com/username/project"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-primary)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            outline: "none",
            fontSize: "14px",
            fontFamily: "var(--font-mono)"
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Globe size={14} /> Live Demo URL (Optional)
        </label>
        <input
          type="url"
          placeholder="https://my-project.vercel.app"
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-primary)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            outline: "none",
            fontSize: "14px",
            fontFamily: "var(--font-mono)"
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          background: "var(--brand-primary)",
          color: "white",
          border: "none",
          fontWeight: 700,
          fontSize: "15px",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: isSubmitting ? 0.7 : 1,
          marginTop: "12px",
          boxShadow: "0 4px 12px rgba(15,110,86,0.2)"
        }}
      >
        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {isSubmitting ? "Submitting..." : "Submit Project"}
      </button>

      <p style={{ fontSize: "12px", color: "var(--text-tertiary)", textAlign: "center", marginTop: "8px" }}>
        You can update your submission later if it gets rejected.
      </p>
    </form>
  );
}
