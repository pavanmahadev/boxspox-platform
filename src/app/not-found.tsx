import React from "react";
import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
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
        padding: "60px 48px",
        background: "var(--bg-card)",
        borderRadius: "40px",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)"
      }}>
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "32px",
          background: "rgba(15, 110, 86, 0.1)",
          color: "var(--brand-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 36px",
          fontSize: "48px"
        }}>
          🔍
        </div>
        
        <h1 style={{ fontSize: "36px", fontWeight: 900, marginBottom: "16px", color: "var(--text-primary)", letterSpacing: "-1px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: "48px", fontSize: "1.1rem" }}>
          We couldn&apos;t find the tutorial or lesson you were looking for. It might have been moved or renamed.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link 
            href="/tutorials"
            className="btn-primary"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: "10px",
              padding: "18px"
            }}
          >
            <Search size={20} /> Browse All Tutorials
          </Link>
          
          <Link 
            href="/"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: "10px",
              padding: "16px",
              borderRadius: "16px",
              background: "none",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem"
            }}
          >
            <ArrowLeft size={18} /> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
