import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface ActiveCoursesProps {
  activeCourses: any[];
}

export function ActiveCourses({ activeCourses }: ActiveCoursesProps) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>My Courses</h2>
        <Link href="/tutorials" style={{ color: "var(--brand-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>View all</Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {activeCourses.length > 0 ? (
          activeCourses.map((course, i) => (
            <div key={i} className="course-card">
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `${course.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: course.color, flexShrink: 0 }}>
                {course.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "10px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course.title}</h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, flexShrink: 0 }}>{course.completed}/{course.total}</span>
                </div>
                <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{ width: `${course.progress}%`, height: "100%", background: `linear-gradient(90deg, ${course.color}, ${course.color}dd)`, borderRadius: "4px", transition: "width 0.5s ease" }} />
                </div>
                {course.next_lesson_title && (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Up Next: <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{course.next_lesson_title}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {!course.is_free && !course.exam_unlocked && (
                  <Link 
                    href={`/checkout/${course.id}`} 
                    className="btn-primary" 
                    style={{ padding: "10px 20px", fontSize: "0.9rem", whiteSpace: "nowrap", background: "var(--brand-primary)", color: "white" }}
                  >
                    Pay to Learn
                  </Link>
                )}
                <Link 
                  href={course.next_lesson_slug ? `/tutorials/${course.slug}/${course.next_lesson_slug}` : `/tutorials/${course.slug}`} 
                  className="btn-primary" 
                  style={{ padding: "10px 20px", fontSize: "0.9rem", whiteSpace: "nowrap", background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
                >
                  Continue
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            padding: "60px 24px", 
            textAlign: "center", 
            background: "var(--bg-card)", 
            borderRadius: "var(--radius-xl)", 
            border: "1px dashed var(--border-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              background: "rgba(15, 110, 86, 0.05)", 
              color: "var(--brand-primary)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              marginBottom: "24px"
            }}>
              <BookOpen size={40} />
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>Your learning journey starts here</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.05rem", maxWidth: "400px", lineHeight: 1.6 }}>
              You haven&apos;t enrolled in any courses yet. Explore our library to find the perfect course to kickstart your career.
            </p>
            <Link href="/paths" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", padding: "14px 32px", fontSize: "1rem" }}>
              Explore Learning Paths
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
