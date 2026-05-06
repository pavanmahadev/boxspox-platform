"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";

export const CATEGORIES = Array.from(new Set([
  "HTML and CSS", "HTML", "CSS", "RWD", "Bootstrap", "Sass", "Colors", "Icons", "SVG", "Canvas", 
  "Graphics", "UTF-8 and Emojis", "How To", "JavaScript", "React", "jQuery", "Vue", "Angular", 
  "AngularJS", "JSON", "AJAX", "AppML", "TypeScript", "Next.js", "Backend", "Python", "SQL", 
  "MySQL", "PHP", "Java", "C", "C++", "C#", "R", "Kotlin", "Rust", "Go", "Django", "PostgreSQL", 
  "Node.js", "MongoDB", "Git", "Bash", "Data Analytics", "AI", "Generative AI", "ChatGPT-4", 
  "Machine Learning", "DSA", "Data Science", "NumPy", "Pandas", "SciPy", "Matplotlib", 
  "Statistics", "Excel", "Google Sheets"
]));

export const slugifyCategory = (c: string) => 
  c.toLowerCase()
   .replace(/#/g, "-sharp")
   .replace(/\+/g, "-plus")
   .replace(/[^a-z0-9]+/g, "-")
   .replace(/(^-|-$)/g, "");

export function CourseSearch({ initialValue, initialCategory = "" }: { initialValue: string, initialCategory?: string }) {
  const [value, setValue] = useState(initialValue);
  const [category, setCategory] = useState(initialCategory);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      if (category) {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, category, pathname, router, searchParams]);

  return (
    <div style={{ 
      display: "flex", 
      gap: "16px", 
      marginBottom: "32px",
      background: "var(--bg-card)",
      padding: "16px",
      borderRadius: "16px",
      border: "1px solid var(--border-primary)"
    }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input 
          type="text" 
          placeholder="Search courses by title..." 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "10px 10px 10px 40px", 
            borderRadius: "10px", 
            border: "1px solid var(--border-primary)",
            fontSize: "14px",
            outline: "none"
          }} 
        />
      </div>
      <div style={{ position: "relative" }}>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ 
            appearance: "none",
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "10px 36px 10px 16px", 
            borderRadius: "10px", 
            border: "1px solid var(--border-primary)", 
            background: "var(--bg-card)", 
            fontSize: "14px", 
            fontWeight: 600, 
            color: "var(--text-secondary)",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="">All Categories</option>
          <option value="web-development">Web Development</option>
          <option value="mobile-apps">Mobile Apps</option>
          {CATEGORIES.map((c, i) => <option key={`${slugifyCategory(c)}-${i}`} value={slugifyCategory(c)}>{c}</option>)}
        </select>
        <Filter size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)" }} />
      </div>
    </div>
  );
}
