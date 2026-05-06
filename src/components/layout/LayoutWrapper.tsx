"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { AITutor } from "@/components/editor/AITutor";
import { MaintenanceView } from "./MaintenanceView";
import { createClient } from "@/utils/supabase/client";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isInstructorPage = pathname?.startsWith("/instructor");
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password");

  const [loading, setLoading] = useState(!isAdminPage && !isInstructorPage && !isAuthPage);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();


  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }
    let done = false;

    const finish = () => {
      if (!done) {
        done = true;
        setLoading(false);
      }
    };

    const checkStatus = async () => {
      try {
        // 1. Check Maintenance Mode with Cache Buster
        const { data: settings, error: settingsError } = await supabase
          .from("site_settings")
          .select("maintenance_mode")
          .limit(1)
          .single();
        
        if (settingsError) {
          console.warn("Maintenance check failed (likely RLS):", settingsError.message);
        } else if (settings?.maintenance_mode) {
          setMaintenanceMode(true);
        }

        // 2. Check User Role
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();
            
            if (profile?.role === "admin") {
              setIsAdmin(true);
            }
          }
        } catch (authErr) {
          console.warn("Auth check suppressed:", authErr);
        }

        finish();
      } catch (err) {
        console.error("Layout initialization failed:", err);
        finish();
      }
    };

    // Safety timeout: never stay in loading state longer than 3 seconds
    const timeout = setTimeout(finish, 3000);

    checkStatus();

    // Listen for auth changes to update admin status
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Admin and Instructor pages have their own full-page layout
  if (isAdminPage || isInstructorPage) {
    return <>{children}</>;
  }

  // If loading, show a simple shell to avoid flashes
  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "var(--bg-primary)", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        gap: "20px"
      }}>
        <div className="mesh-gradient" />
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "3px solid var(--bg-tertiary)", 
          borderTop: "3px solid var(--brand-primary)", 
          borderRadius: "50%",
        }} className="animate-spin" />
        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "1px", textTransform: "uppercase" }}>
          Boxspox Academy
        </div>
      </div>
    );
  }

  // Show maintenance view if enabled and not an admin/auth page
  // IMPORTANT: We only block if maintenanceMode is explicitly TRUE
  if (maintenanceMode && !isAdmin && !isAuthPage) {
    return <MaintenanceView />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="mesh-gradient" />
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <MobileNav />
      <AITutor />
    </div>
  );
}
