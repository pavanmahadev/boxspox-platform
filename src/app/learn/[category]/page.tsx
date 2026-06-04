import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Clock, Users, Star, ChevronRight, Filter } from "lucide-react";
import { DOMAIN_GROUPS } from "@/utils/domains";
import { ShareCourseButton } from "@/components/ui/ShareCourseButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const name = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${name} Courses — Learn ${name} Online | Boxspox`,
    description: `Browse all ${name} courses on Boxspox. Expert-curated content for beginners to advanced learners.`,
  };
}

export default async function LearnCategoryPage({ params }: Props) {
  const { category } = await params;
  const supabase = await createClient();

  // Try to find it in categories table first
  const { data: catRow } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", category)
    .maybeSingle();

  // Find matching domain in DOMAIN_GROUPS (slugified)
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const domainEntry = Object.entries(DOMAIN_GROUPS).find(
    ([label]) => slugify(label.replace(/^[^\s]+ /, "")) === category || slugify(label) === category
  );
  const domainTags = domainEntry ? domainEntry[1] : [];

  // Find the full domain label that matches this URL slug (e.g. "technology" → "💻 Technology")
  const domainLabel = domainEntry ? domainEntry[0] : null;

  // Fetch courses — match by category_name (the new domain label column)
  let courseQuery = supabase
    .from("courses")
    .select("*, modules(count)")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (domainLabel) {
    // Match by the full domain label e.g. "💻 Technology"
    courseQuery = courseQuery.eq("category_name", domainLabel);
  } else {
    // Fallback: try matching old category column by slug
    courseQuery = courseQuery.eq("category", category);
  }

  const { data: courses } = await courseQuery;


  const displayName =
    catRow?.name ||
    (domainEntry ? domainEntry[0].replace(/^[^\s]+ /, "") : null) ||
    category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const icon = catRow?.icon || (domainEntry ? domainEntry[0].split(" ")[0] : "📚");
  const color = catRow?.color || "linear-gradient(135deg, #0F6E56 0%, #15B8A6 100%)";

  // Fetch enrollment counts for display
  const { data: enrollData } = await supabase
    .from("enrollments")
    .select("course_id");
  const enrollMap: Record<string, number> = {};
  (enrollData || []).forEach((e: any) => {
    enrollMap[e.course_id] = (enrollMap[e.course_id] || 0) + 1;
  });

  const difficulties = ["All", "beginner", "intermediate", "advanced"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Hero Banner */}
      <div
        style={{
          background: color,
          padding: "80px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
            }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
              Home
            </Link>
            <ChevronRight size={14} />
            <Link href="/learn" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
              Learn
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: "white" }}>{displayName}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                backdropFilter: "blur(10px)",
              }}
            >
              {icon}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 900,
                  color: "white",
                  marginBottom: "8px",
                  letterSpacing: "-1px",
                }}
              >
                {displayName}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "17px", lineHeight: 1.5 }}>
                {catRow?.description ||
                  `Master ${displayName} with expert-curated courses, from fundamentals to advanced topics.`}
              </p>
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginTop: "32px" }}
          >
            {[
              { icon: "📚", label: `${courses?.length || 0} Courses` },
              { icon: "🎓", label: `${Object.values(enrollMap).reduce((a, b) => a + b, 0)} Students` },
              { icon: "⭐", label: "Expert Instructors" },
              { icon: "🏆", label: "Certificates Included" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  padding: "10px 20px",
                  borderRadius: "50px",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{stat.icon}</span> {stat.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Sub-topics chips */}
        {domainTags.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              Browse Topics
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {domainTags.slice(0, 16).map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "50px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    cursor: "default",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {courses && courses.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
              }}
            >
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>
                {courses.length} Course{courses.length !== 1 ? "s" : ""} Available
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {courses.map((course: any) => (
                <Link
                  key={course.id}
                  href={`/learn/${category}/${course.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="course-card"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "20px",
                      overflow: "hidden",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Course Banner */}
                    <div
                      style={{
                        height: "140px",
                        background: course.gradient || color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "56px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        course.icon || icon
                      )}
                      {course.is_featured && (
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "#F59E0B",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          ⭐ Featured
                        </div>
                      )}
                      
                      <ShareCourseButton 
                        courseTitle={course.title} 
                        courseSlug={course.slug} 
                        category={category} 
                        isFeatured={course.is_featured} 
                      />
                      {course.price === 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: "#10B981",
                            color: "white",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          FREE
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "var(--brand-primary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {course.difficulty || "Beginner"}
                        </span>
                        {course.price > 0 && (
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: 900,
                              color: "var(--text-primary)",
                            }}
                          >
                            ₹{course.price}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: "17px",
                          fontWeight: 800,
                          color: "var(--text-primary)",
                          marginBottom: "8px",
                          lineHeight: 1.3,
                        }}
                      >
                        {course.title}
                      </h3>

                      {course.description && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                            marginBottom: "16px",
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {course.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          fontSize: "12px",
                          color: "var(--text-tertiary)",
                          fontWeight: 600,
                          paddingTop: "12px",
                          borderTop: "1px solid var(--border-primary)",
                          marginTop: "auto",
                        }}
                      >
                        {course.duration && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} /> {course.duration}
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Users size={12} /> {enrollMap[course.id] || 0} students
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <BookOpen size={12} />{" "}
                          {course.modules?.[0]?.count || 0} modules
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div
            style={{
              textAlign: "center",
              padding: "100px 20px",
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>{icon}</div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 900,
                marginBottom: "12px",
                color: "var(--text-primary)",
              }}
            >
              {displayName} Courses Coming Soon
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "16px",
                maxWidth: "480px",
                margin: "0 auto 32px",
                lineHeight: 1.6,
              }}
            >
              We&apos;re working with expert instructors to bring you world-class{" "}
              {displayName} courses. Be the first to know when they launch!
            </p>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--brand-primary)",
                color: "white",
                padding: "14px 28px",
                borderRadius: "14px",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "15px",
              }}
            >
              Browse All Courses
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
