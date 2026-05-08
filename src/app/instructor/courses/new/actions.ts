"use server";

import { createClient } from "@/utils/supabase/server";

export async function createCourseAction(formData: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized: No user session found.");
  }
  
  // Check profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (!profile || (profile.role !== 'instructor' && profile.role !== 'admin')) {
    throw new Error("Unauthorized: Only instructors or admins can create courses.");
  }
  
  const payload = { ...formData, instructor_id: user.id };
  
  const { data, error } = await supabase.from("courses").insert([payload]).select().single();
  
  if (error) {
    console.error("Error creating course in action:", error);
    throw new Error(error.message);
  }
  
  return data;
}
