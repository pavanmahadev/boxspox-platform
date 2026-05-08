import { createClient } from "@/utils/supabase/server";
import { CourseContent } from "@/components/tutorials/CourseContent";

export const dynamic = "force-dynamic";
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
  
  if (language.includes(" ")) {
    redirect(`/tutorials/${language.replace(/ /g, "-")}`);
  }

  const supabase = await createClient();
  
  // Get the current user session
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch course from Supabase
  let { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", language)
    .single();

  // Fallback to category search if not found by slug
  if (!course) {
    const { data: categoryCourses } = await supabase
      .from("courses")
      .select("*")
      .ilike("category", language)
      .limit(1);
      
    if (categoryCourses && categoryCourses.length > 0) {
      course = categoryCourses[0];
      courseError = null;
    }
  }

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

  // 1. Fetch modules with nested lessons for this course
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      *,
      lessons (*)
    `)
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const allLessons = modules?.flatMap(m => m.lessons).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) || [];

  // 2. Check Enrollment for Paid Courses
  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("status", "active")
      .single();
    
    isEnrolled = !!enrollment;
  }

  // 3. Authorization Logic: Redirect based on price and enrollment
  if (allLessons.length > 0) {
    const isFree = course.price === 0 || course.price === null;
    
    if (isFree || isEnrolled) {
      redirect(`/tutorials/${language}/${allLessons[0].slug}`);
    } else {
      // Not enrolled and not free -> Go to course landing/checkout
      redirect(`/checkout/${course.id}`);
    }
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
