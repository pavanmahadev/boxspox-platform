import React from "react";
import { CourseForm } from "@/components/admin/CourseForm";
import { createClient } from "@/utils/supabase/server";

export default async function NewInstructorCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
          Create New Course
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Start building your new course curriculum.</p>
      </div>

      <CourseForm instructorId={user?.id} />
    </div>
  );
}
