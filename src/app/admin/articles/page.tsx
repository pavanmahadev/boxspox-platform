import React from "react";
import { Plus, Edit2, FileText, Eye } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const { q: search, page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = await createClient();
  
  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data: articles, count } = await query.range(start, end);
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.75rem)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            Articles & Tutorials Management
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600, fontSize: "14px" }}>Create and manage informational articles for SEO and learning.</p>
        </div>
        <Link href="/admin/articles/new" style={{ 
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
          <Plus size={20} /> <span className="hide-on-mobile">Add Article</span>
        </Link>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-header { flex-direction: column; align-items: flex-start !important; }
          .admin-header > a { width: 100%; justify-content: center; }
          .hide-on-mobile { display: none !important; }
        }
        .article-link-hover:hover { color: var(--brand-primary) !important; text-decoration: underline !important; }
      `}</style>

      {/* Filters Bar */}
      <div style={{
        background: "var(--bg-card)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid var(--border-primary)",
        marginBottom: "32px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        boxShadow: "var(--shadow-xs)"
      }}>
        <form method="GET" style={{ display: "flex", flex: 1, gap: "12px", width: "100%" }}>
          <input
            name="q"
            defaultValue={search || ""}
            placeholder="Search articles by title..."
            style={{
              flex: 1,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
              padding: "10px 16px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              outline: "none"
            }}
          />
          <button type="submit" style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer"
          }}>
            Search
          </button>
        </form>
      </div>

      {/* Articles Table */}
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
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Title</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Views</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Created At</th>
              <th style={{ padding: "16px 24px", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!articles || articles.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-tertiary)", fontWeight: 600 }}>
                  No articles found. Create one to get started!
                </td>
              </tr>
            ) : (
              articles.map((article: any) => (
                <tr key={article.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <FileText size={18} style={{ color: "var(--text-tertiary)" }} />
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{article.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>/{article.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: 600 }}>
                    {article.category_name || "Uncategorized"}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      background: article.status === "published" ? "#D1FAE5" : "#F3F4F6",
                      color: article.status === "published" ? "#065F46" : "#374151"
                    }}>
                      {article.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600 }}>
                    {article.view_count}
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 500 }}>
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                      {article.status === "published" && (
                        <Link 
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          style={{ padding: "8px", borderRadius: "6px", color: "var(--text-secondary)" }}
                          title="View Live"
                        >
                          <Eye size={16} />
                        </Link>
                      )}
                      <Link 
                        href={`/admin/articles/${article.id}/edit`}
                        style={{ padding: "8px", borderRadius: "6px", color: "var(--text-secondary)" }}
                        title="Edit Article"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <DeleteArticleButton articleId={article.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === page;
            return (
              <Link
                key={pageNum}
                href={`/admin/articles?page=${pageNum}${search ? `&q=${search}` : ""}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: isActive ? "var(--brand-primary)" : "var(--bg-card)",
                  color: isActive ? "white" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "13px"
                }}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
