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

export async function updateCourseAction(id: string, formData: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized: No user session found.");
  }
  
  // Verify ownership or admin
  const { data: course } = await supabase
    .from("courses")
    .select("instructor_id")
    .eq("id", id)
    .single();
    
  if (!course) {
    throw new Error("Course not found.");
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (course.instructor_id !== user.id && profile?.role !== 'admin') {
    throw new Error("Unauthorized: You cannot edit this course.");
  }
  
  const { error } = await supabase.from("courses").update(formData).eq("id", id);
  
  if (error) {
    console.error("Error updating course in action:", error);
    throw new Error(error.message);
  }
  
  return { success: true };
}

export async function getLessonEngagementAction(courseId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_lesson_engagement", { p_course_id: courseId });
  
  if (error) {
    console.error("Error fetching lesson engagement in action:", error);
    throw new Error(error.message);
  }
  
  return data;
}

export async function fetchCurriculumAction(courseId: string) {
  const supabase = await createClient();
  
  const { data: modulesData, error: modulesError } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
    
  if (modulesError) {
    console.error("Error fetching curriculum in action:", modulesError);
    throw new Error(modulesError.message);
  }
  
  return modulesData || [];
}
