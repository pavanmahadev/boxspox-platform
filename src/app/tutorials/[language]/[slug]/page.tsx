import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { LessonContent } from "@/components/tutorials/LessonContent";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  // Fetch common course/lesson combinations to pre-render
  // This is a subset of the sitemap
  const { data } = await supabase
    .from("lessons")
    .select(`
      slug,
      module:modules!inner(
        course:courses!inner(slug)
      )
    `)
    .limit(100);

  return (data || []).map((l: any) => ({
    language: l.module.course.slug,
    slug: l.slug,
  }));
}


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

  if (!lesson) return { title: "Lesson Not Found | Pandaschool" };

  const courseTitle = (lesson.module as any)?.course?.title;
  const canonicalUrl = `https://pandaschool.in/tutorials/${language}/${slug}`;

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

  const breadcrumbItems = [
    { name: "Home", url: "https://pandaschool.in/" },
    { name: "Tutorials", url: "https://pandaschool.in/tutorials" },
    { name: course.title, url: `https://pandaschool.in/tutorials/${course.slug}` },
    { name: lesson.title, url: `https://pandaschool.in/tutorials/${course.slug}/${lesson.slug}` }
  ];

  return (
    <>
      <ArticleSchema 
        headline={lesson.title}
        description={(lesson as any).description || `Learn ${lesson.title}`}
        url={`https://pandaschool.in/tutorials/${course.slug}/${lesson.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
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
