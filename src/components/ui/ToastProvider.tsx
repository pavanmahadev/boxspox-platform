"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const supabase = createClient();

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback((message: string, type: ToastType = "success", title?: string) => {
    toastIdCounter++;
    const id = `toast-${toastIdCounter}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  useEffect(() => {
    // Listen for Realtime Announcements
    const announcementChannel = supabase.channel('announcements')
      .on('broadcast', { event: 'new-announcement' }, (payload: { payload: { message: string; type?: ToastType } }) => {
        showToast(payload.payload.message, payload.payload.type || "info", "Platform Update");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(announcementChannel);
    };
  }, [showToast, supabase]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 9999,
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(16px)",
              color: "white",
              padding: "16px 20px",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.1)'}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              minWidth: "320px",
              animation: "toastIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          >
            <div style={{ marginTop: "2px" }}>
              {toast.type === "success" && <CheckCircle size={20} color="#10B981" />}
              {toast.type === "error" && <AlertCircle size={20} color="#EF4444" />}
              {toast.type === "info" && <Info size={20} color="#3B82F6" />}
            </div>
            
            <div style={{ flex: 1 }}>
              {toast.title && <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "2px" }}>{toast.title}</div>}
              <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: 1.4 }}>{toast.message}</div>
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: "4px" }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
