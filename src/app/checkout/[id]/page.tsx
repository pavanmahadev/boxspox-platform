import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Check, ShieldCheck, Lock, CreditCard, Sparkles, MoveRight } from "lucide-react";
import Link from "next/link";
import RazorpayButton from "@/components/checkout/RazorpayButton";
import { revalidatePath } from "next/cache";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/checkout/${id}`);
  }

  // Normalize ID (just in case browser somehow converted hyphens to spaces)
  const normalizedId = id.replace(/%20| /g, "-");

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", normalizedId)
    .single();

  if (courseError) {
    console.error("[Checkout] Error fetching course:", courseError);
  }

  if (!course) {
    console.error("[Checkout] Course not found for ID:", normalizedId);
    notFound();
  }

  // Check if already paid for exam
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", normalizedId)
    .single();

  if (enrollment?.exam_unlocked) {
    // Already unlocked — go straight to the exam, NOT /tutorials/slug (that causes a redirect loop)
    redirect(`/tutorials/${course.slug}/exam`);
  }



  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", paddingTop: "180px", paddingBottom: "60px", paddingLeft: "20px", paddingRight: "20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "40px" }}>
        
        {/* Left Side: Course Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <Link href="/tutorials" style={{ color: "var(--text-tertiary)", textDecoration: "none", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
             Browse Courses
          </Link>

          <div>
            <span style={{ 
              background: "rgba(15, 110, 86, 0.1)", color: "var(--brand-primary)", 
              padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Official Certification
            </span>
            <h1 style={{ fontSize: "40px", fontWeight: 900, color: "var(--text-primary)", marginTop: "12px", letterSpacing: "-1px" }}>
              Buy {course.title} Course
            </h1>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              Get full access to the {course.title} course and earn a verified industry certificate upon completion.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[
              "1 Attempt at Final Exam",
              "Verified Digital Certificate",
              "Shareable LinkedIn Credential",
              "Lifetime Access to Certificate",
              "Instant PDF Download"
            ].map((feature, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={12} color="#059669" strokeWidth={3} />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg-primary)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>Free Early Access</div>
              <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Certification is currently free for a limited time.</div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div style={{ position: "sticky", top: "160px", height: "fit-content" }}>
          <div style={{ background: "var(--bg-primary)", borderRadius: "24px", border: "1px solid var(--border-primary)", padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Order Summary</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Exam & Certificate Fee</span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>₹{course.exam_fee || 199}</span>
              </div>
              <div style={{ height: "1px", background: "var(--border-primary)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "24px", fontWeight: 900, color: "var(--text-primary)" }}>
                <span>Total</span>
                <span style={{ color: "var(--brand-primary)" }}>₹{course.exam_fee || 199}</span>
              </div>
            </div>

            <RazorpayButton courseId={normalizedId} />

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "var(--text-tertiary)", fontSize: "12px", fontWeight: 600 }}>
                <CreditCard size={12} /> Secure Payment via Razorpay
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
