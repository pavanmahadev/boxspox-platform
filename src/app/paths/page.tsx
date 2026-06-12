import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Paths – Pandaschool",
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
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)", padding: "80px 0 60px" }}>
        <div className="section-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
            <div>
              <span style={{ color: "var(--brand-primary)", fontWeight: 800, fontSize: "14px", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px", display: "block" }}>
                Roadmaps to Success
              </span>
              <h1 style={{ fontSize: "48px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "20px", fontFamily: "var(--font-heading)", letterSpacing: "-1.5px", lineHeight: 1 }}>
                Structured Learning <span style={{ color: "var(--brand-primary)" }}>Paths</span>
              </h1>
              <p style={{ color: "var(--text-tertiary)", fontSize: "1.15rem", maxWidth: "540px", lineHeight: 1.6, marginBottom: "0" }}>
                Don&apos;t just learn to code—master a career. Our roadmaps take you from absolute beginner to industry-ready professional with handpicked projects.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
               {[
                 { title: "Guided Journey", desc: "No more guessing what to learn next." },
                 { title: "Project Based", desc: "Build real apps while you learn." },
                 { title: "Expert Vetted", desc: "Curated by industry professionals." },
                 { title: "Career Ready", desc: "Focus on job-winning skills." }
               ].map((item, i) => (
                 <div key={i} style={{ padding: "20px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "14px", marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-tertiary)", lineHeight: 1.4 }}>{item.desc}</div>
                 </div>
               ))}
            </div>
          </div>
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
                  borderRadius: "32px",
                  padding: "40px",
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.03)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}
                className="path-card-hover"
              >
                <div style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "150px",
                  height: "150px",
                  background: `radial-gradient(circle at top right, ${path.color}15, transparent 70%)`,
                  pointerEvents: "none"
                }} />
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
      <style>{`
        .path-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.08) !important;
          border-color: var(--brand-primary)40 !important;
        }
      `}</style>
    </div>
  );
}
