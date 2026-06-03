import React from 'react';
import { Flame, Zap } from 'lucide-react';

interface StreakTrackerProps {
  progress: any[];
  streak: number;
}

export function StreakTracker({ progress, streak }: StreakTrackerProps) {
  // Weekly Streak Calendar calculation
  const getWeeklyStreak = () => {
    const days = [];
    const todayDate = new Date();
    
    // We want the last 7 days (including today) in chronological order
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(todayDate.getDate() - i);
      
      const isCompleted = progress.some((p: any) => {
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

  return (
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
          {streak} Day{streak !== 1 ? "s" : ""}
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
        background: streak >= 3 ? "linear-gradient(135deg, #ff4d4d, #f59e0b)" : "var(--bg-secondary)",
        color: streak >= 3 ? "white" : "var(--text-secondary)",
        border: streak >= 3 ? "none" : "1px solid var(--border-primary)",
        fontSize: "0.8rem",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: streak >= 3 ? "0 8px 16px -4px rgba(255, 77, 77, 0.25)" : "none"
      }}>
        <Zap size={16} color={streak >= 3 ? "#fff" : "#ff4d4d"} fill={streak >= 3 ? "#fff" : "#ff4d4d"} />
        <div style={{ lineHeight: "1.3" }}>
          {streak >= 3 ? (
            <span><strong>1.5x XP Booster Active!</strong> Keep your streak going to maintain the bonus! 🚀</span>
          ) : (
            <span>Get a <strong>3-day streak</strong> to activate the <strong>1.5x XP Booster</strong>! ⚡</span>
          )}
        </div>
      </div>
    </div>
  );
}
