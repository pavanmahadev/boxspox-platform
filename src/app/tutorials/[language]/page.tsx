import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { CourseContent } from "@/components/tutorials/CourseContent";
import { CourseSchema } from "@/components/seo/CourseSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
  const { data } = await supabase.from("courses").select("slug").eq("status", "published");
  return (data || []).map((c: any) => ({
    language: c.slug,
  }));
}

import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ language: string }> }): Promise<Metadata> {
  const { language } = await params;
  const supabase = await createClient();
  
  const { data: course } = await supabase
    .from("courses")
    .select("title, description, slug")
    .eq("slug", language)
    .single();

  if (!course) return { title: "Course Not Found | Boxspox" };

  const canonicalUrl = `https://boxspox.in/tutorials/${course.slug}`;

  return {
    title: `Master ${course.title} - Full Interactive Course | Boxspox`,
    description: course.description || `Learn ${course.title} from scratch with our project-based curriculum, interactive editor, and AI tutors.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Master ${course.title} | Boxspox`,
      description: course.description || `Learn ${course.title} with interactive tutorials.`,
      url: canonicalUrl,
    }
  };
}

export default async function CoursePage({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  
  console.log("===> CoursePage called with language:", language);
  
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

  // Sort lessons across modules: first sort by module order_index, then lesson order_index
  const allLessons = (modules || [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .flatMap(m =>
      (m.lessons || [])
        .slice()
        .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    );

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

  const isFree = course.price === 0 || course.price === "0" || course.price === null;

  // 3. Authorization Logic: Always redirect when lessons exist
  if (allLessons.length > 0) {
    if (isFree || isEnrolled) {
      // Go to the very first lesson
      redirect(`/tutorials/${language}/${allLessons[0].slug}`);
    } else {
      // Paid course, not enrolled → checkout
      redirect(`/checkout/${course.id}`);
    }
  }

  // Paid course with no lessons yet → checkout
  if (!isFree && !isEnrolled) {
    redirect(`/checkout/${course.id}`);
  }

  // Fallback to overview if no lessons exist yet
  const gradient = course.gradient || "linear-gradient(135deg, #6366f1, #a855f7)";
  
  const breadcrumbItems = [
    { name: "Home", url: "https://boxspox.in/" },
    { name: "Tutorials", url: "https://boxspox.in/tutorials" },
    { name: course.title, url: `https://boxspox.in/tutorials/${course.slug}` }
  ];

  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 20px)" }}>
      <CourseSchema 
        name={course.title}
        description={course.description || `Learn ${course.title}`}
        url={`https://boxspox.in/tutorials/${course.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
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
