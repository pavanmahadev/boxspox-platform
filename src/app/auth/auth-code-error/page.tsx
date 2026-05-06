"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthCodeError() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "var(--bg-primary)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "48px 40px",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-2xl)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <AlertCircle size={32} />
        </div>

        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          Authentication Error
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          We couldn't verify your login. This can happen if the link has expired or was already used. Please try logging in again.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <RefreshCw size={18} /> Try Logging In Again
          </Link>
          <Link
            href="/"
            style={{
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
