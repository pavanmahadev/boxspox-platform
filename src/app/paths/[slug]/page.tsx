import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ChevronRight, CheckCircle2, Lock, BookOpen, Play, Monitor, Server, Cpu, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("learning_paths")
    .select("title, description")
    .eq("slug", slug)
    .single();

  return {
    title: data ? `${data.title} – Pandaschool` : "Learning Path – Pandaschool",
    description: data?.description ?? "Explore this structured learning path.",
  };
}

export default async function PathDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: path, error } = await supabase
    .from("learning_paths")
    .select("*, path_courses(order_index, courses(id, title, slug, category_name, description, difficulty, status, icon))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !path) notFound();

  // Sort by order_index
  const courses = [...(path.path_courses ?? [])].sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  const getDomainSlug = (categoryName?: string) => {
    if (!categoryName) return "general";
    const name = categoryName.replace(/^[^\s]+ /, "");
    return name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Map string icons to Lucide components
  const IconMap: any = { Monitor, Server, Cpu, Shield };
  const PathIcon = path.icon && IconMap[path.icon] ? IconMap[path.icon] : null;

  return (
    <div style={{ paddingTop: "128px", background: "var(--bg-secondary)", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)", padding: "64px 0" }}>
        <div className="section-container">
          <Link
            href="/paths"
            style={{ color: "var(--brand-primary)", fontWeight: 700, fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px" }}
          >
            ← Back to Paths
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            {PathIcon && (
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: path.bg_color || "#E1F5EE",
                color: path.color || "var(--brand-primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <PathIcon size={28} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: "42px", fontWeight: 900, color: "var(--text-primary)", fontFamily: "var(--font-heading)", lineHeight: 1.1 }}>
                {path.title}
              </h1>
            </div>
          </div>

          {path.description && (
            <p style={{ color: "var(--text-tertiary)", fontSize: "1.15rem", maxWidth: "640px" }}>
              {path.description}
            </p>
          )}

          <div style={{ marginTop: "20px", display: "flex", gap: "24px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{courses.length}</strong> Courses
            </span>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="section-container" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "28px", color: "var(--text-primary)" }}>
            Courses in this Path
          </h2>

          {courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-tertiary)", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border-primary)" }}>
              <BookOpen size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
              <p>No courses have been added to this path yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {courses.map((pc: any, i: number) => {
                const course = pc.courses;
                if (!course) return null;
                const isPublished = course.status === "published";

                return (
                  <div
                    key={pc.courses?.id ?? i}
                    style={{
                      background: "var(--bg-card)",
                      padding: "24px",
                      borderRadius: "16px",
                      border: "1px solid var(--border-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                      opacity: isPublished ? 1 : 0.55
                    }}
                  >
                    {/* Step badge */}
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                      background: isPublished ? (path.bg_color || "#E1F5EE") : "#F3F4F6",
                      color: isPublished ? (path.color || "var(--brand-primary)") : "#9CA3AF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: "15px"
                    }}>
                      {course.icon || (i + 1)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "16px" }}>
                        {course.title}
                      </div>
                      {course.description && (
                        <div style={{
                          fontSize: "13px", color: "var(--text-tertiary)", marginTop: "4px",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "480px"
                        }}>
                          {course.description}
                        </div>
                      )}
                      {course.difficulty && (
                        <span style={{
                          display: "inline-block", marginTop: "6px",
                          fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                          padding: "2px 8px", borderRadius: "4px",
                          background: "#EEF2FF", color: "#4F46E5"
                        }}>
                          {course.difficulty}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    {isPublished && course.slug ? (
                      <Link
                        href={`/learn/${getDomainSlug(course.category_name)}/${course.slug}`}
                        style={{
                          background: path.color || "var(--brand-primary)",
                          color: "white",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexShrink: 0,
                          whiteSpace: "nowrap"
                        }}
                      >
                        <Play size={13} /> Start
                      </Link>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9CA3AF", fontSize: "13px", fontWeight: 600 }}>
                        <Lock size={14} /> Coming Soon
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
