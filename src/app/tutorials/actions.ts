"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchCoursesAction(from: number, to: number, searchQuery?: string, categoryFilter?: string) {
  const supabase = await createClient();
  
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
    .range(from, to);

  if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);
  if (categoryFilter) query = query.eq("category", categoryFilter);

  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching courses in action:", error);
    throw new Error(error.message);
  }
  
  return data || [];
}

export async function fetchQuizAction(lessonId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(*)")
    .eq("lesson_id", lessonId)
    .single();
    
  if (error && error.code !== "PGRST116") { // Ignore not found
    console.error("Error fetching quiz in action:", error);
    throw new Error(error.message);
  }
  
  return data;
}

export async function fetchUserProgressAction() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, completedIds: [] };
  
  const { data: completions, error } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id);
    
  if (error) {
    console.error("Error fetching user progress in action:", error);
    throw new Error(error.message);
  }
  
  const completedIds = completions ? completions.map((c: any) => c.lesson_id) : [];
  
  return { user, completedIds };
}

export async function getCurrentUserAction() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  const { count } = await supabase
    .from("wishlists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
    
  return {
    id: user.id,
    email: user.email,
    role: profile?.role || "user",
    wishlistCount: count || 0
  };
}
