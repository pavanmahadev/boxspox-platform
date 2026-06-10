import { createPublicClient } from "@/utils/supabase/public";
import Link from "next/link";
import type { Metadata } from "next";
import { DOMAIN_GROUPS } from "@/utils/domains";
import { BookOpen, ChevronRight } from "lucide-react";



export const metadata: Metadata = {
  title: "All Learning Domains — Boxspox",
  description:
    "Explore all learning domains on Boxspox — from Technology and AI to MBA, Law, Agriculture, Healthcare, and more.",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function LearnIndexPage() {
  const supabase = createPublicClient();

  // Fetch categories from DB (for custom order/colors)
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true });

  // Course counts per domain (using the new category_name column)
  const { data: courses } = await supabase
    .from("courses")
    .select("category_name")
    .eq("status", "published");

  // Count by the full domain label e.g. "💻 Technology"
  const countMap: Record<string, number> = {};
  (courses || []).forEach((c: any) => {
    const key = (c.category_name || "").trim();
    if (key) countMap[key] = (countMap[key] || 0) + 1;
  });

  // Build domain cards — merge DB data with DOMAIN_GROUPS presets
  const domainCards = Object.entries(DOMAIN_GROUPS).map(([label, tags]) => {
    const icon = label.split(" ")[0];
    const name = label.replace(icon + " ", "");
    const slug = slugify(name);

    const colorMap: Record<string, string> = {
      Technology: "linear-gradient(135deg, #0F6E56 0%, #15B8A6 100%)",
      "AI & Data Science": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      "MBA & Business": "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
      "Law & Legal": "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
      Agriculture: "linear-gradient(135deg, #15803D 0%, #84CC16 100%)",
      Healthcare: "linear-gradient(135deg, #BE123C 0%, #FB7185 100%)",
      Engineering: "linear-gradient(135deg, #374151 0%, #6B7280 100%)",
      "Design & Creative": "linear-gradient(135deg, #EC4899 0%, #F97316 100%)",
    };

    const dbCat = dbCategories?.find((c: any) => c.slug === slug);

    // Count courses for this domain by matching the full label (e.g. "💻 Technology")
    const courseCount = countMap[label] || 0;

    return {
      icon: dbCat?.icon || icon,
      name: dbCat?.name || name,
      slug,
      color: dbCat?.color || colorMap[name] || "linear-gradient(135deg, #374151, #111827)",
      description: dbCat?.description || `Master ${name} with expert-curated courses`,
      topicCount: tags.length,
      courseCount,
    };
  });

  const totalCourses = (courses || []).length;
  const totalDomains = domainCards.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F6E56 100%)",
          padding: "80px 24px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(15,110,86,0.2) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              padding: "6px 16px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              marginBottom: "24px",
              backdropFilter: "blur(10px)",
            }}
          >
            🌍 Universal Learning Platform
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 900,
              color: "white",
              marginBottom: "16px",
              letterSpacing: "-2px",
              lineHeight: 1.1,
            }}
          >
            Learn Anything.
            <br />
            <span style={{ color: "#34D399" }}>Master Everything.</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            From MBA strategy to agricultural science — explore {totalDomains} learning
            domains with {totalCourses}+ expert-crafted courses.
          </p>
          <div
            style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}
          >
            {[
              { v: totalDomains, l: "Learning Domains" },
              { v: totalCourses + "+", l: "Courses" },
              { v: "Free", l: "To Get Started" },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  padding: "16px 28px",
                  borderRadius: "16px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: 900, color: "white" }}>{s.v}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "60px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <h2
            style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)" }}
          >
            Browse Learning Domains
          </h2>
          <Link
            href="/"
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--brand-primary)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            All Courses <ChevronRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {domainCards.map((domain) => (
            <Link
              key={domain.slug}
              href={`/learn/${domain.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="domain-card"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "pointer",
                }}
              >
                {/* Gradient Banner */}
                <div
                  style={{
                    height: "120px",
                    background: domain.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                  }}
                >
                  <span style={{ fontSize: "56px" }}>{domain.icon}</span>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        padding: "6px 14px",
                        borderRadius: "50px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "white",
                        marginBottom: "6px",
                      }}
                    >
                      {domain.courseCount} courses
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "4px 12px",
                        borderRadius: "50px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {domain.topicCount} topics
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px 24px 24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {domain.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      marginBottom: "16px",
                    }}
                  >
                    {domain.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--brand-primary)",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    <BookOpen size={14} /> Start Learning <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .domain-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}
