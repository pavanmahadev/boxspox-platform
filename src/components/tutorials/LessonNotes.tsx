"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Save, Trash2, Edit2, Plus } from "lucide-react";

interface LessonNotesProps {
  lessonId: string;
  currentUserId: string;
}

export default function LessonNotes({ lessonId, currentUserId }: LessonNotesProps) {
  const supabase = createClient();
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetchNotes() {
    const { data } = await supabase
      .from("lesson_notes")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  }

  useEffect(() => { fetchNotes(); }, [lessonId]);

  async function addNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    await supabase.from("lesson_notes").insert({ lesson_id: lessonId, user_id: currentUserId, content: newNote.trim() });
    setNewNote("");
    await fetchNotes();
    setSaving(false);
  }

  async function updateNote(id: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    await supabase.from("lesson_notes").update({ content: editContent.trim(), updated_at: new Date().toISOString() }).eq("id", id);
    setEditingId(null);
    await fetchNotes();
    setSaving(false);
  }

  async function deleteNote(id: string) {
    await supabase.from("lesson_notes").delete().eq("id", id);
    await fetchNotes();
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: open ? "rgba(15, 110, 86, 0.05)" : "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "12px",
          padding: "12px 20px",
          cursor: "pointer",
          width: "100%",
          marginBottom: open ? "16px" : "0"
        }}
      >
        <FileText size={18} color="var(--brand-primary)" />
        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
          My Notes ({notes.length})
        </span>
      </button>

      {open && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "20px" }}>
          {/* Add Note Input */}
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Jot down a quick note for this lesson..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "var(--font-sans)"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={addNote}
                disabled={saving || !newNote.trim()}
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.9rem", opacity: saving || !newNote.trim() ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={16} /> Add Note
              </button>
            </div>
          </div>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
              No notes yet. Add your first one above!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notes.map((note) => (
                <div key={note.id} style={{ background: "var(--bg-secondary)", borderRadius: "12px", padding: "14px", border: "1px solid var(--border-primary)" }}>
                  {editingId === note.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-primary)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.9rem", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
                      />
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Cancel</button>
                        <button onClick={() => updateNote(note.id)} className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Save size={13} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, flex: 1, fontSize: "0.9rem" }}>{note.content}</p>
                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: "4px" }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteNote(note.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "8px" }}>
                    {new Date(note.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
