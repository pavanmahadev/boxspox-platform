import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorHeader } from "@/components/instructor/InstructorHeader";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/instructor");
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "instructor" && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div style={{ background: "var(--bg-secondary)", minHeight: "100vh", display: "flex" }}>
      {/* Desktop Sidebar */}
      <div className="hidden-mobile" style={{ width: "280px", flexShrink: 0 }}>
        <div style={{ position: "fixed", top: 0, bottom: 0, width: "280px" }}>
          <InstructorSidebar />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <InstructorHeader email={user.email} />

        {/* Main Content */}
        <main style={{ padding: "clamp(20px, 5vw, 40px)", flex: 1 }}>
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
