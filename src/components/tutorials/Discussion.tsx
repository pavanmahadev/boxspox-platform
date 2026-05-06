"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp, User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { full_name: string | null; email: string | null };
  replies?: Comment[];
}

interface DiscussionProps {
  lessonId: string;
  currentUserId: string;
}

export default function Discussion({ lessonId, currentUserId }: DiscussionProps) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function fetchComments() {
    const { data } = await supabase
      .from("discussion_comments")
      .select("*, profiles(full_name, email)")
      .eq("lesson_id", lessonId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .limit(50);
    setComments((data as Comment[]) || []);
    setLoading(false);
  }

  useEffect(() => { 
    fetchComments(); 

    // Real-time subscription for new comments
    const channel = supabase
      .channel(`lesson_discussion:${lessonId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "discussion_comments",
        filter: `lesson_id=eq.${lessonId}`,
      }, () => { fetchComments(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lessonId]);

  async function submitComment(content: string, parentId: string | null = null) {
    if (!content.trim()) return;
    setSubmitting(true);
    
    // We don't need to manually call fetchComments() anymore because the realtime sub will trigger it
    const { error } = await supabase.from("discussion_comments").insert({
      lesson_id: lessonId,
      user_id: currentUserId,
      content: content.trim(),
      parent_id: parentId,
    });

    if (error) {
      console.error("Error submitting comment:", error);
    } else {
      setNewComment("");
      setReplyText("");
      setReplyTo(null);
    }
    setSubmitting(false);
  }

  async function deleteComment(commentId: string) {
    await supabase.from("discussion_comments").delete().eq("id", commentId).eq("user_id", currentUserId);
  }

  return (
    <div style={{ marginTop: "48px", borderTop: "1px solid var(--border-primary)", paddingTop: "40px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: "24px",
          padding: 0,
        }}
      >
        <MessageCircle size={22} color="var(--brand-primary)" />
        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Discussion ({comments.length})
        </h3>
        {expanded ? <ChevronUp size={18} color="var(--text-tertiary)" /> : <ChevronDown size={18} color="var(--text-tertiary)" />}
      </button>

      {expanded && (
        <div>
          {/* New Comment Input */}
          <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share a thought or ask a question about this lesson..."
              rows={3}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                resize: "none",
                outline: "none",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => submitComment(newComment)}
                disabled={submitting || !newComment.trim()}
                className="btn-primary"
                style={{ padding: "10px 24px", opacity: submitting || !newComment.trim() ? 0.5 : 1 }}
              >
                <Send size={16} /> Post Comment
              </button>
            </div>
          </div>

          {/* Comments List */}
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "20px" }}>Loading discussion...</div>
          ) : comments.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              background: "var(--bg-secondary)",
              borderRadius: "16px",
              border: "1px dashed var(--border-secondary)"
            }}>
              <MessageCircle size={32} color="var(--text-tertiary)" style={{ opacity: 0.4, marginBottom: "12px" }} />
              <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>No comments yet — be the first to ask!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "16px",
                  padding: "20px"
                }}>
                  {/* Comment Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "rgba(15, 110, 86, 0.1)",
                        color: "var(--brand-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.85rem"
                      }}>
                        {(comment.profiles?.full_name || comment.profiles?.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          {comment.profiles?.full_name || comment.profiles?.email || "Anonymous"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                          {new Date(comment.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-primary)", fontWeight: 700, fontSize: "0.85rem" }}
                      >
                        Reply
                      </button>
                      {comment.user_id === currentUserId && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{comment.content}</p>

                  {/* Reply Input */}
                  {replyTo === comment.id && (
                    <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
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
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          onClick={() => { setReplyTo(null); setReplyText(""); }}
                          style={{ background: "none", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitComment(replyText, comment.id)}
                          disabled={submitting || !replyText.trim()}
                          className="btn-primary"
                          style={{ padding: "8px 20px", fontSize: "0.85rem", opacity: submitting || !replyText.trim() ? 0.5 : 1 }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
