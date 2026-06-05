import { createPublicClient } from "@/utils/supabase/public";
import { CourseContent } from "@/components/tutorials/CourseContent";
import { CourseSchema } from "@/components/seo/CourseSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ category: string, courseSlug: string }> }): Promise<Metadata> {
  const { category, courseSlug } = await params;
  const supabase = createPublicClient();
  
  const { data: course } = await supabase
    .from("courses")
    .select("title, description, slug")
    .eq("slug", courseSlug)
    .single();

  if (!course) return { title: "Course Not Found | Boxspox" };

  const canonicalUrl = `https://boxspox.in/learn/${category}/${course.slug}`;

  return {
    title: `Master ${course.title} - Full Interactive Course | Boxspox`,
    description: course.description || `Learn ${course.title} from scratch with our expert curriculum.`,
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

export default async function LearnCoursePage({ params }: { params: Promise<{ category: string, courseSlug: string }> }) {
  const { category, courseSlug } = await params;
  
  const supabase = createPublicClient();

  // Fetch course from Supabase
  let { data: course, error: courseError } = await supabase
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

  // Fetch modules with nested lessons for this course
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      *,
      lessons (*)
    `)
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const allLessons = (modules || [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .flatMap(m =>
      (m.lessons || [])
        .slice()
        .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
    );

  // Caching revalidation is set to 3600s, so we don't query user-dependent enrollment data server-side.

  // Authorization Logic: redirect when lessons exist
  if (allLessons.length > 0) {
    redirect(`/learn/${category}/${courseSlug}/${allLessons[0].slug}`);
  }

  // Fallback to overview if no lessons exist yet
  const gradient = course.gradient || "linear-gradient(135deg, #6366f1, #a855f7)";
  
  const breadcrumbItems = [
    { name: "Home", url: "https://boxspox.in/" },
    { name: "Learn", url: "https://boxspox.in/learn" },
    { name: category, url: `https://boxspox.in/learn/${category}` },
    { name: course.title, url: `https://boxspox.in/learn/${category}/${course.slug}` }
  ];

  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + var(--subnav-height) + 20px)" }}>
      <CourseSchema 
        name={course.title}
        description={course.description || `Learn ${course.title}`}
        url={`https://boxspox.in/learn/${category}/${course.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <CourseContent 
        course={course} 
        modules={modules || []}
        lessons={allLessons} 
        gradient={gradient}
        baseUrl={`/learn/${category}/${course.slug}`}
      />
    </div>
  );
}
