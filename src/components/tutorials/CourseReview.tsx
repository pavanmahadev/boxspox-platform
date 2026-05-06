"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star, Send, Edit2, Trash2 } from "lucide-react";

interface CourseReviewProps {
  courseId: string;
  currentUserId: string;
}

export default function CourseReview({ courseId, currentUserId }: CourseReviewProps) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<any[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  async function fetchReviews() {
    const { data } = await supabase
      .from("course_reviews")
      .select("*, profiles(full_name, email)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setReviews(data);
      const mine = data.find((r: any) => r.user_id === currentUserId);
      if (mine) { setMyReview(mine); setRating(mine.rating); setBody(mine.body || ""); }
      const avg = data.length > 0 ? data.reduce((s: number, r: any) => s + r.rating, 0) / data.length : 0;
      setAvgRating(Math.round(avg * 10) / 10);
    }
  }

  useEffect(() => { 
    fetchReviews(); 

    // Real-time subscription for new reviews
    const channel = supabase
      .channel(`course_reviews:${courseId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "course_reviews",
        filter: `course_id=eq.${courseId}`,
      }, () => { fetchReviews(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [courseId]);

  async function submitReview() {
    if (!rating) return;
    setSubmitting(true);
    if (myReview) {
      await supabase.from("course_reviews").update({ rating, body }).eq("id", myReview.id);
    } else {
      await supabase.from("course_reviews").insert({ course_id: courseId, user_id: currentUserId, rating, body });
    }
    setEditing(false);
    await fetchReviews();
    setSubmitting(false);
  }

  async function deleteReview() {
    if (!myReview) return;
    await supabase.from("course_reviews").delete().eq("id", myReview.id);
    setMyReview(null); setRating(0); setBody("");
    await fetchReviews();
  }

  const StarDisplay = ({ value }: { value: number }) => (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={16} fill={s <= value ? "#F59E0B" : "none"} stroke={s <= value ? "#F59E0B" : "var(--border-secondary)"} />
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: "48px", borderTop: "1px solid var(--border-primary)", paddingTop: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
        <div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            Reviews & Ratings
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)" }}>{avgRating || "—"}</span>
            {avgRating > 0 && <StarDisplay value={Math.round(avgRating)} />}
            <span style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        </div>

        {/* Write/Edit Review */}
        {(!myReview || editing) ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "24px", minWidth: "300px", maxWidth: "500px", flex: 1 }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>
              {myReview ? "Edit your review" : "Leave a review"}
            </p>
            {/* Star Picker */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                >
                  <Star size={28} fill={(hover || rating) >= s ? "#F59E0B" : "none"} stroke={(hover || rating) >= s ? "#F59E0B" : "var(--border-secondary)"} />
                </button>
              ))}
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience with this course..."
              rows={3}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.9rem", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "var(--font-sans)" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-end" }}>
              {editing && (
                <button onClick={() => { setEditing(false); setRating(myReview.rating); setBody(myReview.body || ""); }}
                  style={{ background: "none", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Cancel
                </button>
              )}
              <button
                onClick={submitReview}
                disabled={!rating || submitting}
                className="btn-primary"
                style={{ padding: "10px 20px", fontSize: "0.9rem", opacity: !rating || submitting ? 0.5 : 1 }}
              >
                <Send size={15} /> {myReview ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Edit2 size={14} /> Edit My Review
            </button>
            <button onClick={deleteReview} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", color: "#ef4444" }}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* All Reviews */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {reviews.filter((r: any) => r.user_id !== currentUserId || !editing).map((review: any) => (
          <div key={review.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
                  {(review.profiles?.full_name || review.profiles?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    {review.profiles?.full_name || review.profiles?.email || "Anonymous"}
                  </div>
                  <StarDisplay value={review.rating} />
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                {new Date(review.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            {review.body && <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{review.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
