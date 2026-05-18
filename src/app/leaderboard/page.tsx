"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  ChevronRight, 
  User,
  Crown,
  Flame,
  Zap,
  Sparkles,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"xp" | "streak">("xp");
  const supabase = createClient();

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, xp, streak, role")
        .order(metric, { ascending: false })
        .limit(50);

      if (!error && data) {
        setTopUsers(data);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, [supabase, metric]);

  const getRankTier = (userXp: number) => {
    if (userXp >= 10000) return { label: "Grandmaster", color: "#a855f7", icon: "💎", bg: "rgba(168, 85, 247, 0.08)" };
    if (userXp >= 5000) return { label: "Master", color: "#ec4899", icon: "👑", bg: "rgba(236, 72, 153, 0.08)" };
    if (userXp >= 2000) return { label: "Expert", color: "#3b82f6", icon: "⚔️", bg: "rgba(59, 130, 246, 0.08)" };
    if (userXp >= 500) return { label: "Apprentice", color: "#10b981", icon: "📜", bg: "rgba(16, 185, 129, 0.08)" };
    return { label: "Initiate", color: "#64748b", icon: "🚀", bg: "rgba(100, 116, 139, 0.08)" };
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "140px 20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Skeleton width="200px" height="40px" style={{ marginBottom: "40px", margin: "0 auto" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "60px", alignItems: "end" }}>
            <Skeleton height="200px" borderRadius="24px" />
            <Skeleton height="260px" borderRadius="24px" />
            <Skeleton height="180px" borderRadius="24px" />
          </div>
          {Array(10).fill(0).map((_, i) => (
            <Skeleton key={i} height="80px" borderRadius="16px" style={{ marginBottom: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  const podium = topUsers.slice(0, 3);
  const podiumDisplay = [
    podium[1] || null,
    podium[0] || null,
    podium[2] || null
  ];

  const rest = topUsers.slice(3);

  // Compute metrics summaries
  const totalXP = topUsers.reduce((sum, u) => sum + (u.xp || 0), 0);
  const avgStreak = topUsers.length > 0 ? Math.round(topUsers.reduce((sum, u) => sum + (u.streak || 0), 0) / topUsers.length) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "140px 20px 80px", position: "relative", overflow: "hidden" }}>
      
      {/* Curved background glows */}
      <div style={{ position: "absolute", top: "-200px", left: "10%", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(15, 110, 86, 0.03)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "200px", right: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.02)", filter: "blur(120px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        
        {/* Header Block */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ 
              width: "88px", 
              height: "88px", 
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))", 
              borderRadius: "24px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 24px",
              color: "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.15)"
            }}
          >
            <Trophy size={44} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }} />
          </motion.div>
          
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.4rem)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
            Global Leaderboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "560px", margin: "0 auto 36px", fontWeight: 500, lineHeight: 1.6 }}>
            The absolute best developers of the Boxspox community. Complete lessons to climb the heights of glory.
          </p>

          {/* Stats Summaries Row */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "24px", 
            marginBottom: "40px", 
            flexWrap: "wrap" 
          }}>
            <div style={{ background: "var(--bg-card)", padding: "14px 28px", borderRadius: "18px", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
              <Sparkles size={20} color="var(--brand-primary)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Community XP</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-primary)" }}>{totalXP.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ background: "var(--bg-card)", padding: "14px 28px", borderRadius: "18px", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
              <Flame size={20} color="#ff4d4d" fill="#ff4d4d" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Average Streak</div>
                <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-primary)" }}>{avgStreak} Days</div>
              </div>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div style={{ 
            display: "inline-flex", 
            background: "var(--bg-card)", 
            padding: "6px", 
            borderRadius: "16px", 
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)" 
          }}>
            <button 
              onClick={() => setMetric("xp")}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                background: metric === "xp" ? "var(--brand-primary)" : "transparent",
                color: metric === "xp" ? "white" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              All-Time XP
            </button>
            <button 
              onClick={() => setMetric("streak")}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                background: metric === "streak" ? "var(--brand-primary)" : "transparent",
                color: metric === "streak" ? "white" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              Streak Champions
            </button>
          </div>
        </div>

        {/* Podium Area */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
          gap: "24px", 
          marginBottom: "60px", 
          alignItems: "flex-end",
          padding: "0 10px"
        }}>
          {podiumDisplay.map((user, i) => {
            if (!user) return <div key={i} style={{ display: "none" }} />;
            const isFirst = i === 1;
            const isSecond = i === 0;
            const isThird = i === 2;
            
            const badge = getRankTier(user.xp);

            // Set specific styles depending on ranking position
            let cardBg = "var(--bg-card)";
            let cardBorder = "1px solid var(--border-primary)";
            let shadow = "var(--shadow-sm)";
            let highlightColor = "#f59e0b"; // default gold
            
            if (isFirst) {
              cardBg = "linear-gradient(180deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))";
              cardBorder = "2px solid #fbbf24";
              shadow = "0 20px 40px rgba(245, 158, 11, 0.12), inset 0 0 20px rgba(245, 158, 11, 0.05)";
              highlightColor = "#f59e0b";
            } else if (isSecond) {
              cardBg = "linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.02))";
              cardBorder = "2px solid #94a3b8";
              shadow = "0 15px 30px rgba(148, 163, 184, 0.08)";
              highlightColor = "#94a3b8";
            } else if (isThird) {
              cardBg = "linear-gradient(180deg, rgba(180, 83, 9, 0.08), rgba(180, 83, 9, 0.02))";
              cardBorder = "2px solid #d97706";
              shadow = "0 12px 24px rgba(180, 83, 9, 0.06)";
              highlightColor = "#b45309";
            }

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: i * 0.15 }}
                className="podium-card"
                style={{
                  background: cardBg,
                  padding: "36px 24px 24px",
                  borderRadius: "28px",
                  textAlign: "center",
                  border: cardBorder,
                  boxShadow: shadow,
                  position: "relative",
                  height: isFirst ? "340px" : "290px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "transform 0.3s ease"
                }}
              >
                {/* Visual Rank Award Top Graphic */}
                <div style={{ position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)" }}>
                  {isFirst && (
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                      <Crown size={52} fill="#f59e0b" color="#fbbf24" style={{ filter: "drop-shadow(0 6px 8px rgba(245,158,11,0.3))" }} />
                    </motion.div>
                  )}
                  {isSecond && <Medal size={44} fill="#94a3b8" color="#cbd5e1" />}
                  {isThird && <Medal size={44} fill="#b45309" color="#d97706" />}
                </div>
                
                {/* Profile Photo Area */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ 
                    width: isFirst ? "96px" : "80px", 
                    height: isFirst ? "96px" : "80px", 
                    borderRadius: "50%", 
                    background: "var(--brand-primary)",
                    border: `4px solid ${highlightColor}`,
                    boxShadow: `0 8px 24px ${highlightColor}20`,
                    marginBottom: "12px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "white"
                  }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (user.full_name || "U").charAt(0).toUpperCase()
                    )}
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.full_name || "Anonymous User"}
                  </h3>
                  
                  {/* XP Tier Badge */}
                  <span style={{ 
                    fontSize: "0.7rem", 
                    color: badge.color, 
                    fontWeight: 800, 
                    background: badge.bg, 
                    padding: "3px 10px", 
                    borderRadius: "20px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {badge.icon} {badge.label}
                  </span>
                </div>

                {/* Metric value block */}
                <div style={{ width: "100%", marginTop: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "6px", 
                    color: metric === "xp" ? "var(--brand-primary)" : "#ff4d4d", 
                    fontWeight: 900, 
                    fontSize: "1.25rem" 
                  }}>
                    {metric === "xp" ? (
                      <>
                        <Zap size={20} fill="currentColor" /> 
                        <span>{user.xp.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-tertiary)" }}>XP</span></span>
                      </>
                    ) : (
                      <>
                        <Flame size={20} fill="currentColor" className="flame-wiggle" /> 
                        <span>{user.streak || 0} <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-tertiary)" }}>Days</span></span>
                      </>
                    )}
                  </div>
                  
                  {/* Mini-details */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px", fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600 }}>
                    {metric === "xp" ? (
                      <span>🔥 {user.streak || 0} Days</span>
                    ) : (
                      <span>⚡ {user.xp.toLocaleString()} XP</span>
                    )}
                  </div>
                </div>

                {/* Absolute position RANK badge */}
                <div style={{ 
                  position: "absolute", 
                  bottom: "-15px", 
                  background: highlightColor, 
                  color: "white", 
                  padding: "4px 18px", 
                  borderRadius: "12px", 
                  fontSize: "0.85rem", 
                  fontWeight: 900,
                  boxShadow: `0 6px 12px ${highlightColor}40`
                }}>
                  RANK {isFirst ? 1 : isSecond ? 2 : 3}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* List rankings block */}
        <div style={{ 
          background: "var(--bg-card)", 
          borderRadius: "28px", 
          border: "1px solid var(--border-primary)", 
          overflow: "hidden", 
          boxShadow: "var(--shadow-md)" 
        }}>
          <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)40" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Rank & Learner</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>{metric === "xp" ? "All-Time XP" : "Consistency"}</span>
          </div>

          {rest.map((user, i) => {
            const badge = getRankTier(user.xp);
            
            return (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + (i * 0.03) }}
                style={{ 
                  padding: "16px 32px", 
                  borderBottom: i === rest.length - 1 ? "none" : "1px solid var(--border-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  transition: "all 0.2s ease",
                  position: "relative"
                }}
                className="leaderboard-item"
              >
                {/* Rank number */}
                <div style={{ width: "32px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-tertiary)", textAlign: "center" }}>
                  #{i + 4}
                </div>

                {/* Avatar with dynamic border */}
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "var(--brand-primary)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid var(--border-secondary)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  flexShrink: 0
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (user.full_name || "U").charAt(0).toUpperCase()
                  )}
                </div>

                {/* Profile Information details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.full_name || "Anonymous Learner"}
                    </span>
                    {user.role === 'admin' && (
                      <span style={{ background: "var(--brand-primary)15", color: "var(--brand-primary)", padding: "1px 6px", borderRadius: "6px", fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 900, letterSpacing: "0.5px" }}>
                        Staff
                      </span>
                    )}
                    
                    {/* XP rank tier badge */}
                    <span style={{ fontSize: "0.65rem", color: badge.color, fontWeight: 700, background: badge.bg, padding: "2px 8px", borderRadius: "10px" }}>
                      {badge.icon} {badge.label}
                    </span>
                  </div>
                  
                  {/* Secondary info details */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                      {metric === "xp" ? (
                        <>
                          <Flame size={14} color="#ff4d4d" fill="#ff4d4d" /> 
                          <span>{user.streak || 0} Day Streak</span>
                        </>
                      ) : (
                        <>
                          <Zap size={14} color="var(--brand-primary)" fill="var(--brand-primary)" /> 
                          <span>{user.xp.toLocaleString()} XP</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main metric ranking score value */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {metric === "xp" ? (
                    <>
                      <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--brand-primary)", display: "flex", alignItems: "center", justifyItems: "flex-end", gap: "4px" }}>
                        <Zap size={16} fill="currentColor" /> {user.xp.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Total XP</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#ff4d4d", display: "flex", alignItems: "center", justifyItems: "flex-end", gap: "4px" }}>
                        <Flame size={16} fill="currentColor" className="flame-wiggle" /> {user.streak || 0}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Active Streak</div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      <style>{`
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
        .leaderboard-item {
          border-left: 3px solid transparent;
        }
        .leaderboard-item:hover {
          background: var(--bg-secondary)30;
          border-left-color: var(--brand-primary);
        }
        .podium-card:hover {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}
