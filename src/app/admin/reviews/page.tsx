import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Star, Trash2, User, BookOpen, MessageSquare, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function ReviewsModerationPage() {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("course_reviews")
    .select(`
      *,
      profiles:user_id (full_name, email),
      courses:course_id (title)
    `)
    .order("created_at", { ascending: false });

  async function deleteReview(formData: FormData) {
    "use server";
    const reviewId = formData.get("reviewId") as string;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("course_reviews")
      .delete()
      .eq("id", reviewId);

    if (!error) {
      revalidatePath("/admin/reviews");
    }
  }

  return (
    <div style={{ paddingBottom: "60px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          Course Reviews
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Moderate student feedback and maintain community standards.</p>
      </div>

      {!reviews || reviews.length === 0 ? (
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-primary)", padding: "80px 20px", textAlign: "center" }}>
          <MessageSquare size={48} color="var(--border-primary)" style={{ marginBottom: "20px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>No reviews yet</h3>
          <p style={{ color: "var(--text-tertiary)", marginTop: "8px" }}>When students review courses, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
          {reviews.map((review: any) => (
            <div key={review.id} style={{ 
              background: "var(--bg-card)", 
              borderRadius: "20px", 
              border: "1px solid var(--border-primary)", 
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "var(--brand-primary)" }}>
                    {review.profiles?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{review.profiles?.full_name || "Anonymous User"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{review.profiles?.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={14} 
                      fill={s <= review.rating ? "#F59E0B" : "none"} 
                      color={s <= review.rating ? "#F59E0B" : "#D1D5DB"} 
                    />
                  ))}
                </div>
              </div>

              <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", color: "var(--text-tertiary)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  <BookOpen size={12} /> {review.courses?.title}
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: review.comment ? "normal" : "italic" }}>
                  {review.comment || "No comment provided."}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 500 }}>
                  {new Date(review.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
                <form action={deleteReview}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <button 
                    type="submit"
                    style={{ 
                      background: "none", 
                      border: "none", 
                      color: "#EF4444", 
                      cursor: "pointer", 
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 700,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
