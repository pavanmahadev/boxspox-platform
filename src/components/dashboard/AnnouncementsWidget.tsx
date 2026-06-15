import React, { useState } from "react";
import { Megaphone, X, BookOpen, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AnnouncementsWidget({ announcements }: { announcements: any[] }) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  if (!announcements || announcements.length === 0) return null;

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <AnimatePresence>
        {visibleAnnouncements.map(announcement => {
          const isSiteWide = announcement.type === "site_wide";
          
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
              style={{
                background: isSiteWide ? "#EEF2FF" : "#ECFDF5",
                border: `1px solid ${isSiteWide ? "#C7D2FE" : "#A7F3D0"}`,
                borderRadius: "16px",
                padding: "20px",
                position: "relative",
                display: "flex",
                gap: "16px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
              }}
            >
              <button 
                onClick={() => setDismissedIds([...dismissedIds, announcement.id])}
                style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: isSiteWide ? "#6366F1" : "#10B981" }}
                title="Dismiss Announcement"
              >
                <X size={16} />
              </button>

              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "12px", 
                background: isSiteWide ? "#6366F1" : "#10B981", 
                color: "white", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                flexShrink: 0
              }}>
                {isSiteWide ? <AlertCircle size={24} /> : <BookOpen size={24} />}
              </div>

              <div style={{ flex: 1, paddingRight: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: isSiteWide ? "#4F46E5" : "#059669" }}>
                    {isSiteWide ? "Platform Update" : `Course: ${announcement.courses?.title}`}
                  </span>
                  <span style={{ fontSize: "11px", color: isSiteWide ? "#818CF8" : "#34D399" }}>•</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: isSiteWide ? "#6366F1" : "#10B981" }}>
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#111827", marginBottom: "8px" }}>
                  {announcement.title}
                </h4>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {announcement.content}
                </p>
                <div style={{ fontSize: "11px", fontWeight: 600, color: isSiteWide ? "#818CF8" : "#34D399", marginTop: "12px" }}>
                  By {announcement.profiles?.full_name || (isSiteWide ? "Admin" : "Instructor")}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
