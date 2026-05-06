import { createClient } from "@/utils/supabase/server";
import { InfiniteTutorialList } from "@/components/tutorials/InfiniteTutorialList";
import { CourseSearch } from "@/components/admin/CourseSearch";

export default async function TutorialsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; category?: string }> 
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();
  
  // Fetch initial batch of 8 courses for server-side rendering
  let query = supabase
    .from("courses")
    .select(`
      *,
      modules:modules (
        lessons:lessons (id)
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(0, 7);

  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category", category);

  const { data: courses } = await query;

  return (
    <div style={{ paddingTop: "112px", background: "var(--bg-secondary)", minHeight: "100vh" }}>
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-primary)", padding: "clamp(40px, 8vw, 60px) 0" }}>
        <div className="section-container">
          <h1 style={{ fontSize: "var(--h1-size)", fontWeight: 900, color: "var(--text-primary)", marginBottom: "12px", fontFamily: "var(--font-heading)" }}>
            Explore All <span style={{ color: "var(--brand-primary)" }}>Tutorials</span>
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "clamp(1rem, 2vw, 1.1rem)", maxWidth: "600px", marginBottom: "32px" }}>
            Comprehensive guides for every skill level. Master new technologies through interactive, hands-on learning.
          </p>
          
          <CourseSearch initialValue={q || ""} initialCategory={category || ""} />
        </div>
      </div>

      <div className="section-container" style={{ padding: "clamp(40px, 8vw, 60px) var(--container-padding) 100px" }}>
        <InfiniteTutorialList 
          initialCourses={courses || []} 
          searchQuery={q}
          categoryFilter={category}
        />
      </div>
    </div>
  );
}
