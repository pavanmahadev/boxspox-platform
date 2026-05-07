import React from "react";
import { createClient } from "@/utils/supabase/server";
import { 
  Award, 
  Download, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  User, 
  ArrowLeft,
  Globe
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import DownloadButton from "@/components/certificates/DownloadButton";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch base certificate record
  const { data: certRecord, error: certError } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single();

  if (!certRecord || certError) {
    console.error("Certificate not found or fetch error detailed:", {
      message: certError?.message,
      details: certError?.details,
      code: certError?.code,
      id: id
    });
    redirect("/dashboard");
  }

  // 2. Fetch related data in parallel for performance and safety
  const [profileRes, courseRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", certRecord.user_id).single(),
    supabase.from("courses").select("title, slug, description").eq("id", certRecord.course_id).single()
  ]);

  const cert = {
    ...certRecord,
    profiles: profileRes.data,
    courses: courseRes.data
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", padding: "60px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", textDecoration: "none", fontSize: "14px", fontWeight: 600, marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "40px", alignItems: "start" }}>
          
          {/* Certificate Card */}
          <div style={{ 
            background: "var(--bg-card)", 
            borderRadius: "24px", 
            padding: "80px", 
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)",
            border: "1px solid var(--border-primary)",
            position: "relative",
            overflow: "hidden",
            textAlign: "center"
          }}>
            {/* Design Elements */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "var(--brand-primary)" }} />
            <div style={{ position: "absolute", bottom: "-50px", right: "-50px", width: "200px", height: "200px", background: "var(--brand-primary)", opacity: 0.03, borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "150px", height: "150px", background: "var(--brand-primary)", opacity: 0.03, borderRadius: "50%" }} />

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
              <div style={{ width: "80px", height: "80px", background: "#E1F5EE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                <Award size={48} />
              </div>
            </div>

            <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "16px" }}>
              Certificate of Completion
            </div>
            
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "24px", fontFamily: "var(--font-heading)" }}>
              {cert.profiles?.full_name}
            </h1>

            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 48px", lineHeight: 1.6 }}>
              has successfully completed all requirements and assessments for the professional course:
            </p>

            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "12px" }}>
              {cert.courses?.title}
            </div>
            
            <div style={{ height: "2px", width: "100px", background: "#E5E7EB", margin: "0 auto 40px" }} />

            <div style={{ display: "flex", justifyContent: "center", gap: "60px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "4px" }}>Issued On</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{new Date(cert.issued_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", marginBottom: "4px" }}>Certificate ID</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{cert.id.substring(0, 13).toUpperCase()}</div>
              </div>
            </div>

            <div style={{ marginTop: "60px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "14px" }}>B</div>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>BOXSPOX <span style={{ color: "var(--text-tertiary)", fontSize: "9px", fontWeight: 700 }}>ACADEMY</span></span>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <DownloadButton 
              recipientName={cert.profiles?.full_name || "Graduate"} 
              courseName={cert.courses?.title || "Professional Course"} 
              date={new Date(cert.issued_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
              certificateId={cert.id.substring(0, 13).toUpperCase()}
              certDbId={cert.id}
            />
            <button style={{ width: "100%", background: "var(--bg-card)", color: "var(--text-primary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-primary)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer" }}>
              <Share2 size={20} /> Share Achievement
            </button>
            <Link href={`/tutorials/${cert.courses?.slug}`} style={{ width: "100%", background: "none", color: "var(--text-tertiary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-primary)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", textDecoration: "none", fontSize: "14px" }}>
              <Globe size={18} /> View Course Page
            </Link>
            
            <div style={{ marginTop: "24px", padding: "20px", background: "#ECFDF5", borderRadius: "16px", border: "1px solid #A7F3D0" }}>
              <div style={{ display: "flex", gap: "12px", color: "#059669" }}>
                <CheckCircle2 size={24} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>Verified Certificate</div>
                  <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px", lineHeight: 1.4 }}>This certificate is cryptographically signed and verifiable by Boxspox Academy.</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
