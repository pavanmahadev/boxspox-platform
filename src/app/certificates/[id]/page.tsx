import React from "react";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import PremiumCertificateView from "@/components/certificates/PremiumCertificateView";

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
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary, #f8fafc)", padding: "120px 20px 80px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        <Link href="/dashboard" className="back-dashboard-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <PremiumCertificateView 
          cert={cert} 
          profile={profileRes.data} 
          course={courseRes.data} 
        />
        
      </div>
    </div>
  );
}
