"use client";

import React, { useState } from "react";
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface DownloadButtonProps {
  recipientName: string;
  courseName: string;
  date: string;
  certificateId: string;
  certDbId: string;
}

export default function DownloadButton({
  recipientName,
  courseName,
  date,
  certificateId,
  certDbId,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const handleDownload = async () => {
    if (loading) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    setStatusMsg("Preparing your certificate...");

    try {
      const url = `/api/certificates/download?id=${encodeURIComponent(certDbId)}`;
      console.log("[CertDownload] Fetching PDF from:", url);

      setStatusMsg("Generating PDF certificate...");

      // Use fetch — cookies are sent automatically for same-origin, so auth works
      const res = await fetch(url, {
        method: "GET",
        credentials: "include", // Ensures auth cookies are sent
      });

      console.log("[CertDownload] Response status:", res.status, res.statusText);

      if (!res.ok) {
        let errMsg = `Server error (${res.status})`;
        try {
          const json = await res.json();
          errMsg = json.error || errMsg;
          if (json.details) errMsg += `: ${json.details}`;
        } catch (_) { /* body was not JSON */ }
        throw new Error(errMsg);
      }

      setStatusMsg("Downloading...");

      // Get the raw bytes as a blob — don't check content-type strictly
      const blob = await res.blob();
      console.log("[CertDownload] Blob size:", blob.size, "type:", blob.type);

      if (blob.size < 500) {
        throw new Error("Generated file is too small — may be corrupted. Please try again.");
      }

      // Force-download via a temporary anchor element
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `Boxspox-Certificate-${courseName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(blobUrl);
      }, 200);

      console.log("[CertDownload] ✅ Download triggered successfully");
      setSuccess(true);
      setStatusMsg("Downloaded!");
    } catch (err: any) {
      console.error("[CertDownload] ❌ Error:", err);
      setError(err.message || "Download failed. Please try again.");
      
      // FALLBACK: If fetch fails, try opening the API URL directly in a new tab
      // This is a "power move" that bypasses many browser-side fetch issues
      const url = `/api/certificates/download?id=${encodeURIComponent(certDbId)}`;
      window.open(url, "_blank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          width: "100%",
          background: success
            ? "#059669"
            : loading
            ? "#374151"
            : "var(--brand-primary, #111827)",
          color: "white",
          padding: "16px",
          borderRadius: "12px",
          border: "none",
          fontWeight: 700,
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          opacity: loading ? 0.9 : 1,
        }}
      >
        {loading ? (
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        ) : success ? (
          <CheckCircle2 size={20} />
        ) : (
          <Download size={20} />
        )}
        {loading ? statusMsg || "Generating PDF..." : success ? "Downloaded!" : "Download Certificate"}
      </button>

      {/* Loading progress hint */}
      {loading && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            background: "rgba(15, 110, 86, 0.08)",
            border: "1px solid rgba(15, 110, 86, 0.2)",
            borderRadius: "8px",
            color: "var(--text-secondary, #6b7280)",
            fontSize: "0.78rem",
            textAlign: "center",
          }}
        >
          ⏳ Generating your PDF certificate. This usually takes 3–8 seconds.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: "8px",
            padding: "10px 14px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
