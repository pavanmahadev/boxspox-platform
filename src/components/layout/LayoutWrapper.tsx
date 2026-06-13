"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { AITutor } from "@/components/editor/AITutor";
import { MaintenanceView } from "./MaintenanceView";
import { createClient } from "@/utils/supabase/client";

export function LayoutWrapper({ children, settings, courses }: { children: React.ReactNode, settings: any, courses: any[] }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isInstructorPage = pathname?.startsWith("/instructor");
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password");
  
  // Exact match for the active exam taking page: /exams/[id] (but not /exams/[id]/results)
  const isExamSessionPage = pathname?.match(/^\/exams\/[^\/]+$/);

  const [loading, setLoading] = useState(false); // Default to false to show content immediately
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAiAccess, setHasAiAccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (settings?.maintenance_mode) setMaintenanceMode(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
          setIsAdmin(profile?.role === "admin");
          setHasAiAccess(profile?.role === "admin" || profile?.role === "instructor");
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
        setHasAiAccess(profile?.role === "admin" || profile?.role === "instructor");
      } else {
        setIsAdmin(false);
        setHasAiAccess(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAdminPage || isInstructorPage || isExamSessionPage) {
    return <>{children}</>;
  }

  if (maintenanceMode && !isAdmin && !isAuthPage) {
    return <MaintenanceView />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="mesh-gradient" />
      <Navbar initialSettings={settings} initialCourses={courses} />
      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>{children}</main>
      <Footer initialSettings={settings} />
      <MobileNav />
      {hasAiAccess && <AITutor />}
    </div>
  );
}
