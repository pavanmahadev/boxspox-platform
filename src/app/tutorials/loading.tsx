import { CourseCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-secondary)",
      paddingTop: "112px"
    }}>
      <div className="section-container">
        {/* Header Skeleton */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ width: "320px", height: "48px", background: "var(--bg-card)", borderRadius: "12px", marginBottom: "16px" }} className="animate-pulse" />
          <div style={{ width: "600px", height: "24px", background: "var(--bg-card)", borderRadius: "8px" }} className="animate-pulse" />
        </div>

        {/* Filter Bar Skeleton */}
        <div style={{ height: "64px", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-primary)", marginBottom: "40px" }} />

        {/* Grid Skeleton */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "24px" 
        }}>
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <style>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
