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
import { BadgeGrid } from "@/components/dashboard/BadgeGrid";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { ActiveCourses } from "@/components/dashboard/ActiveCourses";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";

interface DashboardClientProps {
  user: any;
  initialProfile: any;
  initialProgress: any[];
  initialCertificates: any[];
  initialEnrollments: any[];
  wishlistCount: number;
}

export default function DashboardClient({ 
  user, 
  initialProfile, 
  initialProgress, 
  initialCertificates, 
  initialEnrollments, 
  wishlistCount 
}: DashboardClientProps) {
  const [profile, setProfile] = useState<any>(initialProfile);
  const [progress, setProgress] = useState<any[]>(initialProgress);
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>(initialCertificates);
  const [streak, setStreak] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(0);
  const router = useRouter();

  // Process initial data
  useEffect(() => {
    // Process active courses
    const processedCourses = initialEnrollments.map((enrollment: any) => {
      const course = enrollment.course;
      if (!course) return null;

      const totalLessons = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;
      const completedLessons = progress.filter((p: any) => p.lesson?.course?.id === course.id).length || 0;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      let nextLessonSlug = null;
      let nextLessonTitle = null;
      
      if (course.modules && course.modules.length > 0) {
        // Flatten all lessons into a single array
        const allLessons = course.modules.flatMap((m: any) => m.lessons || []);
        
        // Find the first uncompleted lesson
        for (const lesson of allLessons) {
          const isCompleted = progress.some((p: any) => p.lesson_id === lesson.id);
          if (!isCompleted) {
            nextLessonSlug = lesson.slug;
            nextLessonTitle = lesson.title;
            break;
          }
        }
      }

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        category: course.category || "development",
        progress: progressPercent,
        total: totalLessons,
        completed: completedLessons,
        next_lesson_slug: nextLessonSlug,
        next_lesson_title: nextLessonTitle,
        color: course.gradient?.match(/#[a-fA-F0-9]{6}/)?.[0] || "#6366f1",
        icon: course.icon || "📚",
        exam_unlocked: enrollment.exam_unlocked,
        is_free: course.price === 0 || course.price === "0" || course.price === null
      };
    }).filter(Boolean);

    setActiveCourses(processedCourses);

    // Calculate Streak
    if (progress && progress.length > 0) {
      const uniqueDates = Array.from(new Set(
        progress.map((p: any) => new Date(p.completed_at).toDateString())
      )).map((d: any) => new Date(d as string)).sort((a: any, b: any) => b.getTime() - a.getTime());

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      
      let lastDate = uniqueDates[0];
      lastDate.setHours(0,0,0,0);

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
  }, [initialEnrollments, progress]);

  // Realtime subscriptions
  useEffect(() => {
    const profileSub = subscribeToChannel(`profiles`, 'UPDATE', (payload) => {
      if (payload.new.id === user?.id) {
        setProfile(payload.new);
      }
    });

    const progressSub = subscribeToChannel(`user_progress`, 'INSERT', (payload) => {
      if (payload.new.user_id === user?.id) {
        setProgress(prev => [payload.new, ...prev]);
      }
    });

    return () => {
      if (profileSub) profileSub();
      if (progressSub) progressSub();
    };
  }, [user?.id]);

  const stats = [
    { label: "Total XP", value: (profile?.xp || 0).toLocaleString(), icon: <TrendingUp size={20} />, color: "#6366f1" },
    { label: "Daily Streak", value: `${profile?.streak || 0} Days`, icon: <Flame size={20} />, color: "#ff4d4d" },
    { label: "Boxspox Coins", value: (profile?.coins || 0).toLocaleString(), icon: <Target size={20} />, color: "#f59e0b" },
    { label: "Lessons Done", value: progress.length.toString(), icon: <CheckCircle2 size={20} />, color: "#10b981" },
  ];



  // Badges completion checks (now requiring a higher completion rate, calculated via activeCourses if available, otherwise just checking if they started it and using it as a fallback)
  const getCourseProgress = (slugMatch: string) => {
    const course = activeCourses.find(c => c.slug.toLowerCase().includes(slugMatch.toLowerCase()));
    if (course) return course.progress;
    // Fallback: if not in activeCourses, check if there's any progress
    return progress.some(p => p.lesson?.course?.slug?.includes(slugMatch)) ? 10 : 0;
  };

  const unlockedBadges = {
    htmlHero: getCourseProgress('html') >= 80,
    cssChampion: getCourseProgress('css') >= 80,
    jsJedi: getCourseProgress('javascript') >= 80,
    pythonPathfinder: getCourseProgress('python') >= 80,
    sqlSage: getCourseProgress('sql') >= 80,
    gitGuardian: getCourseProgress('git') >= 80,
    reactMaster: getCourseProgress('react') >= 80,
    nodeNinja: getCourseProgress('node') >= 80,
    dataPro: getCourseProgress('data') >= 80,
  };
  
  // Also pass detailed progress for tooltip info
  const badgeProgress = {
    htmlHero: getCourseProgress('html'),
    cssChampion: getCourseProgress('css'),
    jsJedi: getCourseProgress('javascript'),
    pythonPathfinder: getCourseProgress('python'),
    sqlSage: getCourseProgress('sql'),
    gitGuardian: getCourseProgress('git'),
    reactMaster: getCourseProgress('react'),
    nodeNinja: getCourseProgress('node'),
    dataPro: getCourseProgress('data'),
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

            <ActivityHeatmap progress={progress} />

            <ActiveCourses activeCourses={activeCourses} />

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
            <StreakTracker progress={progress} streak={profile?.streak || 0} />

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
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)" }}>#{Math.max(1, 150 - Math.floor((profile?.xp || 0) / 100))}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: 700, marginTop: "8px" }}>
                  {profile?.xp || 0} XP earned so far
                </div>
              </div>
            </div>

            {/* Achievements - Custom SVG Badges */}
            <BadgeGrid unlockedBadges={unlockedBadges} badgeProgress={badgeProgress} />

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
