import React, { Suspense } from "react";
import { Plus, Edit2, Layers } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DeleteCourseButton } from "@/components/admin/DeleteCourseButton";
import { CourseSearch } from "@/components/admin/CourseSearch";

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string, page?: string }> }) {
  const { q: search, category, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const pageSize = 1000;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = await createClient();
  
  let query = supabase
    .from("courses")
    .select("*, modules(id)", { count: "exact" })
    .order("category", { ascending: true })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data: courses, count } = await query.range(start, end);
  const totalPages = Math.ceil((count || 0) / pageSize);

  const groupedCourses: Record<string, any[]> = (courses || []).reduce((acc: any, course: any) => {
    const cat = course.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {});

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.75rem)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            Course Management
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600, fontSize: "14px" }}>Manage your curriculum.</p>
        </div>
        <Link href="/admin/courses/new" style={{ 
          background: "var(--brand-primary)", 
          color: "white", 
          padding: "12px 24px", 
          borderRadius: "12px", 
          textDecoration: "none", 
          fontWeight: 700, 
          display: "flex", 
          alignItems: "center", 
          gap: "8px",
          whiteSpace: "nowrap"
        }}>
          <Plus size={20} /> <span className="hide-on-mobile">Add Course</span>
        </Link>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-header { flex-direction: column; align-items: flex-start !important; }
          .admin-header > a { width: 100%; justify-content: center; }
          .hide-on-mobile { display: none !important; }
          .table-cell-hide-mobile { display: none !important; }
        }
        .course-link-hover:hover { color: var(--brand-primary) !important; text-decoration: underline !important; }
      `}</style>

      {/* Filters Bar */}
      <Suspense fallback={
        <div style={{ height: "72px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", marginBottom: "32px", display: "flex", alignItems: "center", padding: "0 20px", color: "var(--text-tertiary)", fontSize: "14px" }}>
          Loading filters...
        </div>
      }>
        <CourseSearch initialValue={search || ""} initialCategory={category || ""} />
      </Suspense>

      {/* Courses Table Container */}
      <div style={{ 
        background: "var(--bg-card)", 
        borderRadius: "16px", 
        border: "1px solid var(--border-primary)", 
        overflowX: "auto",
        boxShadow: "var(--shadow-sm)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
            <tr>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Course</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Duration</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Curriculum</th>
              <th className="table-cell-hide-mobile" style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Created</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedCourses).map(([cat, catCourses]) => (
              <React.Fragment key={cat}>
                <tr>
                  <td colSpan={7} style={{ padding: "12px 24px", background: "var(--bg-secondary)", fontWeight: 800, color: "var(--text-primary)", fontSize: "13px", borderBottom: "1px solid var(--border-primary)", borderTop: "1px solid var(--border-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Layers size={16} color="var(--brand-primary)" />
                      <span style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat.replace(/-/g, ' ')}</span>
                    </div>
                  </td>
                </tr>
                {catCourses?.map((course) => (
                  <tr key={course.id} style={{ borderBottom: "1px solid var(--border-primary)", transition: "background 0.1s" }}>
                <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "10px", 
                      background: course.gradient || "#111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      flexShrink: 0
                    }}>
                      {course.icon || "📚"}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Link href={`/admin/courses/${course.id}`} style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px", textDecoration: "none" }} className="course-link-hover">
                          {course.title}
                        </Link>
                        <span style={{ 
                          fontSize: "9px", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          fontWeight: 800,
                          textTransform: "uppercase",
                          background: course.status === "published" ? "#ECFDF5" : course.status === "draft" ? "#FFFBEB" : "#F3F4F6",
                          color: course.status === "published" ? "#10B981" : course.status === "draft" ? "#F59E0B" : "#6B7280",
                          border: `1px solid ${course.status === "published" ? "#10B98130" : course.status === "draft" ? "#F59E0B30" : "#E5E7EB"}`
                        }}>
                          {course.status || "draft"}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{course.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="table-cell-hide-mobile" style={{ padding: "16px 24px" }}>
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: "6px", 
                    background: "var(--bg-tertiary)", 
                    fontSize: "11px", 
                    fontWeight: 700, 
                    color: "var(--text-secondary)",
                    textTransform: "uppercase"
                  }}>
                    {course.category || "web"}
                  </span>
                </td>
                <td className="table-cell-hide-mobile" style={{ padding: "16px 24px", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 500 }}>
                  {course.duration || "-"}
                </td>
                <td className="table-cell-hide-mobile" style={{ padding: "16px 24px", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 500 }}>
                  {course.price ? `$${course.price}` : "Free"}
                </td>
                <td className="table-cell-hide-mobile" style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    <Layers size={14} color="#9CA3AF" /> {course.modules?.length || 0} Modules
                  </div>
                </td>
                <td className="table-cell-hide-mobile" style={{ padding: "16px 24px", color: "var(--text-tertiary)", fontSize: "13px" }}>
                  {new Date(course.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <Link href={`/admin/courses/${course.id}`} style={{ padding: "10px", borderRadius: "10px", color: "var(--text-primary)", background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", transition: "all 0.1s" }}>
                      <Edit2 size={16} />
                    </Link>
                    <DeleteCourseButton courseId={course.id} />
                  </div>
                </td>
              </tr>
                ))}
              </React.Fragment>
            ))}
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
                href={`/admin/courses?page=${page - 1}${search ? `&q=${search}` : ""}${category ? `&category=${category}` : ""}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  color: page === 1 ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: page === 1 ? "none" : "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Prev
              </Link>
              <Link 
                href={`/admin/courses?page=${page + 1}${search ? `&q=${search}` : ""}${category ? `&category=${category}` : ""}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  color: page === totalPages ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: page === totalPages ? "none" : "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
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
