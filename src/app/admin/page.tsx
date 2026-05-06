import React from "react";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  CheckCircle,
  Plus,
  ArrowUpRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { RealtimeActivityFeed } from "@/components/admin/RealtimeActivityFeed";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch basic stats
  const [
    { count: userCount },
    { count: courseCount },
    { count: enrollmentCount },
    { count: progressCount },
    { count: _reviewCount },
    { count: _certCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("user_progress").select("*", { count: "exact", head: true }),
    supabase.from("course_reviews").select("*", { count: "exact", head: true }),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
  ]);

  // Fetch real activity logs with profile data
  const { data: activityLogs } = await supabase
    .from("activity_logs")
    .select("*, profiles!inner(id, full_name, email, role)")
    .order("created_at", { ascending: false })
    .limit(8);

  // Fetch recent signups
  const { data: recentSignups } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Users", value: userCount || 0, icon: <Users size={18} />, color: "#3B82F6", change: "Registered" },
    { label: "Active Courses", value: courseCount || 0, icon: <BookOpen size={18} />, color: "#10B981", change: "Published" },
    { label: "Enrollments", value: enrollmentCount || 0, icon: <TrendingUp size={18} />, color: "#7C3AED", change: "All time" },
    { label: "Lessons Finished", value: progressCount || 0, icon: <CheckCircle size={18} />, color: "#F59E0B", change: "Completions" },
  ];

  return (
    <div style={{ paddingBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            System Overview
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Real-time metrics for the Boxspox ecosystem.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ 
            background: "var(--bg-card)", 
            color: "var(--text-primary)", 
            padding: "10px 20px", 
            borderRadius: "8px", 
            border: "1px solid var(--border-primary)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer"
          }}>
            Export Stats
          </button>
          <Link href="/admin/courses/new" style={{ 
            background: "#111827", 
            color: "white", 
            padding: "10px 20px", 
            borderRadius: "8px", 
            textDecoration: "none", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            fontSize: "14px"
          }}>
            <Plus size={18} /> New Course
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ 
            background: "var(--bg-card)", 
            padding: "24px", 
            borderRadius: "16px", 
            border: "1px solid var(--border-primary)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${stat.color}10`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#10B981", background: "#ECFDF5", padding: "4px 8px", borderRadius: "4px" }}>
                {stat.change}
              </span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px" }}>{stat.value}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-tertiary)", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity and Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))", gap: "24px", marginBottom: "32px" }}>
        
        {/* Performance Chart Placeholder */}
        <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "24px" }}>Platform Engagement</h2>
          <div style={{ height: "200px", display: "flex", alignItems: "flex-end", gap: "12px", padding: "0 10px" }}>
            {[65, 45, 75, 55, 85, 40, 90].map((height, i) => (
              <div key={i} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ 
                  width: "100%", 
                  height: `${height}%`, 
                  background: i === 6 ? "#111827" : "#F3F4F6", 
                  borderRadius: "6px 6px 0 0",
                  transition: "all 0.3s ease"
                }} />
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", marginTop: "8px" }}>Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800 }}>Audit Trail</h2>
            <Link href="/admin/activity" style={{ color: "#2563EB", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>View History</Link>
          </div>
          <RealtimeActivityFeed initialLogs={activityLogs || []} />
        </div>

      </div>

      {/* Recent Signups Section */}
      <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "20px" }}>New Registrations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {recentSignups && recentSignups.length > 0 ? (
            recentSignups.map((user) => (
              <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg-card)", color: "#4F46E5", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                  {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.full_name || "New User"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: "1 / -1",
              padding: "40px 20px", 
              textAlign: "center", 
              background: "var(--bg-secondary)", 
              borderRadius: "12px", 
              border: "1px dashed var(--border-secondary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px"
            }}>
              <Users size={24} color="var(--text-tertiary)" style={{ opacity: 0.5 }} />
              <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>No signups yet</span>
            </div>
          )}
        </div>
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #F3F4F6" }}>
          <Link href="/admin/users" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-tertiary)", fontSize: "13px", textDecoration: "none", fontWeight: 700 }}>
            Manage All Users <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
