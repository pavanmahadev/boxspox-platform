"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global App Error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-secondary)",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "500px",
        padding: "48px",
        background: "var(--bg-card)",
        borderRadius: "32px",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "24px",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px"
        }}>
          <AlertTriangle size={40} />
        </div>
        
        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px", color: "var(--text-primary)" }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: "40px" }}>
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button 
            onClick={() => reset()}
            className="btn-primary"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "14px 28px"
            }}
          >
            <RefreshCcw size={18} /> Try Again
          </button>
          
          <Link 
            href="/"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "14px 28px",
              borderRadius: "12px",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontWeight: 700,
              border: "1px solid var(--border-primary)"
            }}
          >
            <Home size={18} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
