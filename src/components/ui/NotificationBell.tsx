"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bell, Check, CheckCheck, X } from "lucide-react";

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setUnreadCount((data || []).filter((n: any) => !n.is_read).length);
  }

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => { fetchNotifications(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    fetchNotifications();
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications();
  }

  async function dismiss(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    fetchNotifications();
  }

  const typeColors: Record<string, string> = {
    info: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  };

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
          transition: "background 0.2s"
        }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#EF4444",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg-primary)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: "360px",
          maxWidth: "calc(100vw - 32px)",
          background: "var(--bg-card)",
          borderRadius: "20px",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          zIndex: 1000,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", margin: 0 }}>
              Notifications {unreadCount > 0 && <span style={{ background: "#EF4444", color: "white", borderRadius: "100px", padding: "2px 8px", fontSize: "0.7rem", marginLeft: "6px" }}>{unreadCount}</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-primary)", fontWeight: 700, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-tertiary)" }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: "12px" }} />
                <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-primary)",
                    background: n.is_read ? "transparent" : "rgba(15, 110, 86, 0.03)",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: typeColors[n.type] || "#3B82F6",
                    marginTop: "6px",
                    flexShrink: 0,
                    opacity: n.is_read ? 0.3 : 1
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: n.is_read ? 500 : 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                      {n.title}
                    </div>
                    {n.body && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{n.body}</div>}
                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "6px" }}>
                      {new Date(n.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)} title="Mark read" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-primary)", padding: "2px" }}>
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => dismiss(n.id)} title="Dismiss" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: "2px" }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
