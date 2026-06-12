import React from "react";
import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  BookOpen, 
  Settings, 
  Trash2, 
  Plus, 
  Edit,
  Shield,
  Clock
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log("ActivityPage user:", user?.email);

  // Fetch full activity logs with profile data
  const { data: activityLogs, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Activity logs fetch error:", error);
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create": return <Plus size={16} color="#10B981" />;
      case "update": return <Edit size={16} color="#3B82F6" />;
      case "delete": return <Trash2 size={16} color="#EF4444" />;
      case "login": return <Shield size={16} color="#7C3AED" />;
      default: return <Clock size={16} color="#6B7280" />;
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          System Audit Trail
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>Full history of all administrative and system actions.</p>
      </div>

      <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Time</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>User</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Action</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Target</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs && activityLogs.length > 0 ? (
                activityLogs.map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.2s" }} className="hover-bg-gray">
                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-tertiary)" }}>
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800 }}>
                          {(log.profiles?.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {log.profiles?.full_name || "System User"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{log.profiles?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {getActionIcon(log.action)}
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>{log.action}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ 
                        fontSize: "11px", 
                        fontWeight: 700, 
                        background: "var(--bg-tertiary)", 
                        color: "var(--text-secondary)", 
                        padding: "4px 8px", 
                        borderRadius: "4px",
                        textTransform: "uppercase"
                      }}>
                        {log.target_type}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "var(--text-tertiary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.metadata?.title || log.target_id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "80px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
                    No activity logs found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .hover-bg-gray:hover { background: #F9FAFB; }
      `}</style>
    </div>
  );
}
