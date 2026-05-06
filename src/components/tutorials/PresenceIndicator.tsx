"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface PresenceIndicatorProps {
  lessonId: string;
  user: any;
}

export function PresenceIndicator({ lessonId, user }: PresenceIndicatorProps) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`lesson_presence:${lessonId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // Presence state is an object where keys are user IDs and values are arrays of presence objects.
        // We need to deduplicate to ensure unique keys during rendering.
        const uniqueUsers = Object.entries(state).map(([id, presences]: [string, any]) => ({
          ...presences[0],
          id // Ensure we have the ID for the key
        }));
        setOnlineUsers(uniqueUsers);
      })
      .on("presence", { event: "join" }, ({ newPresences }: { newPresences: any[] }) => {
        // Optional: show a small toast or log
      })
      .on("presence", { event: "leave" }, ({ leftPresences }: { leftPresences: any[] }) => {
        // Optional: show a small toast or log
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId, user, supabase]);

  if (onlineUsers.length <= 1) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "var(--bg-tertiary)",
      padding: "8px 16px",
      borderRadius: "12px",
      border: "1px solid var(--border-primary)",
      marginBottom: "24px"
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {onlineUsers.slice(0, 3).map((u, i) => (
          <div 
            key={u.id} 
            style={{ 
              width: "24px", 
              height: "24px", 
              borderRadius: "50%", 
              background: "var(--brand-primary)", 
              color: "white", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "10px", 
              fontWeight: 800,
              border: "2px solid var(--bg-card)",
              marginLeft: i === 0 ? 0 : "-8px"
            }}
          >
            {(u.full_name || "U").charAt(0).toUpperCase()}
          </div>
        ))}
        {onlineUsers.length > 3 && (
          <div style={{ 
            width: "24px", 
            height: "24px", 
            borderRadius: "50%", 
            background: "var(--bg-secondary)", 
            color: "var(--text-tertiary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "10px", 
            fontWeight: 800,
            border: "2px solid var(--bg-card)",
            marginLeft: "-8px"
          }}>
            +{onlineUsers.length - 3}
          </div>
        )}
      </div>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
        <span style={{ color: "var(--brand-primary)" }}>{onlineUsers.length} students</span> learning this right now
      </div>
      <div className="pulse-dot" style={{ width: "6px", height: "6px", background: "#10B981", borderRadius: "50%" }} />
      
      <style>{`
        .pulse-dot { animation: pulsePresence 2s infinite; }
        @keyframes pulsePresence {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
}
