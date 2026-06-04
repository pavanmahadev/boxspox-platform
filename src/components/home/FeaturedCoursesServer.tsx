import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { FeaturedCourses } from "./FeaturedCourses";

export async function FeaturedCoursesServer() {
  let courses: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(9);
    
    courses = data || [];
  } catch (e) {
    // Fallback to default courses on error
    courses = [];
  }

  return <FeaturedCourses courses={courses} />;
}
