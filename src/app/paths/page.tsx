import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Paths – Boxspox",
  description: "Structured roadmaps designed to take you from absolute beginner to industry-ready professional.",
};

export default async function PathsPage() {
  const supabase = await createClient();
  
  const { data: paths, error } = await supabase
    .from("learning_paths")
    .select("*, path_courses(courses(title))")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div style={{ paddingTop: "112px", background: "var(--bg-secondary)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)", padding: "60px 0" }}>
        <div className="section-container">
          <h1 style={{ fontSize: "40px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-heading)" }}>
            Learning <span style={{ color: "var(--brand-primary)" }}>Paths</span>
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "1.1rem", maxWidth: "600px" }}>
            Structured roadmaps designed to take you from absolute beginner to industry-ready professional.
          </p>
        </div>
      </div>

      <div className="section-container" style={{ padding: "60px 24px 100px" }}>
        {!paths || paths.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0", background: "var(--bg-card)", borderRadius: "24px", border: "1px dashed var(--border-primary)" }}>
            <BookOpen size={48} style={{ margin: "0 auto 20px", color: "var(--text-tertiary)", opacity: 0.5 }} />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>No paths available yet</h2>
            <p style={{ color: "var(--text-tertiary)" }}>Check back later for new structured learning roadmaps.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "32px"
          }}>
            {paths.map((path) => (
              <div
                key={path.id}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "24px",
                  padding: "40px",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: path.bg_color || "#E1F5EE",
                  color: path.color || "var(--brand-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  fontSize: "32px"
                }}>
                  {path.icon || "🚀"}
                </div>

                <h3 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
                  {path.title}
                </h3>

                <p style={{ color: "var(--text-tertiary)", marginBottom: "32px", fontSize: "15px", lineHeight: 1.6 }}>
                  {path.description}
                </p>

                {path.path_courses && path.path_courses.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "40px" }}>
                    {path.path_courses.slice(0, 4).map((pc: any, idx: number) => (
                      <span key={idx} style={{
                        padding: "6px 12px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        textTransform: "uppercase"
                      }}>
                        {pc.courses?.title}
                      </span>
                    ))}
                    {path.path_courses.length > 4 && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", alignSelf: "center" }}>
                        +{path.path_courses.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <Link
                  href={`/paths/${path.slug}`}
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "#111827",
                    color: "white",
                    padding: "14px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "15px",
                    transition: "background 0.2s"
                  }}
                >
                  Start Roadmap <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
