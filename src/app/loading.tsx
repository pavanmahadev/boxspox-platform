"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{ 
      minHeight: "60vh", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center", 
      justifyContent: "center",
      gap: "20px",
      padding: "100px 20px"
    }}>
      <div style={{ 
        width: "48px", 
        height: "48px", 
        border: "3px solid var(--bg-tertiary)", 
        borderTop: "3px solid var(--brand-primary)", 
        borderRadius: "50%",
      }} className="animate-spin" />
      <div style={{ 
        fontSize: "14px", 
        fontWeight: 600, 
        color: "var(--text-tertiary)", 
        letterSpacing: "1px", 
        textTransform: "uppercase" 
      }}>
        Loading content...
      </div>
    </div>
  );
}
