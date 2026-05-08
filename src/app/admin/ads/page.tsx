import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminAdsPage() {
  const supabase = await createClient();
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  if (profile?.role !== "admin") {
    redirect("/");
  }
  
  // Fetch ads
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });
    
  async function createAd(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const image_url = formData.get("image_url") as string;
    const link_url = formData.get("link_url") as string;
    
    await supabase.from("ads").insert({ title, image_url, link_url });
    redirect("/admin/ads");
  }
  
  async function deleteAd(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id") as string;
    
    await supabase.from("ads").delete().eq("id", id);
    redirect("/admin/ads");
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)" }}>Manage Advertisements</h1>
          <p style={{ color: "var(--text-tertiary)" }}>Create and manage ads displayed in the sidebar.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>
        {/* Create Ad Form */}
        <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "24px", border: "1px solid var(--border-primary)", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Create New Ad</h2>
          <form action={createAd} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Ad Title</label>
              <input required name="title" type="text" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)" }} placeholder="e.g. Summer Sale" />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Image URL</label>
              <input required name="image_url" type="url" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)" }} placeholder="https://..." />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Link URL</label>
              <input required name="link_url" type="url" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-primary)" }} placeholder="https://..." />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: "10px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Plus size={16} /> Create Ad
            </button>
          </form>
        </div>

        {/* Ads List */}
        <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "24px", border: "1px solid var(--border-primary)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Existing Ads</h2>
          {ads && ads.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {ads.map((ad) => (
                <div key={ad.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "10px", overflow: "hidden" }}>
                    <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700 }}>{ad.title}</h3>
                    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--brand-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                      Visit Link <ExternalLink size={12} />
                    </a>
                  </div>
                  <form action={deleteAd}>
                    <input type="hidden" name="id" value={ad.id} />
                    <button type="submit" style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "8px" }}>
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "20px" }}>No ads created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
