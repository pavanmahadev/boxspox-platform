"use client";

import { Share2 } from "lucide-react";

interface ShareCourseButtonProps {
  courseTitle: string;
  courseSlug: string;
  category: string;
  isFeatured?: boolean;
}

export function ShareCourseButton({ courseTitle, courseSlug, category, isFeatured }: ShareCourseButtonProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/learn/${category}/${courseSlug}`;
    if (navigator.share) {
      navigator.share({ title: courseTitle, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => alert("Link copied!"));
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        position: "absolute",
        top: "12px",
        right: isFeatured ? "100px" : "12px",
        background: "rgba(255,255,255,0.9)",
        color: "var(--text-secondary)",
        border: "none",
        padding: "6px",
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 10,
        transition: "color 0.2s, background 0.2s"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--brand-primary)";
        e.currentTarget.style.background = "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.background = "rgba(255,255,255,0.9)";
      }}
      title="Share Course"
    >
      <Share2 size={16} />
    </button>
  );
}
