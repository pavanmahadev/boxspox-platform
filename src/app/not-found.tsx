"use client";

import Link from "next/link";
import { MoveLeft, Home, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "var(--bg-secondary)",
      padding: "20px"
    }}>
      <div style={{ 
        maxWidth: "500px", 
        width: "100%", 
        textAlign: "center",
        background: "var(--bg-primary)",
        padding: "60px 40px",
        borderRadius: "32px",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.05)"
      }}>
        {/* Visual Element */}
        <div style={{ 
          fontSize: "120px", 
          fontWeight: 900, 
          color: "var(--brand-primary)", 
          lineHeight: 1,
          marginBottom: "24px",
          opacity: 0.1,
          letterSpacing: "-10px"
        }}>
          404
        </div>

        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: 900, 
          color: "var(--text-primary)", 
          marginBottom: "16px",
          letterSpacing: "-1px" 
        }}>
          Lost in the Code?
        </h1>
        
        <p style={{ 
          color: "var(--text-tertiary)", 
          fontSize: "16px", 
          lineHeight: 1.6,
          marginBottom: "40px" 
        }}>
          The page you're looking for doesn't exist or has been moved to another coordinate in the ecosystem.
        </p>

        {/* Navigation Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link 
            href="/" 
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "16px", background: "var(--brand-primary)", color: "white",
              borderRadius: "16px", textDecoration: "none", fontWeight: 700,
              transition: "transform 0.2s"
            }}
          >
            <Home size={18} /> Back to Home
          </Link>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Link 
              href="/tutorials" 
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px", background: "var(--bg-secondary)", color: "var(--text-primary)",
                borderRadius: "14px", textDecoration: "none", fontWeight: 700, fontSize: "14px",
                border: "1px solid var(--border-primary)"
              }}
            >
              <BookOpen size={16} /> Tutorials
            </Link>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-search"))}
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "14px", background: "var(--bg-secondary)", color: "var(--text-primary)",
                borderRadius: "14px", border: "1px solid var(--border-primary)", 
                fontWeight: 700, fontSize: "14px", cursor: "pointer"
              }}
            >
              <Search size={16} /> Search
            </button>
          </div>
        </div>

        <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--border-primary)" }}>
          <Link href="/dashboard" style={{ color: "var(--text-tertiary)", textDecoration: "none", fontSize: "14px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <MoveLeft size={16} /> Go back to your dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
