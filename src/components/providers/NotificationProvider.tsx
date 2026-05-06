"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToChannel } from "@/utils/realtime";
import { createClient } from "@/utils/supabase/client";

/**
 * Boxspox Realtime Notification System
 * - Listens for new database notifications
 * - Manages toast alerts for async actions
 * - Realtime broadcast channel
 */

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addToast: (title: string, message: string, type?: Notification['type']) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 1. Subscribe to Postgres Notifications Table (if it exists)
    const cleanup = subscribeToChannel('notifications', 'INSERT', (payload: any) => {
      const newNotif = payload.new;
      addToast(newNotif.title, newNotif.message, newNotif.type);
    });

    // 2. Listen for Broadcast Announcements
    const announcementChannel = supabase.channel('announcements')
      .on('broadcast', { event: 'new-announcement' }, (payload: any) => {
        addToast("Broadcast", payload.payload.message, payload.payload.type);
      })
      .subscribe();

    return () => {
      cleanup();
      supabase.removeChannel(announcementChannel);
    };
  }, []);

  const addToast = (title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const newNotif: Notification = { id, title, message, type, timestamp: new Date().toISOString() };
    
    setNotifications(prev => [newNotif, ...prev]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addToast, removeToast }}>
      {children}
      
      {/* Toast UI */}
      <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 10000, display: "flex", flexDirection: "column", gap: "12px", pointerEvents: "none" }}>
        {notifications.map((n) => (
          <div key={n.id} style={{ 
            pointerEvents: "auto",
            minWidth: "300px",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            padding: "16px 20px",
            borderRadius: "16px",
            color: "white",
            border: `1px solid ${n.type === 'success' ? '#10B981' : n.type === 'error' ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            animation: "toast-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: n.type === 'success' ? '#10B981' : n.type === 'error' ? '#EF4444' : 'white' }}>{n.title}</div>
            <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: 1.4 }}>{n.message}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
