import { createClient } from "@/utils/supabase/server";
import { LessonContent } from "@/components/tutorials/LessonContent";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ language: string; slug: string }> }): Promise<Metadata> {
  const { language, slug } = await params;
  const supabase = await createClient();
  
  // Fetch lesson joining with module and course to ensure we get the right one for this language
  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      title, 
      description, 
      module:modules!inner(
        course:courses!inner(
          title,
          slug
        )
      )
    `)
    .eq("slug", slug)
    .eq("module.course.slug", language)
    .maybeSingle();

  if (!lesson) return { title: "Lesson Not Found | Boxspox" };

  const courseTitle = (lesson.module as any)?.course?.title;

  return {
    title: `${lesson.title} - ${courseTitle || 'Course'} | Boxspox Academy`,
    description: lesson.description || `Master ${lesson.title} with interactive examples and AI-powered tutoring on Boxspox.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ language: string; slug: string }>;
}) {
  const { language, slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", language)
    .single();

  if (courseError || !course) {
    return (
      <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 80px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Course not found</h1>
        <Link href="/tutorials" className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
          Browse Tutorials
        </Link>
      </div>
    );
  }

  // Fetch all lessons for sidebar (ordered by module then lesson index)
  const { data: modulesData, error: modulesError } = await supabase
    .from("modules")
    .select(`
      id,
      order_index,
      lessons (
        id, title, slug, content, code_template, order_index, video_url, lesson_type
      )
    `)
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  if (modulesError) {
    console.error("Error fetching modules/lessons for sidebar:", modulesError);
  }

  // Flatten lessons and ensure correct order
  const allLessons = modulesData?.flatMap(mod => {
    // Sort lessons within the module
    const sortedLessons = mod.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
    return sortedLessons;
  }) || [];

  const lesson = allLessons?.find(l => l.slug === slug);

  if (!lesson) {
    return (
      <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 80px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Lesson not found</h1>
        <Link href={`/tutorials/${language}`} className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
          Back to Course
        </Link>
      </div>
    );
  }

  // Fetch latest active ad
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);
    
  const ad = ads && ads.length > 0 ? ads[0] : null;

  // Fallback gradient if not in DB
  const gradient = course.gradient || "linear-gradient(135deg, #6366f1, #a855f7)";

  return (
    <>
      <LessonContent 
        course={course} 
        lesson={lesson} 
        ad={ad} 
        allLessons={allLessons || []} 
        gradient={gradient}
        currentUserId={user?.id}
      />
    </>
  );
}
