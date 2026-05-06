"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Layers, User, Search } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Courses", href: "/tutorials", icon: BookOpen },
    { label: "Search", href: "/tutorials?focus=true", icon: Search, trigger: "search" },
    { label: "Paths", href: "/paths", icon: Layers },
    { label: "Me", href: "/dashboard", icon: User },
  ];

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-search"));
  };

  return (
    <nav 
      className="mobile-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-primary)",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom))",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 1000,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.04)"
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link 
            key={item.label}
            href={item.href}
            onClick={item.trigger === "search" ? handleSearchClick : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none",
              color: isActive ? "var(--brand-primary)" : "var(--text-tertiary)",
              transition: "all 0.2s ease",
              flex: 1
            }}
          >
            <div style={{
              padding: "6px 16px",
              borderRadius: "20px",
              background: isActive ? "rgba(15, 110, 86, 0.08)" : "transparent",
              transition: "all 0.2s ease"
            }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: "10px", fontWeight: isActive ? 800 : 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {item.label}
            </span>
          </Link>
        );
      })}

      <style>{`
        .mobile-bottom-nav {
          display: none !important;
        }
        @media (max-width: 640px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </nav>
  );
}
