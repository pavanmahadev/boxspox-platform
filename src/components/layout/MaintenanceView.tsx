import React from "react";
import { Hammer, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function MaintenanceView() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-secondary)",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        background: "var(--bg-card)",
        padding: "48px",
        borderRadius: "24px",
        border: "1px solid var(--border-primary)",
        textAlign: "center",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          background: "#FEF2F2",
          color: "#EF4444",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px"
        }}>
          <Hammer size={40} />
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px" }}>
          Under Maintenance
        </h1>
        
        <p style={{ color: "var(--text-tertiary)", lineHeight: 1.6, marginBottom: "32px", fontSize: "16px" }}>
          We're currently performing some scheduled updates to improve your experience. 
          The platform will be back online shortly. Thank you for your patience!
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ 
                padding: "16px", 
                background: "var(--bg-secondary)", 
                borderRadius: "12px", 
                border: "1px solid var(--border-primary)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textAlign: "left"
            }}>
                <AlertTriangle size={20} color="#FBBF24" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Admins can still access the dashboard via the secure link.
                </span>
            </div>

            <Link href="/login" style={{
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "var(--brand-primary)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px"
            }}>
                <ArrowLeft size={16} /> Try Logging In
            </Link>
        </div>
      </div>
    </div>
  );
}
