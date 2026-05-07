"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { BarChart3, Users, AlertCircle, Loader2 } from "lucide-react";

interface LessonStat {
  lesson_title: string;
  completion_count: number;
}

export function InstructorLessonStats({ courseId }: { courseId: string }) {
  const [stats, setStats] = useState<LessonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.rpc("get_lesson_engagement", { p_course_id: courseId });
      if (!error && data) {
        setStats(data);
      }
      setLoading(false);
    }
    fetchStats();
  }, [courseId, supabase]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
        <Loader2 className="animate-spin" size={24} color="var(--brand-primary)" />
        <p style={{ marginTop: "12px", color: "var(--text-tertiary)", fontSize: "14px" }}>Loading engagement data...</p>
      </div>
    );
  }

  if (stats.length === 0) return null;

  const maxCompletions = Math.max(...stats.map(s => s.completion_count), 1);

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-primary)", padding: "32px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart3 size={20} color="var(--brand-primary)" /> Student Drop-off & Engagement
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginTop: "4px" }}>Analyze which lessons students are completing.</p>
        </div>
        <div style={{ padding: "8px 16px", background: "var(--bg-secondary)", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={16} /> {stats[0]?.completion_count || 0} Total Starters
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {stats.map((lesson, i) => {
          const percentage = (lesson.completion_count / maxCompletions) * 100;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 600 }}>
                <span style={{ color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>
                  {i + 1}. {lesson.lesson_title}
                </span>
                <span style={{ color: "var(--text-tertiary)" }}>{lesson.completion_count} completed</span>
              </div>
              <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                <div 
                  style={{ 
                    position: "absolute", left: 0, top: 0, bottom: 0, 
                    width: `${percentage}%`, 
                    background: percentage > 70 ? "#10B981" : percentage > 30 ? "#F59E0B" : "#EF4444",
                    borderRadius: "4px",
                    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "32px", padding: "16px", background: "rgba(15, 110, 86, 0.05)", borderRadius: "12px", border: "1px solid rgba(15, 110, 86, 0.1)", display: "flex", gap: "12px" }}>
        <AlertCircle size={20} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong>Tip:</strong> Significant drops in completion counts (shown in red) may indicate lessons that are too difficult or have technical issues.
        </p>
      </div>
    </div>
  );
}
