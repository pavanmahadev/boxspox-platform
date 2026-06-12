import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CategoriesManager from "./CategoriesManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories — Admin | Pandaschool" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // Fetch all categories from DB
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("order_index", { ascending: true });

  // Count courses per category_id
  const { data: courseCounts } = await supabase
    .from("courses")
    .select("category_id")
    .not("category_id", "is", null);

  const countMap: Record<string, number> = {};
  (courseCounts || []).forEach((c: any) => {
    if (c.category_id) countMap[c.category_id] = (countMap[c.category_id] || 0) + 1;
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <CategoriesManager
        initialCategories={(categories || []).map((cat: any) => ({
          ...cat,
          courseCount: countMap[cat.id] || 0,
        }))}
      />
    </div>
  );
}
