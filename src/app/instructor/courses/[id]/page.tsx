import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseCurriculum } from "@/components/admin/CourseCurriculum";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { InstructorLessonStats } from "@/components/instructor/InstructorLessonStats";

export default async function InstructorCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch course ensuring it belongs to this instructor
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("instructor_id", user?.id)
    .single();

  if (!course) {
    notFound();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px", paddingBottom: "60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            Edit Course
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Manage course details, modules, and lessons.</p>
        </div>
        <Link 
          href={`/tutorials/${course.slug}`} 
          target="_blank"
          style={{ 
            display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", 
            background: "var(--bg-secondary)", borderRadius: "10px", color: "var(--text-primary)",
            textDecoration: "none", fontWeight: 700, border: "1px solid var(--border-primary)",
            fontSize: "13px"
          }}
        >
          <ExternalLink size={16} /> View as Student
        </Link>
      </div>

      <InstructorLessonStats courseId={id} />

      <CourseForm initialData={course} instructorId={user?.id} />

      <div style={{ height: "1px", background: "var(--border-primary)", margin: "20px 0" }}></div>

      <CourseCurriculum courseId={id} />
    </div>
  );
}
