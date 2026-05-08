import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { createClient } from "@/utils/supabase/server";
import dynamic from "next/dynamic";

const Testimonials = dynamic(() => import("@/components/home/Testimonials").then(mod => mod.Testimonials), { ssr: true });
const Pricing = dynamic(() => import("@/components/home/Pricing").then(mod => mod.Pricing), { ssr: true });
const EditorPreview = dynamic(() => import("@/components/home/EditorPreview").then(mod => mod.EditorPreview), { ssr: true });
const LearningPaths = dynamic(() => import("@/components/home/LearningPaths").then(mod => mod.LearningPaths), { ssr: true });
const ProjectsPreview = dynamic(() => import("@/components/home/ProjectsPreview").then(mod => mod.ProjectsPreview), { ssr: true });
const AIFeature = dynamic(() => import("@/components/home/AIFeature").then(mod => mod.AIFeature), { ssr: true });

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch courses with a safety timeout to prevent page hangs
  let courses = [];
  try {
    const coursePromise = supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000));
    
    const result: any = await Promise.race([coursePromise, timeoutPromise]);
    courses = result.data || [];
  } catch (err) {
    console.warn("Home data fetch delayed, proceeding with empty state");
  }

  return (
    <>
      <Hero />
      <TrustBar />
      <FeaturedCourses courses={courses} />
      <EditorPreview />
      <LearningPaths />
      <ProjectsPreview />
      <AIFeature />
      <Testimonials />
      <Pricing />
    </>
  );
}
