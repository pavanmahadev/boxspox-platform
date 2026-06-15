"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, BarChart3, ChevronLeft, Megaphone } from "lucide-react";

export function InstructorSidebar({ onNavItemClick }: { onNavItemClick?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { icon: <BarChart3 size={20} />, label: "Dashboard", href: "/instructor" },
    { icon: <BookOpen size={20} />, label: "My Courses", href: "/instructor/courses" },
    { icon: <BookOpen size={20} />, label: "Exams", href: "/instructor/exams" },
    { icon: <Megaphone size={20} />, label: "Announcements", href: "/instructor/announcements" },
  ];

  return (
    <aside style={{ 
      width: "280px", 
      height: "100%",
      background: "var(--bg-card)", 
      borderRight: "1px solid var(--border-primary)", 
      display: "flex", 
      flexDirection: "column",
      boxShadow: "4px 0 20px rgba(0,0,0,0.02)"
    }}>
      <div style={{ padding: "32px 24px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", padding: "0 12px" }}>
             <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <Users size={18} />
             </div>
             <span style={{ fontSize: "14px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "0.5px" }}>INSTRUCTOR</span>
          </div>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={onNavItemClick}
                style={{
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  padding: "14px 16px",
                  borderRadius: "14px", 
                  color: isActive ? "var(--brand-primary)" : "var(--text-secondary)", 
                  background: isActive ? "var(--bg-secondary)" : "transparent",
                  textDecoration: "none",
                  fontWeight: 700, 
                  transition: "all 0.2s", 
                  fontSize: "14px"
                }}
                className="instructor-nav-item"
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div style={{ marginTop: "auto", padding: "24px" }}>
        <Link 
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px",
            borderRadius: "10px",
            color: "var(--text-tertiary)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600
          }}
        >
          <ChevronLeft size={16} /> Back to Student
        </Link>
      </div>

      <style>{`
        .instructor-nav-item:hover {
          background: var(--bg-secondary);
          color: var(--brand-primary) !important;
        }
      `}</style>
    </aside>
  );
}
