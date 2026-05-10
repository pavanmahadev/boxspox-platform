import React from "react";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseCurriculum } from "@/components/admin/CourseCurriculum";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, GraduationCap } from "lucide-react";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) {
    notFound();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
            Edit Course
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Refine and update your curriculum details.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link 
            href={`/instructor/courses/${id}/exam`}
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", 
              background: "var(--brand-primary)", borderRadius: "10px", color: "white",
              textDecoration: "none", fontWeight: 700, fontSize: "13px"
            }}
          >
            <GraduationCap size={16} /> Exam Builder
          </Link>
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
      </div>

      <div style={{ marginBottom: "48px" }}>
        <CourseForm initialData={course} />
      </div>
      
      <div style={{ paddingTop: "40px", borderTop: "1px solid var(--border-primary)" }}>
        <CourseCurriculum courseId={course.id} />
      </div>
    </div>
  );
}
