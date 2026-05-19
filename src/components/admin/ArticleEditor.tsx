"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft, Save, Eye, Edit, Sparkles, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Article {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  category_name: string;
  status: "draft" | "published";
  read_time_minutes: number;
}

interface ArticleEditorProps {
  initialArticle?: Article;
}

const CATEGORIES = [
  "💻 Technology",
  "🤖 AI & Data Science",
  "📊 MBA & Business",
  "⚖️ Law & Legal",
  "🌾 Agriculture",
  "🏥 Healthcare",
  "📐 Engineering",
  "🎨 Design & Creative"
];

export function ArticleEditor({ initialArticle }: ArticleEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "split">("split");

  // Form State
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [content, setContent] = useState(initialArticle?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialArticle?.cover_image_url || "");
  const [categoryName, setCategoryName] = useState(initialArticle?.category_name || CATEGORIES[0]);
  const [status, setStatus] = useState<"draft" | "published">(initialArticle?.status || "draft");
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialArticle?.read_time_minutes || 5);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialArticle) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, initialArticle]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Please enter an article title", "error");
      return;
    }
    if (!slug.trim()) {
      showToast("Please enter an article slug", "error");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get profile to populate author name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      const articlePayload = {
        title,
        slug,
        content,
        excerpt,
        cover_image_url: coverImageUrl,
        category_name: categoryName,
        status,
        read_time_minutes: readTimeMinutes,
        author_id: user.id,
        author_name: profile?.name || user.email || "Instructor",
        updated_at: new Date().toISOString(),
        published_at: status === "published" ? new Date().toISOString() : null
      };

      if (initialArticle?.id) {
        // Update existing article
        const { error } = await supabase
          .from("articles")
          .update(articlePayload)
          .eq("id", initialArticle.id);

        if (error) throw error;
        showToast("Article updated successfully", "success");
      } else {
        // Create new article
        const { error } = await supabase
          .from("articles")
          .insert([articlePayload]);

        if (error) throw error;
        showToast("Article created successfully", "success");
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIExcerpt = async () => {
    if (!content) {
      showToast("Add some content first for AI to summarize", "error");
      return;
    }
    showToast("Generating excerpt with AI...", "success");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Write a short, engaging one-sentence meta description / excerpt for this article. Return only the sentence. Content:\n\n${content}`
            }
          ]
        })
      });
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        setExcerpt(data.choices[0].message.content.trim().replace(/^"|"$/g, ''));
        showToast("Excerpt generated successfully!", "success");
      }
    } catch (e: any) {
      showToast("Could not generate summary automatically: " + e.message, "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Back & Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/admin/articles" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
            textDecoration: "none"
          }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)" }}>
              {initialArticle?.id ? "Edit Article" : "Create New Article"}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 600 }}>Draft and publish tutorials & blog articles.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            background: "var(--brand-primary)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 24px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: loading ? 0.7 : 1
          }}
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Article"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Side: Metadata & Form settings */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-primary)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mastering Flexbox CSS"
              style={{
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="mastering-flexbox-css"
              style={{
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Learning Domain</label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer"
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Cover Image URL</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{
                  flex: 1,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)" }}>Excerpt / Summary</label>
              <button 
                type="button" 
                onClick={handleGenerateAIExcerpt}
                style={{ background: "none", border: "none", color: "var(--brand-primary)", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
              >
                <Sparkles size={12} /> AI Generate
              </button>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief overview summary for SEO search index description..."
              rows={3}
              style={{
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                outline: "none",
                resize: "vertical",
                lineHeight: "1.4"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Read Time (min)</label>
              <input
                type="number"
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(parseInt(e.target.value || "1"))}
                min={1}
                style={{
                  width: "100%",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "8px" }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: "100%",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: Split-Pane Editor / Preview */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-primary)",
          display: "flex",
          flexDirection: "column",
          minHeight: "650px",
          boxShadow: "var(--shadow-sm)"
        }}>
          {/* Mode Switcher Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px",
            borderBottom: "1px solid var(--border-primary)",
            background: "var(--bg-secondary)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px"
          }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Article Content (Markdown)</span>
            
            <div style={{ display: "flex", background: "var(--bg-primary)", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "3px" }}>
              <button
                onClick={() => setPreviewMode("edit")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: previewMode === "edit" ? "var(--bg-card)" : "transparent",
                  color: previewMode === "edit" ? "var(--text-primary)" : "var(--text-tertiary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => setPreviewMode("split")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: previewMode === "split" ? "var(--bg-card)" : "transparent",
                  color: previewMode === "split" ? "var(--text-primary)" : "var(--text-tertiary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Split View
              </button>
              <button
                onClick={() => setPreviewMode("preview")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: previewMode === "preview" ? "var(--bg-card)" : "transparent",
                  color: previewMode === "preview" ? "var(--text-primary)" : "var(--text-tertiary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Eye size={14} /> Preview
              </button>
            </div>
          </div>

          {/* Workspaces */}
          <div style={{
            display: "grid",
            gridTemplateColumns: previewMode === "split" ? "1fr 1fr" : "1fr",
            flex: 1,
            minHeight: "550px"
          }}>
            {/* Editor Pane */}
            {(previewMode === "edit" || previewMode === "split") && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article in Markdown here... Use # headers, **bold**, lists, code blocks, etc."
                style={{
                  padding: "24px",
                  border: "none",
                  borderRight: previewMode === "split" ? "1px solid var(--border-primary)" : "none",
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontFamily: "var(--font-mono, monospace)",
                  lineHeight: "1.6",
                  height: "100%",
                  minHeight: "500px"
                }}
              />
            )}

            {/* Preview Pane */}
            {(previewMode === "preview" || previewMode === "split") && (
              <div style={{
                padding: "24px",
                overflowY: "auto",
                height: "100%",
                maxHeight: "600px",
                color: "var(--text-primary)",
                lineHeight: "1.7"
              }} className="markdown-body">
                {content.trim() === "" ? (
                  <div style={{ color: "var(--text-tertiary)", fontSize: "14px", fontStyle: "italic" }}>
                    Your live preview will render here...
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .markdown-body h1 { font-size: 1.8rem; font-weight: 800; margin-top: 24px; margin-bottom: 12px; color: var(--text-primary); }
        .markdown-body h2 { font-size: 1.4rem; font-weight: 750; margin-top: 20px; margin-bottom: 10px; color: var(--text-primary); border-bottom: 1px solid var(--border-primary); padding-bottom: 6px; }
        .markdown-body h3 { font-size: 1.2rem; font-weight: 700; margin-top: 16px; margin-bottom: 8px; color: var(--text-primary); }
        .markdown-body p { margin-bottom: 16px; font-size: 14.5px; }
        .markdown-body code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .markdown-body pre { background: #1E293B; color: #F8FAFC; padding: 16px; border-radius: 12px; overflow-x: auto; margin-bottom: 16px; }
        .markdown-body pre code { background: none; padding: 0; color: inherit; font-size: 13px; }
        .markdown-body ul, .markdown-body ol { padding-left: 20px; margin-bottom: 16px; }
        .markdown-body li { margin-bottom: 6px; }
        .markdown-body blockquote { border-left: 4px solid var(--brand-primary); padding-left: 16px; color: var(--text-secondary); margin: 0 0 16px 0; font-style: italic; }
      `}</style>
    </div>
  );
}
