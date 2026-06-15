"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Megaphone, Trash2, Send } from "lucide-react";

export function AdminAnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData.user) {
      const { data, error } = await supabase
        .from("announcements")
        .insert({
          title,
          content,
          type: "site_wide",
          created_by: userData.user.id
        })
        .select("*, profiles(full_name)")
        .single();

      if (!error && data) {
        setAnnouncements([data, ...announcements]);
        setTitle("");
        setContent("");
      } else {
         console.error("Error posting announcement:", error);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (!error) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
      <style>{`
        @media (max-width: 768px) {
          .announcements-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="announcements-grid" style={{ display: "contents" }}>
        
        {/* Form */}
        <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-primary)", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Megaphone size={20} color="var(--brand-primary)" />
            New Announcement
          </h2>
          
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px", textTransform: "uppercase" }}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance"
                required
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 500, outline: "none" }}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", marginBottom: "8px", textTransform: "uppercase" }}>Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                required
                rows={6}
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 500, outline: "none", resize: "vertical" }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--brand-primary)",
                color: "white",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                border: "none",
                marginTop: "8px",
                boxShadow: "0 4px 10px -2px rgba(15, 110, 86, 0.3)"
              }}
            >
              <Send size={16} />
              {loading ? "Posting..." : "Broadcast to Platform"}
            </button>
          </form>
        </div>

        {/* History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {announcements.length === 0 ? (
            <div style={{ background: "var(--bg-card)", padding: "40px", borderRadius: "16px", border: "1px dashed var(--border-primary)", textAlign: "center", color: "var(--text-tertiary)", fontWeight: 500 }}>
              No site-wide announcements have been sent yet.
            </div>
          ) : (
            announcements.map((a: any) => (
              <div key={a.id} style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-primary)", position: "relative" }}>
                <button
                  onClick={() => handleDelete(a.id)}
                  style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex" }}
                  className="hover:bg-red-50 transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 size={16} />
                </button>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "8px" }}>
                  {new Date(a.created_at).toLocaleString()} • By {a.profiles?.full_name || "Admin"}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>{a.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {a.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
