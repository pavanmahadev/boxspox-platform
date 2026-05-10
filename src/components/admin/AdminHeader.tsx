"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminHeader({ email, breadcrumbs }: { email: string | undefined, breadcrumbs: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="admin-topbar" style={{
        height: "64px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        position: "sticky",
        top: 0,
        zIndex: 90
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="show-mobile"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
              marginLeft: "-8px",
              display: "none" // Managed by CSS
            }}
          >
            <Menu size={24} />
          </button>
          {breadcrumbs}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="hidden-mobile" style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>Admin Panel</div>
            <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{email}</div>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}>
            {email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 140,
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
          display: "none"
        }}
      />

      <div className={`admin-sidebar-container ${isSidebarOpen ? 'open' : ''}`} style={{ position: "relative" }}>
         <AdminSidebar onNavItemClick={() => setIsSidebarOpen(false)} />
         <button 
            onClick={() => setIsSidebarOpen(false)}
            className="show-mobile"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderRadius: "50%",
              padding: "6px",
              zIndex: 160,
              display: "none",
              color: "var(--text-primary)",
              cursor: "pointer"
            }}
         >
            <X size={18} />
         </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .show-mobile { display: block !important; }
          .hidden-mobile { display: none !important; }
          .admin-sidebar-overlay.open { display: block !important; opacity: 1 !important; pointer-events: auto !important; }
          .admin-sidebar-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100vh !important;
            z-index: 9999 !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: var(--bg-card);
          }
          .admin-sidebar-container aside {
            width: 100% !important;
          }
          .admin-sidebar-container.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
