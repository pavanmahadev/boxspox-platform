"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Book, Code, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface SearchResult {
  title: string;
  slug: string;
  type: "course" | "lesson";
  parent?: string;
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Open on Ctrl/Cmd + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // Since isOpen is controlled by parent, we might need a separate trigger or just focus if already open
          // But usually, we want the parent to handle this. For now, let's just handle ESC.
        }
      }
      // 2. Close on ESC
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { 
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto"; 
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Search courses
        const { data: courses } = await supabase
          .from("courses")
          .select("title, slug")
          .ilike("title", `%${query}%`)
          .limit(5);

        // Search lessons
        const { data: lessons } = await supabase
          .from("lessons")
          .select(`
            title, 
            slug,
            course:courses (slug)
          `)
          .ilike("title", `%${query}%`)
          .limit(5);

        const courseResults: SearchResult[] = (courses || []).map((c: any) => ({
          title: c.title,
          slug: c.slug,
          type: "course"
        }));

        const lessonResults: SearchResult[] = (lessons || []).map((l: any) => ({
          title: l.title,
          slug: l.slug,
          type: "lesson",
          parent: (l.course as any)?.slug
        }));

        setResults([...courseResults, ...lessonResults]);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "120px",
      }}
      onClick={onClose}
    >
      <div 
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "16px" }}>
          <Search size={22} color="var(--text-tertiary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for courses, lessons, or topics..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "1.1rem",
              fontWeight: 500,
            }}
          />
          {loading ? (
            <Loader2 size={18} className="animate-spin" color="var(--text-tertiary)" />
          ) : (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
              <X size={20} />
            </button>
          )}
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto", padding: "12px" }}>
          {query.trim() === "" ? (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <Search size={40} color="var(--text-tertiary)" style={{ opacity: 0.2, marginBottom: "16px" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Type something to search across the platform
              </p>
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {results.map((result, i) => (
                <Link
                  key={i}
                  href={result.type === "course" ? `/tutorials/${result.slug}` : `/tutorials/${result.parent}/${result.slug}`}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  className="hover-bg"
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                    {result.type === "course" ? <Book size={20} /> : <Code size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem" }}>{result.title}</div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", textTransform: "capitalize" }}>
                      {result.type} {result.parent ? `• ${result.parent.toUpperCase()}` : ""}
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--text-tertiary)" />
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)" }}>
                No results found for &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 20px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <kbd style={{ background: "var(--bg-card)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-primary)" }}>ESC</kbd> to close
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <kbd style={{ background: "var(--bg-card)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-primary)" }}>↵</kbd> to select
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: 600 }}>
            {results.length} results found
          </span>
        </div>
      </div>
    </div>
  );
}
