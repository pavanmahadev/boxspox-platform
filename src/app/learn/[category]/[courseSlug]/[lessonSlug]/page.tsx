import { createPublicClient } from "@/utils/supabase/public";
import { LessonContent } from "@/components/tutorials/LessonContent";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ category: string, courseSlug: string; lessonSlug: string }> }): Promise<Metadata> {
  const { category, courseSlug, lessonSlug } = await params;
  const supabase = createPublicClient();
  
  // Fetch lesson joining with module and course to ensure we get the right one for this course
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
    .eq("slug", lessonSlug)
    .eq("module.course.slug", courseSlug)
    .maybeSingle();

  if (!lesson) return { title: "Lesson Not Found | Pandaschool" };

  const courseTitle = (lesson.module as any)?.course?.title;
  const canonicalUrl = `https://pandaschool.in/learn/${category}/${courseSlug}/${lessonSlug}`;

  return {
    title: `${lesson.title} - ${courseTitle || 'Course'} | Pandaschool Academy`,
    description: lesson.description || `Master ${lesson.title} with interactive examples and AI-powered tutoring on Pandaschool.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${lesson.title} - ${courseTitle || 'Course'} | Pandaschool Academy`,
      description: lesson.description || `Master ${lesson.title} with interactive examples.`,
      url: canonicalUrl,
      type: "article",
    }
  };
}

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ category: string, courseSlug: string; lessonSlug: string }>;
}) {
  const { category, courseSlug, lessonSlug } = await params;
  const supabase = createPublicClient();

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    return (
      <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 80px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Course not found</h1>
        <Link href={`/learn/${category}`} className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
          Browse {category}
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
  const allLessons = modulesData?.flatMap((mod: any) => {
    // Sort lessons within the module
    const sortedLessons = mod.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
    return sortedLessons;
  }) || [];

  const lesson = allLessons?.find((l: any) => l.slug === lessonSlug);

  if (!lesson) {
    return (
      <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 80px)", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Lesson not found</h1>
        <Link href={`/learn/${category}/${courseSlug}`} className="btn-primary" style={{ marginTop: "20px", display: "inline-flex" }}>
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

  const breadcrumbItems = [
    { name: "Home", url: "https://pandaschool.in/" },
    { name: "Learn", url: "https://pandaschool.in/learn" },
    { name: category, url: `https://pandaschool.in/learn/${category}` },
    { name: course.title, url: `https://pandaschool.in/learn/${category}/${course.slug}` },
    { name: lesson.title, url: `https://pandaschool.in/learn/${category}/${course.slug}/${lesson.slug}` }
  ];

  return (
    <>
      <ArticleSchema 
        headline={lesson.title}
        description={(lesson as any).description || `Learn ${lesson.title}`}
        url={`https://pandaschool.in/learn/${category}/${course.slug}/${lesson.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <LessonContent 
        course={course} 
        lesson={lesson} 
        ad={ad} 
        allLessons={allLessons || []} 
        gradient={gradient}
        baseUrl={`/learn/${category}/${course.slug}`}
      />
    </>
  );
}
