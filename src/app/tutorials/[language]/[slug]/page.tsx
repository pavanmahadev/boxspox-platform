import { createClient } from "@/utils/supabase/server";
import { LessonContent } from "@/components/tutorials/LessonContent";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ language: string; slug: string }> }): Promise<Metadata> {
  const { language, slug } = await params;
  const supabase = await createClient();
  
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, description, course:courses(title)")
    .eq("slug", slug)
    .single();

  if (!lesson) return { title: "Lesson Not Found | Boxspox" };

  const courseTitle = Array.isArray(lesson.course) ? lesson.course[0]?.title : (lesson.course as any)?.title;

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
  const { data: allLessons, error: allLessonsError } = await supabase
    .from("lessons")
    .select("id, title, slug, content, code_template, order_index, video_url, lesson_type")
    .in("module_id", (
      await supabase
        .from("modules")
        .select("id")
        .eq("course_id", course.id)
        .order("order_index", { ascending: true })
    ).data?.map(m => m.id) || [])
    .order("order_index", { ascending: true });

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

  // Fallback gradient if not in DB
  const gradient = course.gradient || "linear-gradient(135deg, #6366f1, #a855f7)";

  return (
    <>
      <LessonContent 
        course={course} 
        lesson={lesson} 
        allLessons={allLessons || []} 
        gradient={gradient}
        currentUserId={user?.id}
      />
    </>
  );
}
