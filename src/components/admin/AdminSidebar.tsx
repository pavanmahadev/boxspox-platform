"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Megaphone,
  Cpu,
  Briefcase,
  FolderOpen,
  Activity,
  DollarSign,
  Tag,
  Ticket
} from "lucide-react";

const menuSections = [
  {
    label: "General",
    items: [
      { name: "Overview", icon: <LayoutDashboard size={20} />, href: "/admin" },
      { name: "Courses", icon: <BookOpen size={20} />, href: "/admin/courses" },
      { name: "Categories", icon: <FolderOpen size={20} />, href: "/admin/categories" },
      { name: "Articles", icon: <FileText size={20} />, href: "/admin/articles" },
      { name: "Learning Paths", icon: <TrendingUp size={20} />, href: "/admin/paths" },
    ],
  },
  {
    label: "Sales & Finance",
    items: [
      { name: "Financial Dashboard", icon: <DollarSign size={20} />, href: "/admin/finance" },
      { name: "Coupons & Promo", icon: <Ticket size={20} />, href: "/admin/coupons" },
      { name: "Global Sales", icon: <Tag size={20} />, href: "/admin/sales" },
    ],
  },
  {
    label: "Community",
    items: [
      { name: "User Management", icon: <Users size={20} />, href: "/admin/users" },
      { name: "Submissions", icon: <FileText size={20} />, href: "/admin/submissions" },
      { name: "Course Reviews", icon: <MessageSquare size={20} />, href: "/admin/reviews" },
      { name: "Live Activity", icon: <Activity size={20} />, href: "/admin/activity" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Manage Ads", icon: <Megaphone size={20} />, href: "/admin/ads" },
      { name: "Manage Jobs", icon: <Briefcase size={20} />, href: "/admin/jobs" },
      { name: "AI Usage", icon: <Cpu size={20} />, href: "/admin/ai-usage" },
      { name: "Settings", icon: <Settings size={20} />, href: "/admin/settings" },
    ],
  },
];

export function AdminSidebar({ onNavItemClick }: { onNavItemClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside style={{
      width: "260px",
      height: "100vh",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 100,
      borderRight: "1px solid var(--border-primary)"
    }}>
      {/* Brand */}
      <div style={{ padding: "24px", borderBottom: "1px solid #F3F4F6" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "14px" }}>B</div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>PANDASCHOOL <span style={{ color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700 }}>ADMIN</span></span>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "20px 12px", overflowY: "auto" }}>
        {menuSections.map((section) => (
          <div key={section.label} style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px", padding: "0 12px" }}>
              {section.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavItemClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: isActive ? "#111827" : "#6B7280",
                      background: isActive ? "#F3F4F6" : "transparent",
                      fontWeight: isActive ? 700 : 600,
                      fontSize: "13px",
                      transition: "all 0.1s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: isActive ? "#111827" : "#9CA3AF" }}>{item.icon}</span>
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "20px", borderTop: "1px solid #F3F4F6" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--text-tertiary)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "12px"
          }}
        >
          <ExternalLink size={16} />
          View Website
        </Link>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#EF4444",
            background: "none",
            border: "none",
            padding: "10px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13px",
            transition: "background 0.1s"
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
