"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export function SubmissionAction({ submission }: { submission: any }) {
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const handleUpdate = async (status: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("project_submissions")
      .update({
        status,
        feedback,
        updated_at: new Date().toISOString()
      })
      .eq("id", submission.id);

    if (!error) {
      showToast(`Submission ${status}`, status === "approved" ? "success" : "info");
      router.refresh();
    } else {
      showToast(error.message, "error");
    }
    setLoading(false);
  };

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", padding: "24px", position: "sticky", top: "120px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "20px" }}>Admin Actions</h3>
      
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Instructor Feedback</label>
        <textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback for the student..."
          style={{ width: "100%", height: "120px", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-primary)", fontSize: "14px", resize: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button 
          disabled={loading}
          onClick={() => handleUpdate("approved")}
          style={{ width: "100%", background: "#10B981", color: "white", padding: "14px", borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          Approve Project
        </button>
        <button 
          disabled={loading}
          onClick={() => handleUpdate("rejected")}
          style={{ width: "100%", background: "#EF4444", color: "white", padding: "14px", borderRadius: "12px", border: "none", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
          Reject Project
        </button>
        <button 
          disabled={loading}
          onClick={() => handleUpdate("under_review")}
          style={{ width: "100%", background: "none", color: "var(--text-tertiary)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-primary)", fontWeight: 700, cursor: "pointer" }}
        >
          Mark Under Review
        </button>
      </div>
    </div>
  );
}
