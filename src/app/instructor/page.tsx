import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { InstructorDashboardClient } from "@/components/instructor/InstructorDashboardClient";

export default async function InstructorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Initial data fetch (SSR)
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status, enrollments(id), modules(lessons(id))")
    .eq("instructor_id", user?.id);

  const totalStudents = courses?.reduce((acc, course) => acc + (course.enrollments?.length || 0), 0) || 0;

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      {/* Welcome Header */}
      <div className="instructor-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "var(--h2-size)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)", letterSpacing: "-1px" }}>
            Instructor Dashboard
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "16px", fontWeight: 500 }}>
            Welcome back! You&apos;re making an impact on <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>{totalStudents}</span> students.
          </p>
        </div>
        <Link href="/instructor/courses/new" className="create-course-btn" style={{ 
          background: "var(--brand-primary)", 
          color: "white", 
          padding: "14px 28px", 
          borderRadius: "14px", 
          textDecoration: "none", 
          fontWeight: 800, 
          fontSize: "14px",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          gap: "10px",
          boxShadow: "0 10px 20px -5px rgba(15, 110, 86, 0.3)",
          transition: "transform 0.2s"
        }}>
          <Plus size={20} /> Create New Course
        </Link>
      </div>

      {/* Realtime Dashboard Client */}
      <InstructorDashboardClient initialCourses={courses || []} instructorId={user?.id || ""} />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .create-course-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        @media (max-width: 640px) {
          .instructor-header { flex-direction: column; align-items: flex-start !important; }
          .create-course-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
