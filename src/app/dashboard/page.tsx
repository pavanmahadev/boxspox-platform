import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    redirect("/login");
  }

  const [
    { data: certificates },
    { data: enrollments },
    { data: progress },
    { data: profile },
    { count: wishlistCount },
    { data: announcements }
  ] = await Promise.all([
    supabase.from("certificates").select(`*, course:courses (title, slug, image_url)`).eq("user_id", user.id),
    supabase.from("enrollments").select(`*, course:courses (id, title, slug, icon, gradient, price, exam_fee, modules:modules (lessons:lessons (id)))`).eq("user_id", user.id),
    supabase.from("user_progress").select(`*, lesson:lessons!inner(id, title, slug, course:courses!inner(id, title, slug, image_url))`).eq("user_id", user.id).order("completed_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("announcements").select("*, profiles(full_name), courses(title)").order("created_at", { ascending: false }).limit(5)
  ]);

  return (
    <DashboardClient 
      user={user}
      initialProfile={profile}
      initialProgress={progress || []}
      initialCertificates={certificates || []}
      initialEnrollments={enrollments || []}
      wishlistCount={wishlistCount || 0}
      initialAnnouncements={announcements || []}
    />
  );
}
