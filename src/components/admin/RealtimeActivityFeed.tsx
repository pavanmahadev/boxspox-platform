"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { subscribeToChannel } from "@/utils/realtime";
import { createClient } from "@/utils/supabase/client";

/**
 * Boxspox: Realtime Admin Activity Feed
 * Listens for new audit logs and updates the UI instantly
 */

interface ActivityLog {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
  metadata?: any;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function RealtimeActivityFeed({ initialLogs }: { initialLogs: ActivityLog[] }) {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const supabase = createClient();

  const fetchLatestLogs = async () => {
    const { data } = await supabase
      .from("activity_logs")
      .select("*, profiles!inner(id, full_name, email, role)")
      .order("created_at", { ascending: false })
      .limit(8);
    
    if (data) setLogs(data);
  };

  useEffect(() => {
    // Subscribe to new activity logs
    const cleanup = subscribeToChannel('activity_logs', 'INSERT', () => {
      fetchLatestLogs();
    });

    return cleanup;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {logs.length > 0 ? (
        logs.map((log) => (
          <div key={log.id} style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--border-primary)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "var(--text-tertiary)" }}>
              {(log.profiles?.email || "S").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                {log.profiles?.full_name || log.profiles?.email || "System"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                {log.action} {log.target_type}: {log.metadata?.title || log.target_id}
              </div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#9CA3AF" }}>
              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))
      ) : (
        <div style={{ 
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
          <Clock size={24} color="var(--text-tertiary)" style={{ opacity: 0.5 }} />
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>No recent activity recorded</span>
        </div>
      )}
    </div>
  );
}
