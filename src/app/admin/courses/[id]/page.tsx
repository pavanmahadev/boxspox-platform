import React from "react";
import { CourseForm } from "@/components/admin/CourseForm";
import { CourseCurriculum } from "@/components/admin/CourseCurriculum";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

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
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          Edit Course
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Refine and update your curriculum details.</p>
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
