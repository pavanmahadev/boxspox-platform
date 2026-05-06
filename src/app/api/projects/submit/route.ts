import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, githubUrl, liveUrl } = await req.json();

    if (!projectId || !githubUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if there's an existing submission
    const { data: existing } = await supabase
      .from("project_submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("project_submissions")
        .update({
          github_url: githubUrl,
          live_url: liveUrl || null,
          status: "pending", // Reset status to pending on resubmission
          submitted_at: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from("project_submissions")
        .insert({
          user_id: user.id,
          project_id: projectId,
          github_url: githubUrl,
          live_url: liveUrl || null,
          status: "pending"
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Project submission error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
