import React from "react";
import { CourseForm } from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
          Create New Course
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Fill in the details below to launch a new learning experience.</p>
      </div>

      <CourseForm />
    </div>
  );
}
