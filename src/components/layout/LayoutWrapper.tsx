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

  const [loading, setLoading] = useState(false); // Default to false to show content immediately
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data: settings } = await supabase.from("site_settings").select("maintenance_mode").single();
        if (settings?.maintenance_mode) setMaintenanceMode(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
          if (profile?.role === "admin") setIsAdmin(true);
        }
      } catch (err) {
        console.warn("Status check failed:", err);
      }
    };

    checkStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAdminPage || isInstructorPage) {
    return <>{children}</>;
  }

  if (maintenanceMode && !isAdmin && !isAuthPage) {
    return <MaintenanceView />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="mesh-gradient" />
      <Navbar />
      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>{children}</main>
      <Footer />
      <MobileNav />
      <AITutor />
    </div>
  );
}
