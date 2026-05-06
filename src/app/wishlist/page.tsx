"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Heart, BookOpen, ChevronRight, Loader2, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function fetchWishlist(uid: string) {
    const { data } = await supabase
      .from("wishlists")
      .select("id, course_id, created_at, course:courses(id, title, slug, description, icon, gradient, category, modules(lessons(id)))")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/wishlist"); return; }
      setUser(user);
      await fetchWishlist(user.id);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function removeFromWishlist(wishlistId: string) {
    setRemovingId(wishlistId);
    await supabase.from("wishlists").delete().eq("id", wishlistId);
    setItems((prev) => prev.filter((i) => i.id !== wishlistId));
    setRemovingId(null);
  }

  async function enrollCourse(courseId: string) {
    if (!user) return;
    setEnrollingId(courseId);
    await supabase.from("enrollments").upsert({ user_id: user.id, course_id: courseId });
    setEnrollingId(null);
    router.push(`/tutorials`);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <Loader2 className="animate-spin" size={32} color="var(--brand-primary)" />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + 40px)", paddingBottom: "100px", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div className="section-container" style={{ maxWidth: "900px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
            <Link href="/dashboard" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>Dashboard</Link>
            <ChevronRight size={14} />
            <span>Wishlist</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            My Wishlist
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {items.length > 0 ? `${items.length} course${items.length !== 1 ? "s" : ""} saved for later.` : "Start saving courses you want to learn."}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div style={{
            padding: "80px 40px", textAlign: "center",
            background: "var(--bg-card)", borderRadius: "var(--radius-xl)",
            border: "1px dashed var(--border-secondary)",
            display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.06)", color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "24px"
            }}>
              <Heart size={40} />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "380px", lineHeight: 1.6 }}>
              Browse our course library and click the heart icon to save courses you're interested in.
            </p>
            <Link href="/tutorials" className="btn-primary" style={{ textDecoration: "none", padding: "14px 32px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={18} /> Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {items.map((item) => {
              const course = item.course;
              const totalLessons = course?.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
              const color = course?.gradient?.match(/#[a-fA-F0-9]{6}/)?.[0] || "#6366f1";

              return (
                <div key={item.id} style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "var(--radius-xl)",
                  padding: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  transition: "all 0.2s ease",
                  flexWrap: "wrap"
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  {/* Icon */}
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "16px",
                    background: `${color}15`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.8rem", flexShrink: 0
                  }}>
                    {course?.icon || "📚"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/tutorials/${course?.slug}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px", lineHeight: 1.3 }}>
                        {course?.title}
                      </h3>
                    </Link>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {course?.description}
                    </p>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "5px" }}>
                        <BookOpen size={13} /> {totalLessons} lessons
                      </span>
                      {course?.category && (
                        <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "6px", background: "var(--bg-tertiary)", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase" }}>
                          {course.category}
                        </span>
                      )}
                      <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                        Saved {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={removingId === item.id}
                      title="Remove from wishlist"
                      style={{
                        padding: "10px", borderRadius: "10px",
                        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                        color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center"
                      }}
                    >
                      {removingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                    <button
                      onClick={() => enrollCourse(course.id)}
                      disabled={enrollingId === course.id}
                      className="btn-primary"
                      style={{ padding: "10px 20px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {enrollingId === course.id ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Enroll</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
