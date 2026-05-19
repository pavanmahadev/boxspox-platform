import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { BookOpen, Clock, Calendar, ArrowRight, Search, FileText } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles & Tutorials | Boxspox",
  description: "Explore our latest in-depth articles, tutorials, and career insights. Free tech guides, business guides, and more curated by experts.",
};

const CATEGORIES = [
  "All",
  "💻 Technology",
  "🤖 AI & Data Science",
  "📊 MBA & Business",
  "⚖️ Law & Legal",
  "🌾 Agriculture",
  "🏥 Healthcare",
  "📐 Engineering",
  "🎨 Design & Creative"
];

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { q: search, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (category && category !== "All") {
    query = query.eq("category_name", category);
  }

  const { data: articles } = await query;

  const activeCategory = category || "All";

  const breadcrumbItems = [
    { name: "Home", url: "https://boxspox.in/" },
    { name: "Articles", url: "https://boxspox.in/articles" }
  ];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", paddingBottom: "80px" }}>
      <BreadcrumbSchema items={breadcrumbItems} />
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        color: "white",
        padding: "100px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow Effects */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(15, 110, 86, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#15B8A6",
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            padding: "8px 16px",
            borderRadius: "9999px",
            display: "inline-block",
            marginBottom: "24px"
          }}>
            Knowledge Hub
          </span>
          
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 900,
            lineHeight: "1.15",
            letterSpacing: "-1px",
            marginBottom: "20px",
            fontFamily: "var(--font-heading)"
          }}>
            Insightful Articles & <span style={{ background: "linear-gradient(to right, #2DD4BF, #14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tutorials</span>
          </h1>
          
          <p style={{
            fontSize: "clamp(15px, 2vw, 17px)",
            color: "#94A3B8",
            fontWeight: 500,
            lineHeight: "1.6",
            maxWidth: "600px",
            margin: "0 auto 40px"
          }}>
            Explore expert-curated tutorials, architectural guides, tips, and trends across technology, AI, design, and business.
          </p>

          {/* Search bar */}
          <form method="GET" style={{
            display: "flex",
            maxWidth: "550px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "6px",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", flex: 1, padding: "0 12px", color: "#94A3B8" }}>
              <Search size={20} />
              <input
                name="q"
                defaultValue={search || ""}
                placeholder="Search articles, guides, resources..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "white",
                  padding: "10px 12px",
                  fontSize: "15px",
                  fontWeight: 500
                }}
              />
            </div>
            {category && <input type="hidden" name="category" value={category} />}
            <button type="submit" style={{
              background: "var(--brand-primary)",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1200px", margin: "-30px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        
        {/* Category filters */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-primary)",
          padding: "12px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          marginBottom: "40px",
          boxShadow: "var(--shadow-md)"
        }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            const linkUrl = `/articles?category=${encodeURIComponent(cat)}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
            return (
              <Link
                key={cat}
                href={linkUrl}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: isActive ? "var(--brand-primary)" : "transparent",
                  color: isActive ? "white" : "var(--text-secondary)",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Articles List */}
        {!articles || articles.length === 0 ? (
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            border: "1px solid var(--border-primary)",
            padding: "80px 24px",
            textAlign: "center"
          }}>
            <FileText size={48} style={{ color: "var(--text-tertiary)", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>No articles found</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
              We couldn't find any articles matching your filters. Try adjusting your search query or selecting another category.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "32px"
          }}>
            {articles.map((article) => (
              <article
                key={article.id}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "24px",
                  border: "1px solid var(--border-primary)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "var(--shadow-sm)",
                  transition: "transform 0.3s, box-shadow 0.3s"
                }}
                className="article-card"
              >
                {/* Cover Image */}
                <div style={{ height: "200px", position: "relative", background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", overflow: "hidden" }}>
                  {article.cover_image_url ? (
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.2 }}>
                      <FileText size={64} color="white" />
                    </div>
                  )}
                  {/* Category Tag */}
                  <span style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: "rgba(15, 110, 86, 0.9)",
                    backdropFilter: "blur(4px)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "6px 12px",
                    borderRadius: "8px"
                  }}>
                    {article.category_name || "General"}
                  </span>
                </div>

                {/* Info Content */}
                <div style={{ padding: "28px", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Meta stats */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600, marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={14} />
                      {new Date(article.published_at || article.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} />
                      {article.read_time_minutes} min read
                    </div>
                  </div>

                  <h2 style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    lineHeight: "1.4",
                    color: "var(--text-primary)",
                    marginBottom: "12px",
                    fontFamily: "var(--font-heading)"
                  }}>
                    <Link href={`/articles/${article.slug}`} style={{ color: "inherit", textDecoration: "none" }} className="article-title-link">
                      {article.title}
                    </Link>
                  </h2>

                  <p style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.6",
                    marginBottom: "24px",
                    flex: 1
                  }}>
                    {article.excerpt || "No description provided."}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", borderTop: "1px solid var(--border-primary)", paddingTop: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>
                        {(article.author_name || "I")[0]}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>{article.author_name || "Instructor"}</span>
                    </div>
                    
                    <Link href={`/articles/${article.slug}`} style={{
                      color: "var(--brand-primary)",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }} className="read-more-btn">
                      Read Article <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .article-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--brand-primary) !important;
        }
        .article-title-link:hover {
          color: var(--brand-primary) !important;
        }
        .read-more-btn:hover {
          gap: 8px !important;
        }
      `}</style>
    </div>
  );
}
