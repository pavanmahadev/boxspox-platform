import { createClient } from "@/utils/supabase/server";
import { CourseContent } from "@/components/tutorials/CourseContent";
import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ language: string }> }): Promise<Metadata> {
  const { language } = await params;
  const supabase = await createClient();
  
  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", language)
    .single();

  if (!course) return { title: "Course Not Found | Boxspox" };

  return {
    title: `Master ${course.title} - Full Interactive Course | Boxspox`,
    description: course.description || `Learn ${course.title} from scratch with our project-based curriculum, interactive editor, and AI tutors.`,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  const supabase = await createClient();
  
  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch course from Supabase
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", language)
    .single();

  if (courseError || !course) {
    return (
      <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 80px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Tutorial not found</h1>
        <Link href="/tutorials" className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
          Browse Tutorials
        </Link>
      </div>
    );
  }

  // Fetch modules with nested lessons for this course
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select(`
      *,
      lessons (*)
    `)
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  // Grouped lessons are now in modules
  const allLessons = modules?.flatMap(m => m.lessons).sort((a, b) => a.order_index - b.order_index) || [];

  // Best UX: Directly jump into the first lesson (3-column view) like W3Schools instead of showing a hero banner.
  if (allLessons.length > 0) {
    redirect(`/tutorials/${language}/${allLessons[0].slug}`);
  }

  // Fallback to overview if no lessons exist yet
  const gradient = course.gradient || "linear-gradient(135deg, #6366f1, #a855f7)";

  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 20px)" }}>
      <CourseContent 
        course={course} 
        modules={modules || []}
        lessons={allLessons} 
        gradient={gradient}
        currentUserId={user?.id}
      />
    </div>
  );
}
