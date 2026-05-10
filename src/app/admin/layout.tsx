import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", minHeight: "100vh", display: "flex" }}>
      <div className="hidden-mobile">
        <AdminSidebar />
      </div>

      <div className="admin-main-container">
        <AdminHeader 
          email={user.email} 
          breadcrumbs={
            <Suspense fallback={<div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Admin</div>}>
              <AdminBreadcrumb />
            </Suspense>
          } 
        />

        <main style={{ padding: "clamp(16px, 5vw, 40px)", flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
