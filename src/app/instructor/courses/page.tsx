import React from "react";
import { Plus, Edit2, Layers } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function InstructorCoursesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: courses, count } = await supabase
    .from("courses")
    .select("*, modules(id)", { count: "exact" })
    .eq("instructor_id", user?.id)
    .order("created_at", { ascending: false })
    .range(start, end);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            My Courses
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Manage your published and draft courses.</p>
        </div>
        <Link href="/instructor/courses/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={20} /> Add Course
        </Link>
      </div>

      <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
          <thead style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
            <tr>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Course</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Category</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Modules</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses?.map((course: any) => (
              <tr key={course.id} style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: course.gradient || "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px" }}>
                      {course.icon || "📚"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{course.title}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{course.slug}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-tertiary)", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    {course.category || "web"}
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ 
                    fontSize: "9px", padding: "4px 8px", borderRadius: "4px", fontWeight: 800, textTransform: "uppercase",
                    background: course.status === "published" ? "#ECFDF5" : course.status === "draft" ? "#FFFBEB" : "#F3F4F6",
                    color: course.status === "published" ? "#10B981" : course.status === "draft" ? "#F59E0B" : "#6B7280"
                  }}>
                    {course.status || "draft"}
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    <Layers size={14} color="#9CA3AF" /> {course.modules?.length || 0}
                  </div>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <Link href={`/instructor/courses/${course.id}`} style={{ padding: "8px 16px", borderRadius: "6px", color: "white", background: "var(--brand-primary)", textDecoration: "none", fontSize: "13px", fontWeight: 700, display: "inline-block" }}>
                    Edit Curriculum
                  </Link>
                </td>
              </tr>
            ))}
            {(!courses || courses.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                  No courses found. Click "Add Course" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "20px 24px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 500 }}>
              Showing page {page} of {totalPages}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link 
                href={`/instructor/courses?page=${page - 1}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  color: page === 1 ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: page === 1 ? "none" : "auto"
                }}
              >
                Prev
              </Link>
              <Link 
                href={`/instructor/courses?page=${page + 1}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  color: page === totalPages ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: page === totalPages ? "none" : "auto"
                }}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
