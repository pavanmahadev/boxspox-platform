import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";

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
    <CheckoutFlow 
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        exam_fee: course.exam_fee,
        description: course.description
      }}
      user={{
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "LEARNER"
      }}
    />
  );
}
