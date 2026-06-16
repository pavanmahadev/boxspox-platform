"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, X, Save, Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function StudentNotes({ tutorialSlug }: { tutorialSlug: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen, tutorialSlug]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("student_notes")
        .select("content")
        .eq("user_id", user.id)
        .eq("tutorial_slug", tutorialSlug)
        .single();

      if (data) {
        setContent(data.content);
      }
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSaving(false);
        return;
      }

      const { data: existing } = await supabase
        .from("student_notes")
        .select("id")
        .eq("user_id", user.id)
        .eq("tutorial_slug", tutorialSlug)
        .single();

      if (existing) {
        await supabase
          .from("student_notes")
          .update({ content, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("student_notes")
          .insert({
            user_id: user.id,
            tutorial_slug: tutorialSlug,
            content
          });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "var(--brand-primary)",
          color: "white",
          border: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 40,
          transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        title="My Notes"
      >
        <BookOpen size={24} />
      </button>

      {/* Drawer */}
      {isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "400px",
          background: "var(--bg-card)",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.1)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--border-primary)",
          animation: "slideIn 0.3s ease-out"
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={20} color="var(--brand-primary)" />
              My Notes
            </h3>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
            <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Take personal notes for this tutorial. They'll be saved automatically.
            </p>
            
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, color: "var(--brand-primary)" }}>
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes here... (Supports Markdown)"
                style={{
                  flex: 1,
                  width: "100%",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-primary)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  resize: "none",
                  outline: "none",
                  fontFamily: "var(--font-sans)"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--brand-primary)"}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  saveNotes();
                }}
              />
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)" }}>
            <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 500 }}>
              {isSaved ? "Saved just now" : "Auto-saves on blur"}
            </span>
            <button
              onClick={saveNotes}
              disabled={isSaving}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px",
                background: isSaved ? "#10B981" : "var(--brand-primary)", color: "white", borderRadius: "8px",
                border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : isSaved ? <Check size={16} /> : <Save size={16} />}
              {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Notes"}
            </button>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}} />
        </div>
      )}
    </>
  );
}
