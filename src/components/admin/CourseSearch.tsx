"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { DOMAIN_GROUPS, CATEGORIES, slugifyCategory } from "@/utils/domains";

export function CourseSearch({ initialValue, initialCategory = "" }: { initialValue: string, initialCategory?: string }) {
  const [value, setValue] = useState(initialValue);
  const [category, setCategory] = useState(initialCategory);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      const currentCategory = searchParams.get("category") || "";
      
      if (value === currentQ && category === currentCategory) {
        return; // No change, don't push
      }

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
    <div 
      className="course-search-container"
      style={{ 
        display: "flex", 
        gap: "16px", 
        marginBottom: "32px",
        background: "var(--bg-card)",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid var(--border-primary)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ flex: 2, position: "relative" }}>
        <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input 
          type="text" 
          placeholder="Search tutorials..." 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ 
            width: "100%", 
            padding: "12px 12px 12px 40px", 
            borderRadius: "10px", 
            border: "1px solid var(--border-primary)",
            fontSize: "14px",
            background: "var(--bg-secondary)",
            outline: "none",
            transition: "all 0.2s"
          }} 
        />
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ 
            appearance: "none",
            width: "100%",
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "12px 40px 12px 16px", 
            borderRadius: "10px", 
            border: "1px solid var(--border-primary)", 
            background: "var(--bg-secondary)", 
            fontSize: "14px", 
            fontWeight: 600, 
            color: "var(--text-secondary)",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="">All Categories</option>
          {Object.entries(DOMAIN_GROUPS).map(([domain, cats]) => (
            <optgroup key={domain} label={domain}>
              {cats.map((c, i) => <option key={`${slugifyCategory(c)}-${i}`} value={slugifyCategory(c)}>{c}</option>)}
            </optgroup>
          ))}
        </select>
        <Filter size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)" }} />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .course-search-container {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
