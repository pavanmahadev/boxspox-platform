import React from "react";
import { createClient } from "@/utils/supabase/server";
import { AdminAnnouncementsClient } from "@/components/admin/AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, profiles(full_name)")
    .eq("type", "site_wide")
    .order("created_at", { ascending: false });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
          Site-Wide Announcements
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Broadcast messages to all users on the platform.</p>
      </div>

      <AdminAnnouncementsClient initialAnnouncements={announcements || []} />
    </div>
  );
}
