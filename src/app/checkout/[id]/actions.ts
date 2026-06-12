"use server";

import { createClient } from "@/utils/supabase/server";
import axios from "axios";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRazorpayOrder(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch course to get price
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    throw new Error("Course not found");
  }

  const amount = (course.exam_fee || 199) * 100; // Amount in paise

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn("[Razorpay] Keys not configured, falling back to simulation mode.");
    return {
      success: true,
      mock: true,
      course: {
        title: course.title,
        slug: course.slug,
      }
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amount,
        currency: "INR",
        receipt: courseId,
        notes: {
          courseId: courseId,
          userId: user.id,
        },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      order: response.data,
      keyId: keyId, // Send keyId to client to initialize script
      user: {
        email: user.email,
        name: user.user_metadata?.full_name || "",
      },
      course: {
        title: course.title,
        description: `Exam for ${course.title}`,
      }
    };
  } catch (error: any) {
    console.error("[Razorpay] Create Order Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.description || "Failed to create order",
    };
  }
}

export async function verifyRazorpayPayment(
  paymentId: string,
  orderId: string,
  signature: string,
  courseId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  // Verify signature
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac("sha256", keySecret)
    .update(text)
    .digest("hex");

  if (generated_signature !== signature) {
    return { success: false, error: "Invalid payment signature" };
  }

  // Payment is valid, update database
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  const { data: course } = await supabase
    .from("courses")
    .select("title, slug, category")
    .eq("id", courseId)
    .single();

  if (!course) {
    return { success: false, error: "Course not found" };
  }

  if (enrollment) {
    const { error } = await supabase
      .from("enrollments")
      .update({
        status: "active",
        exam_unlocked: true,
        payment_reference_id: paymentId,
      })
      .eq("id", enrollment.id);

    if (error) {
      console.error("[Checkout] Payment Update Error:", error);
      return { success: false, error: "Failed to update enrollment" };
    }
  } else {
    const { error } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: "active",
        exam_unlocked: true,
        payment_reference_id: paymentId,
      });

    if (error) {
      console.error("[Checkout] Payment Insert Error:", error);
      return { success: false, error: "Failed to create enrollment" };
    }
  }

  const slugify = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const cat = slugify(course.category || "development");
  const isTutorial = !course.category || course.category.toLowerCase() === "tutorials" || course.category.toLowerCase() === "tutorial";
  const linkPath = isTutorial ? `/tutorials/${course.slug}/exam` : `/learn/${cat}/${course.slug}/exam`;

  // Insert Exam Unlocked notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "success",
    title: "Exam Unlocked!",
    body: `Payment verified. You have successfully unlocked the certification exam for ${course.title || 'Course'}!`,
    link: linkPath,
    is_read: false
  });

  revalidatePath(`/learn/${cat}/${course.slug}`);
  revalidatePath(`/learn/${cat}/${course.slug}/exam`);
  revalidatePath(`/tutorials/${course.slug}`);
  revalidatePath(`/tutorials/${course.slug}/exam`);
  
  return { success: true, slug: course.slug };
}

export async function simulatePurchase(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("title, slug, category")
    .eq("id", courseId)
    .single();

  if (!course) {
    throw new Error("Course not found");
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (enrollment) {
    const { error } = await supabase
      .from("enrollments")
      .update({
        status: "active",
        exam_unlocked: true,
        payment_reference_id: `sim_pay_${Date.now()}`
      })
      .eq("id", enrollment.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: "active",
        exam_unlocked: true,
        payment_reference_id: `sim_pay_${Date.now()}`
      });

    if (error) throw error;
  }

  const slugify = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const cat = slugify(course.category || "development");
  const isTutorial = !course.category || course.category.toLowerCase() === "tutorials" || course.category.toLowerCase() === "tutorial";
  const linkPath = isTutorial ? `/tutorials/${course.slug}/exam` : `/learn/${cat}/${course.slug}/exam`;

  // Insert Exam Unlocked notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "success",
    title: "Exam Unlocked!",
    body: `Purchase simulated. You have successfully unlocked the certification exam for ${course.title || 'Course'}!`,
    link: linkPath,
    is_read: false
  });

  revalidatePath(`/learn/${cat}/${course.slug}`);
  revalidatePath(`/learn/${cat}/${course.slug}/exam`);
  revalidatePath(`/tutorials/${course.slug}`);
  revalidatePath(`/tutorials/${course.slug}/exam`);

  return { success: true, slug: course.slug };
}
