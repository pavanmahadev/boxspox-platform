import React from "react";

/**
 * Boxspox UI: Skeleton Loader
 * Premium animated placeholders for async loading states
 */

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = "1rem", borderRadius = "8px", className = "", style = {} }: SkeletonProps) {
  return (
    <div 
      className={`skeleton-base ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-primary) 50%, var(--bg-tertiary) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite linear",
        ...style
      }}
    >
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-base {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "16px", border: "1px solid var(--border-primary)" }}>
      <Skeleton height="180px" borderRadius="16px" style={{ marginBottom: "16px" }} />
      <Skeleton width="40%" height="12px" style={{ marginBottom: "12px" }} />
      <Skeleton width="85%" height="24px" style={{ marginBottom: "8px" }} />
      <Skeleton width="100%" height="14px" style={{ marginBottom: "24px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="80px" height="32px" borderRadius="20px" />
        <Skeleton width="40px" height="40px" borderRadius="50%" />
      </div>
    </div>
  );
}

export function LessonItemSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px" }}>
      <Skeleton width="16px" height="16px" borderRadius="50%" />
      <Skeleton width="70%" height="14px" />
    </div>
  );
}
