import React from "react";
import { createClient } from "@/utils/supabase/server";
import { InstructorAnnouncementsClient } from "@/components/instructor/InstructorAnnouncementsClient";

export default async function InstructorAnnouncementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch instructor's courses for the dropdown
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("instructor_id", user.id);

  // Fetch existing course announcements made by this instructor
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, courses(title)")
    .eq("type", "course")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
          Course Announcements
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Message the students enrolled in your courses.</p>
      </div>

      <InstructorAnnouncementsClient 
        initialAnnouncements={announcements || []} 
        courses={courses || []} 
      />
    </div>
  );
}
