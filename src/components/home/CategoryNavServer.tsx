import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { CategoryNav } from "./CategoryNav";

export async function CategoryNavServer() {
  const supabase = await createClient();
  
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, category_name")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return <CategoryNav courses={courses || []} />;
}
