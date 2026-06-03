"use client";

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';

interface ActivityHeatmapProps {
  progress: any[];
}

export function ActivityHeatmap({ progress }: ActivityHeatmapProps) {
  // Generate data for the last 26 weeks
  const weeks = 26;
  const totalDays = weeks * 7;
  
  const { days } = useMemo(() => {
    // 1. Create a frequency map
    const counts = new Map<string, number>();
    progress.forEach(p => {
      const d = new Date(p.completed_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      counts.set(dateStr, (counts.get(dateStr) || 0) + 1);
    });

    // 2. Determine end date (Next Saturday)
    const today = new Date();
    today.setHours(0,0,0,0);
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = 6 - dayOfWeek;
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysUntilSaturday);

    // 3. Generate the 182 days
    const dayArray = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = counts.get(dateStr) || 0;
      dayArray.push({
        date: d,
        dateStr,
        count,
        isFuture: d.getTime() > today.getTime()
      });
    }

    return { days: dayArray };
  }, [progress]);

  // Color scaling based on count
  const getColor = (count: number, isFuture: boolean) => {
    if (isFuture) return "transparent";
    if (count === 0) return "var(--bg-secondary)"; // empty state
    if (count === 1) return "#a7f3d0"; // emerald-200
    if (count === 2) return "#34d399"; // emerald-400
    if (count >= 3) return "#059669"; // emerald-600
    return "var(--bg-secondary)";
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      padding: "24px",
      borderRadius: "var(--radius-xl)",
      border: "1px solid var(--border-primary)",
      marginBottom: "32px", // Spacing below stats
      boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Calendar size={20} color="var(--brand-primary)" />
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Learning Activity
        </h3>
      </div>
      
      <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "thin" }}>
        {/* Y-axis Labels (Mon, Wed, Fri) */}
        <div style={{ 
          display: "grid", 
          gridTemplateRows: "repeat(7, 14px)",
          gap: "4px",
          alignItems: "center",
          fontSize: "0.7rem", 
          color: "var(--text-tertiary)",
        }}>
          <span style={{ opacity: 0, lineHeight: 1 }}>Sun</span>
          <span style={{ lineHeight: 1 }}>Mon</span>
          <span style={{ opacity: 0, lineHeight: 1 }}>Tue</span>
          <span style={{ lineHeight: 1 }}>Wed</span>
          <span style={{ opacity: 0, lineHeight: 1 }}>Thu</span>
          <span style={{ lineHeight: 1 }}>Fri</span>
          <span style={{ opacity: 0, lineHeight: 1 }}>Sat</span>
        </div>

        {/* The Grid */}
        <div style={{
          display: "grid",
          gridTemplateRows: "repeat(7, 14px)",
          gridAutoFlow: "column",
          gap: "4px"
        }}>
          {days.map((day, i) => (
            <div
              key={i}
              title={day.isFuture ? undefined : `${day.count} lessons on ${day.date.toDateString()}`}
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "3px",
                background: getColor(day.count, day.isFuture),
                border: day.isFuture ? "1px dashed var(--border-primary)" : "1px solid rgba(0,0,0,0.05)",
                opacity: day.isFuture ? 0.3 : 1,
                cursor: day.isFuture ? "default" : "pointer",
                transition: "transform 0.1s"
              }}
              onMouseEnter={(e) => {
                if (!day.isFuture) e.currentTarget.style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                if (!day.isFuture) e.currentTarget.style.transform = "scale(1)";
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "16px", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
        <span>Less</span>
        <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "var(--bg-secondary)" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#a7f3d0" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#34d399" }} />
        <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#059669" }} />
        <span>More</span>
      </div>
    </div>
  );
}
