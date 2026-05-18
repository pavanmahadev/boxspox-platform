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
  Flame,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton, CourseCardSkeleton } from "@/components/ui/Skeleton";
import { subscribeToChannel } from "@/utils/realtime";
import DailyChallenge from "@/components/dashboard/DailyChallenge";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(0);
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

        // Parallel fetch with a dedicated timeout for the data batch
        const dataPromise = Promise.all([
          supabase.from("certificates").select(`*, course:courses (title, slug, image_url)`).eq("user_id", authUser.id),
          supabase.from("enrollments").select(`*, course:courses (id, title, slug, icon, gradient, price, exam_fee, modules:modules (lessons:lessons (id)))`).eq("user_id", authUser.id),
          supabase.from("user_progress").select(`*, lesson:lessons!inner(id, title, slug, course:courses!inner(id, title, slug, image_url))`).eq("user_id", authUser.id).order("completed_at", { ascending: false }),
          supabase.from("profiles").select("*").eq("id", authUser.id).single(),
          supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", authUser.id)
        ]);

        const dataTimeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Data fetch timeout")), 6000));

        let results: any[];
        try {
          results = await Promise.race([dataPromise, dataTimeoutPromise]) as any[];
        } catch (e) {
          console.warn("Dashboard data fetch partial timeout, using fallback or empty states");
          results = [ { data: [] }, { data: [] }, { data: [] }, { data: null }, { count: 0 } ];
        }

        const [
          certsRes,
          enrollmentsRes,
          progressRes,
          profileRes,
          wishlistRes
        ] = results;

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
            icon: course.icon || "📚",
            exam_unlocked: enrollment.exam_unlocked,
            is_free: course.price === 0 || course.price === "0" || course.price === null
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
  }, [triggerFetch]); // Re-fetch on manual reward claims

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
    { label: "Total XP", value: (profile?.xp || 0).toLocaleString(), icon: <TrendingUp size={20} />, color: "#6366f1" },
    { label: "Daily Streak", value: `${profile?.streak || 0} Days`, icon: <Flame size={20} />, color: "#ff4d4d" },
    { label: "Boxspox Coins", value: (profile?.coins || 0).toLocaleString(), icon: <Target size={20} />, color: "#f59e0b" },
    { label: "Lessons Done", value: progress.length.toString(), icon: <CheckCircle2 size={20} />, color: "#10b981" },
  ];

  // Weekly Streak Calendar calculation
  const getWeeklyStreak = () => {
    const days = [];
    const todayDate = new Date();
    
    // We want the last 7 days (including today) in chronological order
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      
      const isCompleted = progress.some(p => {
        const pDate = new Date(p.completed_at);
        return pDate.getFullYear() === d.getFullYear() &&
               pDate.getMonth() === d.getMonth() &&
               pDate.getDate() === d.getDate();
      });
      
      days.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        dateStr: d.toDateString(),
        isToday: d.toDateString() === todayDate.toDateString(),
        isCompleted
      });
    }
    return days;
  };
  const weeklyDays = getWeeklyStreak();

  // Badges completion checks
  const unlockedBadges = {
    htmlHero: progress.some(p => p.lesson?.course?.slug === 'html'),
    cssChampion: progress.some(p => p.lesson?.course?.slug === 'css'),
    jsJedi: progress.some(p => p.lesson?.course?.slug === 'javascript'),
    pythonPathfinder: progress.some(p => p.lesson?.course?.slug === 'python'),
    sqlSage: progress.some(p => p.lesson?.course?.slug === 'sql'),
    gitGuardian: progress.some(p => p.lesson?.course?.slug?.includes('git'))
  };

  // Daily Goal Logic
  const today = new Date().toDateString();
  const lessonsToday = progress.filter(p => new Date(p.completed_at).toDateString() === today).length;
  const dailyGoal = 3;
  const goalProgress = Math.min((lessonsToday / dailyGoal) * 100, 100);

  return (
    <div className="dashboard-container" style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "calc(var(--nav-height) + var(--container-padding)) var(--container-padding) 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 auto" }}>
            {/* Avatar */}
            <div style={{ 
              width: "clamp(64px, 12vw, 80px)", 
              height: "clamp(64px, 12vw, 80px)", 
              borderRadius: "50%", 
              background: profile?.avatar_url ? "transparent" : "var(--brand-primary)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "1.8rem", 
              fontWeight: 800, 
              color: "white", 
              overflow: "hidden", 
              border: "4px solid var(--bg-card)", 
              flexShrink: 0,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
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
              padding: "12px 24px",
              fontSize: "0.9rem",
              borderRadius: "14px",
              width: "auto",
              boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.2)"
            }}
          >
            <Settings size={18} /> Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "20px", marginBottom: "40px" }}>
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="stat-item"
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
              <div className="stat-icon" style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${stat.color}15`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.08); opacity: 0.9; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes flameWiggle {
            0% { transform: rotate(0deg) scale(1); }
            25% { transform: rotate(-5deg) scale(1.05); }
            50% { transform: rotate(5deg) scale(0.98); }
            75% { transform: rotate(-3deg) scale(1.02); }
            100% { transform: rotate(0deg) scale(1); }
          }
          .flame-wiggle {
            animation: flameWiggle 1.5s ease-in-out infinite alternate;
          }
          .badge-hover {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .badge-hover:hover {
            transform: scale(1.15) rotate(5deg) !important;
            filter: drop-shadow(0 8px 16px rgba(0,0,0,0.18)) !important;
          }
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
            box-shadow: var(--shadow-sm);
          }
          .course-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            border-color: var(--brand-primary);
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
            .dashboard-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 16px !important;
            }
            .dashboard-header .btn-primary {
              width: 100% !important;
              justify-content: center !important;
            }
            .dashboard-container {
              padding-top: calc(var(--nav-height) + 20px) !important;
              padding-left: 12px !important;
              padding-right: 12px !important;
            }
            .course-card {
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
              padding: 20px;
            }
            .course-card .btn-primary {
              width: 100%;
              justify-content: center;
              padding: 14px;
            }
            .stats-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 12px !important;
            }
            .stat-item {
              padding: 16px !important;
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
            .stat-icon {
              width: 36px !important;
              height: 36px !important;
            }
          }
        `}</style>

        <div className="dashboard-grid">
          
          {/* Main Content: Active Courses */}
          <div style={{ minWidth: 0 }}>
            {profile && user && (
              <DailyChallenge 
                profile={profile} 
                user={user} 
                onRewardClaimed={() => setTriggerFetch(prev => prev + 1)} 
              />
            )}

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
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {!course.is_free && !course.exam_unlocked && (
                        <Link 
                          href={`/checkout/${course.id}`} 
                          className="btn-primary" 
                          style={{ padding: "10px 20px", fontSize: "0.9rem", whiteSpace: "nowrap", background: "var(--brand-primary)", color: "white" }}
                        >
                          Pay to Learn
                        </Link>
                      )}
                      <Link 
                        href={`/tutorials/${course.slug}`} 
                        className="btn-primary" 
                        style={{ padding: "10px 20px", fontSize: "0.9rem", whiteSpace: "nowrap", background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
                      >
                        Continue
                      </Link>
                    </div>
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
            
            {/* Visual Streak Tracker Calendar */}
            <div style={{ 
              background: "var(--bg-card)", 
              padding: "24px", 
              borderRadius: "var(--radius-xl)", 
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: "rgba(255, 77, 77, 0.04)",
                filter: "blur(45px)",
                pointerEvents: "none"
              }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flame size={20} color="#ff4d4d" style={{ animation: "pulse 2s infinite" }} /> Streak Tracker
                </h3>
                <span style={{ fontSize: "0.8rem", color: "var(--brand-primary)", fontWeight: 700, background: "rgba(15, 110, 86, 0.08)", padding: "4px 8px", borderRadius: "6px" }}>
                  {profile?.streak || 0} Day{profile?.streak !== 1 ? "s" : ""}
                </span>
              </div>

              {/* 7-Day Calendar Grid */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", marginBottom: "20px" }}>
                {weeklyDays.map((day, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 4px",
                      borderRadius: "10px",
                      background: day.isToday ? "rgba(15, 110, 86, 0.05)" : "var(--bg-secondary)",
                      border: day.isToday ? "1px solid var(--brand-primary)" : "1px solid var(--border-primary)",
                      boxShadow: day.isToday ? "0 4px 12px rgba(15, 110, 86, 0.1)" : "none",
                      position: "relative"
                    }}
                  >
                    <span style={{ 
                      fontSize: "0.65rem", 
                      color: day.isToday ? "var(--brand-primary)" : "var(--text-tertiary)", 
                      fontWeight: 800,
                      textTransform: "uppercase" 
                    }}>
                      {day.name}
                    </span>
                    
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "1rem",
                      background: day.isCompleted ? "linear-gradient(135deg, #ff7b00, #ff4d4d)" : "transparent",
                      color: day.isCompleted ? "white" : "var(--text-tertiary)",
                      border: day.isCompleted ? "none" : "2px dashed var(--border-secondary)",
                      boxShadow: day.isCompleted ? "0 4px 8px rgba(255, 77, 77, 0.3)" : "none",
                      transition: "all 0.3s ease"
                    }} className={day.isCompleted ? "flame-wiggle" : ""}>
                      {day.isCompleted ? "🔥" : "✓"}
                    </div>
                  </div>
                ))}
              </div>

              {/* XP Booster Prompt Banner */}
              <div style={{ 
                padding: "12px 16px", 
                borderRadius: "12px", 
                background: (profile?.streak || 0) >= 3 ? "linear-gradient(135deg, #ff4d4d, #f59e0b)" : "var(--bg-secondary)",
                color: (profile?.streak || 0) >= 3 ? "white" : "var(--text-secondary)",
                border: (profile?.streak || 0) >= 3 ? "none" : "1px solid var(--border-primary)",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: (profile?.streak || 0) >= 3 ? "0 8px 16px -4px rgba(255, 77, 77, 0.25)" : "none"
              }}>
                <Zap size={16} color={(profile?.streak || 0) >= 3 ? "#fff" : "#ff4d4d"} fill={(profile?.streak || 0) >= 3 ? "#fff" : "#ff4d4d"} />
                <div style={{ lineHeight: "1.3" }}>
                  {(profile?.streak || 0) >= 3 ? (
                    <span><strong>1.5x XP Booster Active!</strong> Keep your streak going to maintain the bonus! 🚀</span>
                  ) : (
                    <span>Get a <strong>3-day streak</strong> to activate the <strong>1.5x XP Booster</strong>! ⚡</span>
                  )}
                </div>
              </div>
            </div>

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

            {/* Leaderboard Teaser */}
            <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Trophy size={18} color="#f59e0b" /> Global Ranking
                </h3>
                <Link href="/leaderboard" style={{ fontSize: "0.8rem", color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600 }}>View All</Link>
              </div>
              <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)", textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>YOUR CURRENT RANK</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)" }}>#{Math.floor(Math.random() * 100) + 1}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: 700, marginTop: "8px" }}>
                  {profile?.xp || 0} XP earned so far
                </div>
              </div>
            </div>

            {/* Achievements - Custom SVG Badges */}
            <div style={{ 
              background: "var(--bg-card)", 
              padding: "24px", 
              borderRadius: "var(--radius-xl)", 
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                Unlockable Badges
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "20px", fontWeight: 500 }}>
                Learn in each path to unlock gorgeous vector developer badges!
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {[
                  { id: "html", label: "HTML Hero", desc: "Complete any HTML lesson", active: unlockedBadges.htmlHero, renderBadge: () => (
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <defs>
                        <linearGradient id="gHtml" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff6b35" />
                          <stop offset="100%" stopColor="#f04e23" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="45" fill="url(#gHtml)" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <path d="M50 25 L75 35 L70 68 L50 82 L30 68 L25 35 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" />
                      <text x="50" y="59" fill="#fff" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">H</text>
                    </svg>
                  )},
                  { id: "css", label: "CSS Champion", desc: "Complete any CSS lesson", active: unlockedBadges.cssChampion, renderBadge: () => (
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <defs>
                        <linearGradient id="gCss" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="45" fill="url(#gCss)" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <path d="M28 65 L28 40 L40 50 L50 35 L60 50 L72 40 L72 65 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
                      <circle cx="50" cy="35" r="3" fill="#fff" />
                      <circle cx="28" cy="40" r="3" fill="#fff" />
                      <circle cx="72" cy="40" r="3" fill="#fff" />
                      <text x="50" y="60" fill="#fff" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">CSS</text>
                    </svg>
                  )},
                  { id: "js", label: "JS Jedi", desc: "Complete any JavaScript lesson", active: unlockedBadges.jsJedi, renderBadge: () => (
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <defs>
                        <linearGradient id="gJs" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="45" fill="url(#gJs)" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <path d="M55 24 L32 50 L48 50 L42 76 L68 46 L50 46 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
                    </svg>
                  )},
                  { id: "python", label: "Python Pathfinder", desc: "Complete any Python lesson", active: unlockedBadges.pythonPathfinder, renderBadge: () => (
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <defs>
                        <linearGradient id="gPy" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="45" fill="url(#gPy)" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <circle cx="50" cy="50" r="20" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2.5" />
                      <path d="M50 35 L55 50 L50 65 L45 50 Z" fill="#fff" />
                    </svg>
                  )},
                  { id: "sql", label: "SQL Sage", desc: "Complete any SQL lesson", active: unlockedBadges.sqlSage, renderBadge: () => (
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <defs>
                        <linearGradient id="gSql" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6d28d9" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="45" fill="url(#gSql)" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <path d="M35 35 C35 30, 65 30, 65 35 C65 40, 35 40, 35 35 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2" />
                      <path d="M35 35 L35 50 C35 55, 65 55, 65 50 L65 35" fill="none" stroke="#fff" strokeWidth="2" />
                      <path d="M35 50 L35 65 C35 70, 65 70, 65 65 L65 50" fill="none" stroke="#fff" strokeWidth="2" />
                    </svg>
                  )},
                  { id: "git", label: "Git Guardian", desc: "Complete Git beginner guide", active: unlockedBadges.gitGuardian, renderBadge: () => (
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <defs>
                        <linearGradient id="gGit" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#64748b" />
                          <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="45" fill="url(#gGit)" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
                      <line x1="35" y1="35" x2="35" y2="65" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                      <line x1="35" y1="50" x2="65" y2="35" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="35" cy="35" r="7" fill="#fff" />
                      <circle cx="35" cy="65" r="7" fill="#fff" />
                      <circle cx="65" cy="35" r="7" fill="#fff" />
                    </svg>
                  )},
                ].map((ach, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      textAlign: "center", 
                      position: "relative",
                      cursor: "help"
                    }}
                    title={`${ach.label}\n${ach.desc}\n(${ach.active ? "UNLOCKED! 🎉" : "LOCKED 🔒"})`}
                  >
                    <div style={{ 
                      width: "60px", 
                      height: "60px", 
                      margin: "0 auto 8px",
                      filter: ach.active ? "drop-shadow(0 4px 8px rgba(0,0,0,0.12))" : "grayscale(1) opacity(0.3)",
                      transform: "scale(1)",
                      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }} className={ach.active ? "badge-hover" : ""}>
                      {ach.renderBadge()}
                    </div>
                    <div style={{ 
                      fontSize: "0.65rem", 
                      color: ach.active ? "var(--text-primary)" : "var(--text-tertiary)", 
                      fontWeight: 700,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap"
                    }}>
                      {ach.label}
                    </div>
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
            {(profile?.role === "admin" || profile?.role === "instructor") && (
              <div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-primary)", textAlign: "center", background: "rgba(99, 102, 241, 0.03)" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 500 }}>Stuck on a lesson? Get help from our AI Tutor.</p>
                <Link href="/playground" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Ask AI Tutor <ChevronRight size={14} />
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
