import React from "react";
import { createClient } from "@/utils/supabase/server";
import { 
  Award, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CertificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/certifications");
  }

  const [certsRes, coursesRes] = await Promise.all([
    supabase.from("certificates").select("*, courses(*)").eq("user_id", user.id),
    supabase.from("courses").select("*").eq("status", "published")
  ]);

  const earnedCertificates = certsRes.data || [];
  const allCourses = coursesRes.data || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", padding: "80px 20px" }}>
      <div className="section-container" style={{ maxWidth: "1000px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#EEF2FF", color: "#4F46E5", padding: "8px 16px", borderRadius: "var(--radius-full)", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
            <ShieldCheck size={16} />
            Professional Certifications
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
            Validate Your Skills
          </h1>
          <p style={{ fontSize: "1.2rem", color: "var(--text-tertiary)", maxWidth: "600px", margin: "0 auto" }}>
            Earn industry-recognized certificates by completing courses and passing final project assessments.
          </p>
        </div>

        {/* Earned Certificates */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            My Certificates
            <span style={{ fontSize: "12px", background: "var(--brand-primary)", color: "white", padding: "2px 10px", borderRadius: "10px" }}>{earnedCertificates.length}</span>
          </h2>
          
          {earnedCertificates.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {earnedCertificates.map((cert: any) => (
                <Link key={cert.id} href={`/certificates/${cert.id}`} style={{ textDecoration: "none" }}>
                  <div className="hover-lift" style={{ background: "var(--bg-card)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border-primary)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--brand-primary)" }} />
                    <Award size={40} color="#f59e0b" style={{ marginBottom: "20px" }} />
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>{cert.courses?.title}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginBottom: "24px" }}>Issued on {new Date(cert.issued_at).toLocaleDateString()}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--brand-primary)", fontWeight: 700, fontSize: "14px" }}>
                      View Certificate <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "60px", background: "var(--bg-card)", borderRadius: "24px", border: "1px dashed #E5E7EB", textAlign: "center" }}>
              <Award size={48} color="#D1D5DB" style={{ marginBottom: "16px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>No certificates yet</h3>
              <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px" }}>Complete your first course to earn your professional certification.</p>
              <Link href="/tutorials" className="btn-primary" style={{ display: "inline-flex" }}>Browse Tutorials</Link>
            </div>
          )}
        </div>

        {/* Available Certifications */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "24px" }}>Available Certifications</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {allCourses.filter((c: any) => !earnedCertificates.some((ec: any) => ec.course_id === c.id)).map((course: any) => (
              <Link key={course.id} href={`/tutorials/${course.slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "var(--bg-primary)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-primary)", opacity: 0.8, transition: "opacity 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                    <div style={{ width: "48px", height: "48px", background: "var(--bg-tertiary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                      {course.icon || "📚"}
                    </div>
                    <Lock size={18} color="#9CA3AF" />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{course.title}</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {course.description}
                  </p>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Requirements: Complete all lessons + Pass the Exam (80%+)
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
