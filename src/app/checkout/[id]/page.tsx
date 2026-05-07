import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Check, ShieldCheck, Lock, CreditCard, Sparkles, MoveRight } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=/checkout/${id}`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("*, profiles:instructor_id(full_name)")
    .eq("id", id)
    .single();

  if (!course) notFound();

  // Check if already enrolled
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", id)
    .single();

  if (enrollment) {
    redirect(`/tutorials/${course.slug}`);
  }

  async function handlePurchase() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // SIMULATED PAYMENT SUCCESS
    // In production, you would call Stripe here
    
    const { error } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: id,
        status: "active"
      });

    if (!error) {
      revalidatePath(`/tutorials/${course.slug}`);
      redirect(`/tutorials/${course.slug}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", padding: "100px 20px" }}>
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
              Premium Course
            </span>
            <h1 style={{ fontSize: "40px", fontWeight: 900, color: "var(--text-primary)", marginTop: "12px", letterSpacing: "-1px" }}>
              {course.title}
            </h1>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginTop: "16px", lineHeight: 1.6 }}>
              {course.description}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[
              "Full Lifetime Access",
              "Certificate of Completion",
              "Interactive Coding Playground",
              "AI-Powered Learning Support",
              "Regular Content Updates",
              "Premium Community Access"
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
              <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>Secure Checkout</div>
              <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Your payment information is encrypted and secure.</div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div style={{ position: "sticky", top: "100px", height: "fit-content" }}>
          <div style={{ background: "var(--bg-primary)", borderRadius: "24px", border: "1px solid var(--border-primary)", padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Order Summary</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Course Price</span>
                <span style={{ fontWeight: 700 }}>${course.price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>Platform Discount</span>
                <span style={{ color: "#059669", fontWeight: 700 }}>-$0.00</span>
              </div>
              <div style={{ height: "1px", background: "var(--border-primary)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "24px", fontWeight: 900, color: "var(--text-primary)" }}>
                <span>Total</span>
                <span>${course.price}</span>
              </div>
            </div>

            <form action={handlePurchase}>
              <button 
                type="submit"
                style={{ 
                  width: "100%", background: "var(--brand-primary)", color: "white", padding: "18px", 
                  borderRadius: "16px", border: "none", fontSize: "16px", fontWeight: 800, 
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  transition: "transform 0.2s"
                }}
              >
                Enroll Now <MoveRight size={20} />
              </button>
            </form>

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: "var(--text-tertiary)", fontSize: "12px", fontWeight: 600 }}>
                <Lock size={12} /> 30-Day Money-Back Guarantee
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", opacity: 0.5 }}>
                 <CreditCard size={20} />
                 <Sparkles size={20} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
