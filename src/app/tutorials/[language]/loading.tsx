import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-secondary)",
      color: "var(--text-primary)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: 600 }}>
        <Loader2 className="animate-spin" size={24} color="var(--brand-primary)" />
        <span>Loading course...</span>
      </div>
    </div>
  );
}
