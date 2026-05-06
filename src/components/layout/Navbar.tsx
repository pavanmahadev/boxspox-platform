"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Code2,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ChevronDown,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Layout,
  BookOpen,
  Zap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart
} from "lucide-react";
import { subscribeToChannel } from "@/utils/realtime";
import { SearchModal } from "@/components/layout/SearchModal";
import NotificationBell from "@/components/ui/NotificationBell";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { name: "Tutorials", href: "/tutorials" },
  { name: "References", href: "#" },
  { name: "Exercises", href: "#" },
  { name: "Certificates", href: "/certifications" },
];

const subNavLinks = [
  { name: "HTML", href: "/tutorials/html" },
  { name: "CSS", href: "/tutorials/css" },
  { name: "JAVASCRIPT", href: "/tutorials/javascript" },
  { name: "SQL", href: "/tutorials/sql" },
  { name: "PYTHON", href: "/tutorials/python" },
  { name: "JAVA", href: "/tutorials/java" },
  { name: "PHP", href: "/tutorials/php" },
  { name: "HOW TO", href: "#" },
  { name: "W3.CSS", href: "#" },
  { name: "C", href: "/tutorials/c" },
  { name: "C++", href: "/tutorials/cpp" },
  { name: "C#", href: "/tutorials/csharp" },
  { name: "BOOTSTRAP", href: "#" },
  { name: "REACT", href: "/tutorials/react" },
  { name: "MYSQL", href: "/tutorials/mysql" },
];

const tutorials = [
  { name: "HTML", href: "/tutorials/html", color: "#e34c26" },
  { name: "CSS", href: "/tutorials/css", color: "#264de4" },
  { name: "JavaScript", href: "/tutorials/javascript", color: "#f7df1e" },
  { name: "Python", href: "/tutorials/python", color: "#3776ab" },
  { name: "React", href: "/tutorials/react", color: "#61dafb" },
  { name: "SQL", href: "/tutorials/sql", color: "#00758f" },
];

const profileLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  borderRadius: "var(--radius-sm)",
  textDecoration: "none",
  color: "var(--text-secondary)",
  fontSize: "0.85rem",
  fontWeight: 500,
  transition: "all 0.2s ease",
};

import { TutorialsMenu } from "@/components/layout/TutorialsMenu";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [tutorialsOpen, setTutorialsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { showToast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const handleOpenSearch = () => setSearchOpen(true);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-search", handleOpenSearch);

    const getSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      if (data) setSettings(data);
    };

    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch Role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || "user");

        // Fetch Wishlist Count
        const { count } = await supabase
          .from("wishlists")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        setWishlistCount(count || 0);
      }
    };

    getUserData();

    // Realtime Wishlist Subscription
    const wishlistSub = subscribeToChannel('wishlists', '*', () => {
      getUserData(); // Re-fetch counts on any change
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getUserData();
      } else {
        setRole(null);
        setWishlistCount(0);
      }
    });

    // Global Announcement Listener
    const announcementChannel = supabase.channel('announcements')
      .on('broadcast', { event: 'new-announcement' }, (payload: any) => {
        // Show a nice toast for any community achievement
        showToast(payload.payload.message, payload.payload.type || 'info');
      })
      .subscribe();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-search", handleOpenSearch);
      subscription.unsubscribe();
      wishlistSub();
      supabase.removeChannel(announcementChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: "all 0.3s ease",
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "none"
    }}>
      {/* Main Navbar */}
      <nav
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        {/* Left Side: Logo & Tutorials Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginRight: "12px" }}>
            {settings?.logo_url ? (
                <img src={settings.logo_url} alt={settings.platform_name} style={{ height: "32px", width: "auto", borderRadius: "4px" }} />
            ) : (
                <Code2 size={28} color="var(--brand-primary)" />
            )}
            <span style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-1px",
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase"
            }}>
              {settings?.platform_name || "BOXSPOX"}
            </span>
          </Link>

          <button
            onClick={() => setTutorialsOpen(!tutorialsOpen)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: "var(--text-primary)",
              fontWeight: 700,
              fontSize: "0.9rem",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <BookOpen size={18} />
            Learn
            <ChevronDown size={14} color="#6B7280" style={{ transform: tutorialsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>
        </div>

        {/* Center/Right Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }} className="nav-links-desktop">
            <Link href="/paths" style={{ textDecoration: "none", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.9rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
              Learning Paths
            </Link>
            <Link href="/playground" style={{ textDecoration: "none", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.9rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
              Playground
            </Link>
          </div>

          <div style={{ width: "1px", height: "20px", background: "var(--border-primary)" }} className="nav-links-desktop" />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="nav-actions-desktop">
            <button
              onClick={() => setSearchOpen(true)}
              style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <Search size={20} />
            </button>

            <Link 
              href="/wishlist"
              style={{ 
                background: "transparent", 
                border: "none", 
                color: "var(--text-secondary)", 
                cursor: "pointer", 
                width: "40px", 
                height: "40px", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                position: "relative",
                textDecoration: "none",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "var(--brand-primary)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 800,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--bg-primary)"
                }}>
                  {wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {role === "admin" && (
                  <Link href="/admin" style={{ textDecoration: "none", color: "var(--brand-primary)", fontWeight: 700, fontSize: "12px", padding: "6px 10px", background: "rgba(15, 110, 86, 0.1)", borderRadius: "8px", whiteSpace: "nowrap" }}>
                    <span className="hidden-tablet">Admin</span>
                    <LayoutDashboard size={14} className="show-tablet-only" />
                  </Link>
                )}
                {role === "instructor" && (
                  <Link href="/instructor" style={{ textDecoration: "none", color: "var(--brand-primary)", fontWeight: 700, fontSize: "12px", padding: "6px 10px", background: "rgba(15, 110, 86, 0.1)", borderRadius: "8px", whiteSpace: "nowrap" }}>
                    <span className="hidden-tablet">Instructor</span>
                    <Zap size={14} className="show-tablet-only" />
                  </Link>
                )}
                <NotificationBell userId={user.id} />
                <Link href="/dashboard" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
                  {user.email?.charAt(0).toUpperCase()}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link href="/login" style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", padding: "8px 12px" }}>
                  Login
                </Link>
                <Link
                  href="/register"
                  style={{
                    background: "var(--brand-primary)",
                    color: "white",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  Start <span className="hidden-tablet">Free</span> <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="show-mobile-only"
            style={{ display: "none", background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: "8px" }}
          >
            <Search size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--text-primary)",
              cursor: "pointer",
              padding: "8px",
              marginLeft: "4px"
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed",
          inset: "64px 0 0",
          background: "var(--bg-card)",
          zIndex: 999,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          overflowY: "auto",
          animation: "slideDown 0.3s ease"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/paths" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}>Learning Paths</Link>
            <Link href="/projects" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}>Projects</Link>
            <Link href="/playground" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}>Playground</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none" }}>Pricing</Link>
          </div>
          <div style={{ height: "1px", background: "var(--bg-tertiary)" }} />
          {!user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ justifyContent: "center" }}>Login</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: "center" }}>Start Free</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ justifyContent: "center" }}>My Dashboard</Link>
              {role === "admin" && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ justifyContent: "center" }}>Admin Panel</Link>}
              {role === "instructor" && <Link href="/instructor" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ justifyContent: "center" }}>Instructor Panel</Link>}
              <button onClick={handleLogout} style={{ padding: "12px", borderRadius: "var(--radius-md)", background: "#FEE2E2", color: "#EF4444", border: "none", fontWeight: 700, cursor: "pointer" }}>Logout</button>
            </div>
          )}
        </div>
      )}

      {/* Sub Bar (Tutorials Scroll) - Hide on dashboard and specific pages */}
      {!["/dashboard", "/settings", "/admin", "/instructor", "/login", "/register", "/forgot-password"].some(p => pathname?.startsWith(p)) && (
        <nav
          className="sub-nav-bar"
          style={{
            background: "#1F2937",
            height: "44px",
            display: "flex",
            alignItems: "center",
            position: "relative",
            padding: "0 8px",
          }}
        >
        <button
          onClick={() => {
            const container = document.getElementById("sub-nav-container");
            if (container) container.scrollBy({ left: -200, behavior: "smooth" });
          }}
          style={{ position: "absolute", left: 0, zIndex: 10, background: "linear-gradient(90deg, #1F2937 80%, transparent)", border: "none", color: "white", height: "100%", width: "48px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={20} />
        </button>

        <div
          id="sub-nav-container"
          style={{ display: "flex", alignItems: "center", gap: "0", height: "100%", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", padding: "0 40px" }}
          className="hide-scrollbar"
        >
          {[
            "HTML", "CSS", "JAVASCRIPT", "SQL", "PYTHON", "JAVA", "PHP", "BOOTSTRAP", "REACT", "MYSQL", "JQUERY", "C++", "C#", "NODEJS", "TYPESCRIPT", "GIT", "POSTGRESQL", "MONGODB", "AI", "GO", "DSA", "ML", "NEXTJS"
          ].map((name) => (
            <Link
              key={name}
              href={`/tutorials/${name.toLowerCase().replace(".", "")}`}
              style={{
                color: "rgba(255,255,255,0.8)",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                height: "100%",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.background = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {name}
            </Link>
          ))}
        </div>

        <button
          onClick={() => {
            const container = document.getElementById("sub-nav-container");
            if (container) container.scrollBy({ left: 200, behavior: "smooth" });
          }}
          style={{ position: "absolute", right: 0, zIndex: 10, background: "linear-gradient(-90deg, #1F2937 80%, transparent)", border: "none", color: "white", height: "100%", width: "48px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronRight size={20} />
        </button>
      </nav>
      )}

      <TutorialsMenu isOpen={tutorialsOpen} onClose={() => setTutorialsOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .show-tablet-only { display: none !important; }
        @media (max-width: 1024px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
          .nav-actions-desktop { display: none !important; }
          .show-tablet-only { display: block !important; }
        }
        @media (max-width: 640px) {
          .hidden-tablet { display: none !important; }
          .mobile-menu-toggle { display: none !important; }
          .nav-actions-desktop { display: flex !important; }
          .nav-actions-desktop > button:not(:first-child) { display: none !important; }
        }
      `}</style>
    </header>
  );
}
