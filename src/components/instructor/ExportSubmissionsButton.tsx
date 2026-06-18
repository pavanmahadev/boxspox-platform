"use client";

import React from "react";
import { Download } from "lucide-react";

export default function ExportSubmissionsButton({ submissions, examTitle }: { submissions: any[], examTitle: string }) {
  const handleExport = () => {
    if (!submissions || submissions.length === 0) return;

    const headers = ["Student Name", "Email", "Submitted At", "Score", "Warnings", "Status"];
    
    const csvContent = [
      headers.join(","),
      ...submissions.map(sub => {
        const student = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
        const name = student?.full_name || "Unknown Student";
        const email = student?.email || "No email";
        const dateStr = sub.completed_at ? new Date(sub.completed_at).toLocaleString() : "In Progress";
        const score = sub.score !== null ? `${Math.round(sub.score)}%` : "-";
        const warnings = sub.warnings_count || 0;
        const status = sub.passed ? "Passed" : sub.completed_at ? "Failed" : "In Progress";
        
        return `"${name}","${email}","${dateStr}","${score}","${warnings}","${status}"`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      disabled={!submissions || submissions.length === 0}
      style={{ 
        display: "flex", alignItems: "center", gap: "8px", 
        padding: "10px 16px", background: "var(--bg-secondary)", 
        border: "1px solid var(--border-primary)", borderRadius: "10px", 
        color: "var(--text-primary)", fontWeight: 600, fontSize: "14px", 
        cursor: (!submissions || submissions.length === 0) ? "not-allowed" : "pointer",
        opacity: (!submissions || submissions.length === 0) ? 0.5 : 1
      }}
    >
      <Download size={16} /> Export CSV
    </button>
  );
}
