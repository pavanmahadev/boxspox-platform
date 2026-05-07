"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle2,
  Trophy,
  Target,
  Settings,
  Heart,
  Flame
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton, CourseCardSkeleton } from "@/components/ui/Skeleton";
import { subscribeToChannel } from "@/utils/realtime";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    // Hard timeout: if ANYTHING takes longer than 15s, stop loading and redirect
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        console.warn("Dashboard load timed out — FORCING redirect to login");
        setLoading(false);
        window.location.replace("/login");
      }
    }, 15000);

    async function getDashboardData() {
      try {
        // Fast session check with a local timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Session timeout")), 5000));

        let session;
        try {
          const result: any = await Promise.race([sessionPromise, timeoutPromise]);
          session = result.data?.session;
          console.log("Session result received:", session ? "User found" : "No user");
        } catch (e) {
          console.warn("Session check timed out or failed, attempting to continue...");
        }

        if (cancelled) return;

        if (!session?.user) {
          console.log("No user session, FORCING redirect to login...");
          setLoading(false);
          window.location.replace("/login");
          return;
        }

        const authUser = session.user;
        setUser(authUser);

        console.log("Fetching dashboard data for user:", authUser.id);

        const [
          certsRes,
          enrollmentsRes,
          progressRes,
          profileRes,
          wishlistRes
        ] = await Promise.all([
          supabase.from("certificates").select(`*, course:courses (title, slug, image_url)`).eq("user_id", authUser.id),
          supabase.from("enrollments").select(`*, course:courses (id, title, slug, icon, gradient, modules:modules (lessons:lessons (id)))`).eq("user_id", authUser.id),
          supabase.from("user_progress").select(`*, lesson:lessons!inner(id, title, slug, course:courses!inner(id, title, slug, image_url))`).eq("user_id", authUser.id).order("completed_at", { ascending: false }),
          supabase.from("profiles").select("*").eq("id", authUser.id).single(),
          supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", authUser.id)
        ]);

        const certs = certsRes.data;
        const enrollmentData = enrollmentsRes.data;
        const userProgress = progressRes.data;
        const prof = profileRes.data;
        const wlCount = wishlistRes.count;

        if (cancelled) return;

        setCertificates(certs || []);
        setProfile(prof);
        setWishlistCount(wlCount || 0);

        // Calculate progress for each enrolled course
        const processedCourses = enrollmentData?.map((enrollment: any) => {
          const course = enrollment.course;
          if (!course) return null;

          const totalLessons = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;
          const completedLessons = userProgress?.filter((p: any) => p.lesson?.course?.id === course.id).length || 0;
          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            id: course.id,
            title: course.title,
            slug: course.slug,
            progress: progressPercent,
            total: totalLessons,
            completed: completedLessons,
            color: course.gradient?.match(/#[a-fA-F0-9]{6}/)?.[0] || "#6366f1",
            icon: course.icon || "📚"
          };
        }).filter(Boolean) || [];

        setActiveCourses(processedCourses);
        setProgress(userProgress || []);

        // Calculate Streak
        if (userProgress && userProgress.length > 0) {
          const uniqueDates = Array.from(new Set(
            userProgress.map((p: any) => new Date(p.completed_at).toDateString())
          )).map((d: any) => new Date(d)).sort((a: any, b: any) => b.getTime() - a.getTime());

          let currentStreak = 0;
          const today = new Date();
          today.setHours(0,0,0,0);
          
          let lastDate = uniqueDates[0];
          lastDate.setHours(0,0,0,0);

          // If the last activity was today or yesterday, the streak is alive
          const diff = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
          
          if (diff <= 1) {
            currentStreak = 1;
            for (let i = 0; i < uniqueDates.length - 1; i++) {
              const d1 = uniqueDates[i];
              const d2 = uniqueDates[i+1];
              const dayDiff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
              if (dayDiff === 1) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
          setStreak(currentStreak);
        }
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    }

    getDashboardData();

    // Realtime Profile Updates
    const profileSub = subscribeToChannel(`profiles`, 'UPDATE', (payload) => {
      if (payload.new.id === user?.id) {
        setProfile(payload.new);
      }
    });

    // Realtime Progress Updates
    const progressSub = subscribeToChannel(`user_progress`, 'INSERT', (payload) => {
      if (payload.new.user_id === user?.id) {
        // Re-fetch everything to ensure progress percentages are accurate
        getDashboardData();
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (profileSub) profileSub();
      if (progressSub) progressSub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount to prevent infinite loops

  if (loading && !user) {
    return (
      <div className="dashboard-container" style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "148px 20px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
            <Skeleton width="64px" height="64px" borderRadius="50%" />
            <div style={{ flex: 1 }}>
              <Skeleton width="40%" height="28px" style={{ marginBottom: "8px" }} />
              <Skeleton width="60%" height="18px" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
             {Array(4).fill(0).map((_, i) => <Skeleton key={i} height="100px" borderRadius="16px" />)}
          </div>
          <div className="dashboard-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
               {Array(3).fill(0).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
            <Skeleton height="400px" borderRadius="24px" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { label: "Points Earned", value: (progress.length * 100).toLocaleString(), icon: <TrendingUp size={20} />, color: "#6366f1" },
    { label: "Daily Streak", value: `${streak} Days`, icon: <Flame size={20} />, color: "#ff4d4d" },
    { label: "Lessons Done", value: progress.length.toString(), icon: <CheckCircle2 size={20} />, color: "#10b981" },
    { label: "Certificates", value: certificates.length.toString(), icon: <Award size={20} />, color: "#f59e0b" },
  ];

  // Daily Goal Logic
  const today = new Date().toDateString();
  const lessonsToday = progress.filter(p => new Date(p.completed_at).toDateString() === today).length;
  const dailyGoal = 3;
  const goalProgress = Math.min((lessonsToday / dailyGoal) * 100, 100);

  return (
    <div className="dashboard-container" style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "calc(var(--nav-height) + 40px) 20px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 auto" }}>
            {/* Avatar */}
            <div style={{ 
              width: "clamp(56px, 15vw, 72px)", 
              height: "clamp(56px, 15vw, 72px)", 
              borderRadius: "50%", 
              background: profile?.avatar_url ? "transparent" : "var(--brand-primary)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "1.5rem", 
              fontWeight: 800, 
              color: "white", 
              overflow: "hidden", 
              border: "3px solid var(--bg-card)", 
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: "clamp(1.2rem, 5vw, 1.8rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px", lineHeight: 1.2 }}>
                Hey, {user.user_metadata?.full_name || user.email?.split("@")[0]}! 👋
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", opacity: 0.8 }}>
                Pick up where you left off.
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/settings")}
            className="btn-primary" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "10px 20px",
              fontSize: "0.85rem",
              borderRadius: "12px",
              width: "auto"
            }}
          >
            <Settings size={16} /> Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {stats.map((stat, i) => (
            <div 
              key={i} 
              style={{ 
                background: "var(--bg-card)", 
                padding: "24px", 
                borderRadius: "var(--radius-lg)", 
                border: "1px solid var(--border-primary)",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${stat.color}15`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 32px;
          }
          .course-card {
            display: flex;
            align-items: center;
            gap: 24px;
            background: var(--bg-card);
            padding: 24px;
            border-radius: var(--radius-xl);
            border: 1px solid var(--border-primary);
            transition: all 0.2s ease;
          }
          @media (max-width: 1024px) {
            .dashboard-grid {
              grid-template-columns: 1fr;
            }
            .dashboard-container {
              padding-top: 100px !important;
            }
          }
          @media (max-width: 640px) {
            .dashboard-container {
              padding-top: calc(var(--nav-height) + 24px) !important;
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            .course-card {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }
            .course-card .btn-primary {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>

        <div className="dashboard-grid">
          
          {/* Main Content: Active Courses */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>My Courses</h2>
              <Link href="/tutorials" style={{ color: "var(--brand-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>View all</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activeCourses.length > 0 ? (
                activeCourses.map((course, i) => (
                  <div key={i} className="course-card">
                    <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `${course.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: course.color, flexShrink: 0 }}>
                      {course.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "10px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course.title}</h3>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, flexShrink: 0 }}>{course.completed}/{course.total}</span>
                      </div>
                      <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${course.progress}%`, height: "100%", background: `linear-gradient(90deg, ${course.color}, ${course.color}dd)`, borderRadius: "4px", transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <Link 
                      href={`/tutorials/${course.slug}`} 
                      className="btn-primary" 
                      style={{ padding: "10px 20px", fontSize: "0.9rem", whiteSpace: "nowrap" }}
                    >
                      Continue
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: "60px 24px", 
                  textAlign: "center", 
                  background: "var(--bg-card)", 
                  borderRadius: "var(--radius-xl)", 
                  border: "1px dashed var(--border-secondary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 4px 20px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "50%", 
                    background: "rgba(15, 110, 86, 0.05)", 
                    color: "var(--brand-primary)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginBottom: "24px"
                  }}>
                    <BookOpen size={40} />
                  </div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Your learning journey starts here</h3>
                  <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.05rem", maxWidth: "400px", lineHeight: 1.6 }}>
                    You haven&apos;t enrolled in any courses yet. Explore our library to find the perfect course to kickstart your career.
                  </p>
                  <Link href="/paths" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", padding: "14px 32px", fontSize: "1rem" }}>
                    Explore Learning Paths
                  </Link>
                </div>
              )}
            </div>

            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "40px", marginBottom: "20px" }}>Recent Activity</h2>
            <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
              {progress.length > 0 ? (
                progress.slice(0, 5).map((item, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: "16px 24px", 
                      borderBottom: i === Math.min(progress.length, 5) - 1 ? "none" : "1px solid var(--border-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px"
                    }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.lesson?.title || "Unknown Lesson"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
                        {item.lesson?.course?.title || "Course"} • {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "Date unknown"}
                      </div>
                    </div>
                    <Link href={`/tutorials/${item.lesson?.course?.slug || "general"}/${item.lesson?.slug || ""}`} style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-tertiary)" }}>
                  <Target size={40} style={{ marginBottom: "16px", opacity: 0.3 }} />
                  <p style={{ fontWeight: 500 }}>No activity yet. Start a lesson to see it here!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Leaderboard & Goals */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Daily Goal */}
            <div style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", padding: "28px", borderRadius: "var(--radius-xl)", color: "white", boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Trophy size={24} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Daily Goal</h3>
              </div>
              <p style={{ fontSize: "0.95rem", opacity: 0.9, marginBottom: "20px", fontWeight: 500 }}>
                {lessonsToday >= dailyGoal 
                  ? "Goal achieved! You're crushing it today! 🚀" 
                  : `Complete ${dailyGoal - lessonsToday} more lessons to hit your daily goal!`}
              </p>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ width: `${goalProgress}%`, height: "100%", background: "white", borderRadius: "4px", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: "0.85rem", textAlign: "right", fontWeight: 700 }}>
                {`${lessonsToday} / ${dailyGoal} Lessons`}
              </div>
            </div>

            {/* My Certificates */}
            {certificates.length > 0 && (
              <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>My Certificates</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {certificates.map((cert) => (
                    <Link 
                      key={cert.id} 
                      href={`/certificates/${cert.id}`}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "12px", 
                        padding: "12px", 
                        borderRadius: "12px", 
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--brand-primary)")}
                      onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border-primary)")}
                    >
                      <Award size={24} color="#f59e0b" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cert.course?.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Issued {new Date(cert.issued_at).toLocaleDateString()}</div>
                      </div>
                      <ChevronRight size={18} style={{ color: "var(--brand-primary)" }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>Achievements</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { icon: "⚡", label: "Fast Learner", active: progress.length > 5 },
                  { icon: "🎯", label: "Perfect Score", active: certificates.length > 0 },
                  { icon: "🔥", label: "Early Bird", active: progress.length > 0 },
                  { icon: "🚀", label: "Pioneer", active: true },
                  { icon: "💎", label: "Certified", active: certificates.length > 1 },
                  { icon: "🛠️", label: "Builder", active: activeCourses.length > 2 },
                ].map((ach, i) => (
                  <div key={i} style={{ textAlign: "center", opacity: ach.active ? 1 : 0.3, filter: ach.active ? "none" : "grayscale(1)", transition: "all 0.3s ease" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--bg-secondary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 8px", border: ach.active ? "1px solid var(--brand-primary)40" : "1px solid transparent" }}>
                      {ach.icon}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{ach.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wishlist */}
            <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Heart size={18} color="#ef4444" fill="rgba(239,68,68,0.15)" /> My Wishlist
              </h3>
              {wishlistCount > 0 ? (
                <>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
                    You have <strong>{wishlistCount}</strong> course{wishlistCount !== 1 ? "s" : ""} saved for later.
                  </p>
                  <Link href="/wishlist" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
                    View Wishlist <ChevronRight size={14} />
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>Save courses to your wishlist to revisit them later.</p>
                  <Link href="/tutorials" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 20px", borderRadius: "10px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
                    Browse Courses <ChevronRight size={14} />
                  </Link>
                </>
              )}
            </div>

            {/* Help & Support */}
            <div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-primary)", textAlign: "center", background: "rgba(99, 102, 241, 0.03)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 500 }}>Stuck on a lesson? Get help from our AI Tutor.</p>
              <Link href="/playground" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Ask AI Tutor <ChevronRight size={14} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
