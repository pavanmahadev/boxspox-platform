import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { FeaturedCourses } from "./FeaturedCourses";

export async function FeaturedCoursesServer() {
  const supabase = await createClient();
  
  // We no longer need Promise.race since Suspense will stream this 
  // without blocking the rest of the page from rendering initially.
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return <FeaturedCourses courses={courses || []} />;
}
