import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/utils/supabase/public";
import { ViewIncrementer } from "@/components/articles/ViewIncrementer";
import { ArrowLeft, Clock, Calendar, Eye, Share2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import type { Metadata } from "next";

// Custom SVG Icons for Brands
const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


export const revalidate = 300; // Cache for 5 minutes (ISR)

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, slug")
    .eq("slug", slug)
    .single();

  if (!article) return { title: "Article Not Found | Pandaschool" };

  return {
    title: `${article.title} | Pandaschool Blog & Guides`,
    description: article.excerpt || `Read ${article.title} on Pandaschool. Master technology, business, engineering, and more.`,
    alternates: {
      canonical: `https://pandaschool.in/articles/${article.slug}`,
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  // Fetch article
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!article) {
    notFound();
  }

  // Offload view increment to client-side ViewIncrementer component below to keep page static and cacheable.

  // Fetch 3 related articles
  const { data: related } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("category_name", article.category_name)
    .neq("id", article.id)
    .limit(3);

  const cleanUrl = `https://pandaschool.in/articles/${article.slug}`;

  const breadcrumbItems = [
    { name: "Home", url: "https://pandaschool.in/" },
    { name: "Articles", url: "https://pandaschool.in/articles" },
    { name: article.title, url: cleanUrl }
  ];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "40px 24px 100px" }}>
      <ViewIncrementer articleId={article.id} />
      <ArticleSchema
        headline={article.title}
        description={article.excerpt || ""}
        authorName={article.author_name || "Instructor"}
        url={cleanUrl}
        imageUrl={article.cover_image_url || undefined}
        datePublished={article.published_at || article.created_at}
        dateModified={article.updated_at}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Back navigation */}
        <Link href="/articles" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-secondary)",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 700,
          marginBottom: "32px",
          transition: "color 0.2s"
        }} className="hover-color-brand">
          <ArrowLeft size={16} /> Back to Articles
        </Link>

        {/* Article Header */}
        <header style={{ marginBottom: "40px" }}>
          {article.category_name && (
            <span style={{
              background: "rgba(15, 110, 86, 0.1)",
              border: "1px solid rgba(15, 110, 86, 0.2)",
              color: "var(--brand-primary)",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "6px 12px",
              borderRadius: "8px",
              display: "inline-block",
              marginBottom: "16px"
            }}>
              {article.category_name}
            </span>
          )}

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 900,
            lineHeight: "1.2",
            color: "var(--text-primary)",
            marginBottom: "24px",
            letterSpacing: "-0.5px",
            fontFamily: "var(--font-heading)"
          }}>
            {article.title}
          </h1>

          {/* Author and metadata */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            paddingBottom: "24px",
            borderBottom: "1px solid var(--border-primary)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "var(--text-primary)"
              }}>
                {(article.author_name || "I")[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>
                  {article.author_name || "Instructor"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                  Published in {article.category_name || "General"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} />
                {new Date(article.published_at || article.created_at).toLocaleDateString()}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} />
                {article.read_time_minutes} min read
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Eye size={14} />
                {article.view_count + 1} views
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div style={{
            borderRadius: "24px",
            overflow: "hidden",
            marginBottom: "40px",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-sm)"
          }}>
            <img
              src={article.cover_image_url}
              alt={article.title}
              style={{ width: "100%", height: "auto", display: "block", maxHeight: "450px", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Content Body */}
        <div style={{
          fontSize: "17px",
          lineHeight: "1.8",
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom: "60px"
        }} className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content || ""}</ReactMarkdown>
        </div>

        {/* Share widget */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-primary)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "60px"
        }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>Share this article</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`} target="_blank" rel="noopener noreferrer" style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", background: "var(--bg-primary)", display: "flex", alignItems: "center" }}>
              <FacebookIcon style={{ width: "16px", height: "16px" }} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(cleanUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", background: "var(--bg-primary)", display: "flex", alignItems: "center" }}>
              <TwitterIcon style={{ width: "16px", height: "16px" }} />
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl)}`} target="_blank" rel="noopener noreferrer" style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", background: "var(--bg-primary)", display: "flex", alignItems: "center" }}>
              <LinkedinIcon style={{ width: "16px", height: "16px" }} />
            </a>
          </div>
        </div>

        {/* Related Articles */}
        {related && related.length > 0 && (
          <section style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "40px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "24px", fontFamily: "var(--font-heading)" }}>
              Recommended Articles
            </h3>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "24px"
            }}>
              {related.map((post) => (
                <Link
                  key={post.id}
                  href={`/articles/${post.slug}`}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "16px",
                    padding: "20px",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--shadow-xs)",
                    transition: "transform 0.2s, border-color 0.2s"
                  }}
                  className="related-post-card"
                >
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--brand-primary)", textTransform: "uppercase", marginBottom: "8px" }}>
                    {post.category_name}
                  </span>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", lineHeight: "1.4", marginBottom: "8px", flex: 1 }}>
                    {post.title}
                  </h4>
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-tertiary)" }}>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>{post.read_time_minutes} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      <style>{`
        .hover-color-brand:hover {
          color: var(--brand-primary) !important;
        }
        .related-post-card:hover {
          transform: translateY(-4px);
          border-color: var(--brand-primary) !important;
        }
        .markdown-body h1 { font-size: 1.8rem; font-weight: 800; margin-top: 32px; margin-bottom: 16px; color: var(--text-primary); }
        .markdown-body h2 { font-size: 1.4rem; font-weight: 750; margin-top: 28px; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1px solid var(--border-primary); padding-bottom: 6px; }
        .markdown-body h3 { font-size: 1.2rem; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: var(--text-primary); }
        .markdown-body p { margin-bottom: 20px; font-size: 16.5px; }
        .markdown-body code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 14px; }
        .markdown-body pre { background: #1E293B; color: #F8FAFC; padding: 18px; border-radius: 12px; overflow-x: auto; margin-bottom: 20px; }
        .markdown-body pre code { background: none; padding: 0; color: inherit; font-size: 14px; }
        .markdown-body ul, .markdown-body ol { padding-left: 24px; margin-bottom: 20px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body blockquote { border-left: 4px solid var(--brand-primary); padding-left: 18px; color: var(--text-secondary); margin: 0 0 20px 0; font-style: italic; }
      `}</style>
    </div>
  );
}
