"use client";

import React, { useState } from "react";
import { Settings, Shield, Bell, Globe, Database, Save, CheckCircle, Image as ImageIcon, Palette, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { createClient } from "@/utils/supabase/client";

// Custom SVG Icons for Brands (since Lucide removed them)
const GithubIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const supabase = createClient();
  const [settings, setSettings] = useState({ 
    id: "", 
    platform_name: "Pandaschool", 
    admin_email: "admin@pandaschool.in",
    logo_url: "",
    primary_color: "#0F6E56",
    maintenance_mode: false,
    social_github: "",
    social_twitter: "",
    social_linkedin: "",
    social_youtube: ""
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
        if (error) {
          console.error("Error fetching settings:", error);
        }
        if (data) {
          setSettings({
            ...data,
            logo_url: data.logo_url || "",
            primary_color: data.primary_color || "#0F6E56",
            maintenance_mode: data.maintenance_mode || false,
            social_github: data.social_github || "",
            social_twitter: data.social_twitter || "",
            social_linkedin: data.social_linkedin || "",
            social_youtube: data.social_youtube || ""
          });
        }
      } catch (err) {
        console.error("Settings load exception:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        platform_name: settings.platform_name,
        admin_email: settings.admin_email,
        logo_url: settings.logo_url,
        primary_color: settings.primary_color,
        maintenance_mode: settings.maintenance_mode,
        social_github: settings.social_github,
        social_twitter: settings.social_twitter,
        social_linkedin: settings.social_linkedin,
        social_youtube: settings.social_youtube,
      };

      let result;
      
      // If we have an ID, update specifically. Otherwise, try to find the existing row first.
      let targetId = settings.id;
      
      if (!targetId) {
        const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();
        if (existing) targetId = existing.id;
      }

      if (targetId) {
        console.log("Updating site settings row:", targetId);
        result = await supabase.from("site_settings").update(updateData).eq("id", targetId);
      } else {
        console.log("Inserting new site settings row");
        result = await supabase.from("site_settings").insert([updateData]).select().single();
      }

      if (result.error) {
        console.error("Save error details:", result.error);
        throw new Error(result.error.message);
      }

      showToast("Settings saved successfully!", "success");
      
      // Refresh local state
      if (!targetId && result.data) {
        setSettings(prev => ({ ...prev, id: result.data.id }));
      }
    } catch (error: any) {
      console.error("Save failed:", error);
      showToast(`Save failed: ${error.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { name: "General", icon: <Globe size={18} /> },
    { name: "Security", icon: <Shield size={18} /> },
    { name: "Notifications", icon: <Bell size={18} /> },
    { name: "Database", icon: <Database size={18} /> },
  ];

  if (loading) return <div style={{ padding: "40px", color: "var(--text-tertiary)" }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          Settings
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>Global platform configuration and system preferences.</p>
      </div>

      <div className="settings-layout">
        {/* Settings Nav */}
        <div className="settings-nav">
          {tabs.map((item) => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "12px 16px", 
                borderRadius: "10px", 
                border: "none",
                background: activeTab === item.name ? "#111827" : "transparent",
                color: activeTab === item.name ? "white" : "#6B7280",
                fontWeight: activeTab === item.name ? 700 : 600,
                fontSize: "14px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.1s ease"
              }}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div style={{ background: "var(--bg-card)", padding: "40px", borderRadius: "16px", border: "1px solid var(--border-primary)", minHeight: "500px", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {activeTab === "General" && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "24px" }}>General Settings</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="settings-grid-2col">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Platform Name</label>
                      <input 
                        type="text" 
                        value={settings.platform_name} 
                        onChange={e => setSettings({...settings, platform_name: e.target.value})}
                        style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Admin Contact Email</label>
                      <input 
                        type="email" 
                        value={settings.admin_email} 
                        onChange={e => setSettings({...settings, admin_email: e.target.value})}
                        style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>

                  <div className="settings-grid-2col">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}><ImageIcon size={14} /> Logo URL</label>
                      <input 
                        type="text" 
                        value={settings.logo_url} 
                        onChange={e => setSettings({...settings, logo_url: e.target.value})}
                        placeholder="https://..."
                        style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}><Palette size={14} /> Brand Primary Color</label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input 
                          type="color" 
                          value={settings.primary_color} 
                          onChange={e => setSettings({...settings, primary_color: e.target.value})}
                          style={{ width: "44px", height: "44px", padding: "2px", borderRadius: "8px", border: "1px solid var(--border-primary)", cursor: "pointer", background: "var(--bg-secondary)" }}
                        />
                        <input 
                          type="text" 
                          value={settings.primary_color} 
                          onChange={e => setSettings({...settings, primary_color: e.target.value})}
                          style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="maintenance-card" style={{ background: settings.maintenance_mode ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${settings.maintenance_mode ? "#FECACA" : "#BBF7D0"}` }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <AlertTriangle size={20} color={settings.maintenance_mode ? "#EF4444" : "#22C55E"} />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: settings.maintenance_mode ? "#991B1B" : "#166534" }}>Maintenance Mode</div>
                        <div style={{ fontSize: "12px", color: settings.maintenance_mode ? "#B91C1C" : "#15803D" }}>{settings.maintenance_mode ? "Platform is currently closed for users." : "Platform is live and accessible."}</div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      disabled={isSaving}
                      onClick={async () => {
                        const newMode = !settings.maintenance_mode;
                        setSettings({...settings, maintenance_mode: newMode});
                        
                        // Auto-save this specific setting immediately for better UX
                        try {
                          let targetId = settings.id;
                          if (!targetId) {
                            const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();
                            if (existing) targetId = existing.id;
                          }

                          if (targetId) {
                            await supabase.from("site_settings").update({ maintenance_mode: newMode }).eq("id", targetId);
                          } else {
                            const { data } = await supabase.from("site_settings").insert([{ maintenance_mode: newMode }]).select().single();
                            if (data) setSettings(prev => ({ ...prev, id: data.id }));
                          }
                          showToast(`Maintenance mode ${newMode ? "enabled" : "disabled"}`, "success");
                        } catch (err: any) {
                          showToast("Failed to update maintenance mode", "error");
                        }
                      }}
                      style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid", borderColor: settings.maintenance_mode ? "#FECACA" : "#BBF7D0", background: "white", fontSize: "12px", fontWeight: 700, color: settings.maintenance_mode ? "#B91C1C" : "#15803D", cursor: "pointer", opacity: isSaving ? 0.5 : 1 }}
                    >
                      {isSaving ? "..." : (settings.maintenance_mode ? "Disable" : "Enable")}
                    </button>
                  </div>

                  {/* Social Links Section */}
                  <div style={{ marginTop: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>Social Media Links</h3>
                    <div className="settings-grid-2col">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}><GithubIcon style={{ width: "14px", height: "14px" }} /> GitHub</label>
                        <input 
                          type="text" 
                          value={settings.social_github} 
                          onChange={e => setSettings({...settings, social_github: e.target.value})}
                          placeholder="https://github.com/..."
                          style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}><TwitterIcon style={{ width: "14px", height: "14px" }} /> Twitter / X</label>
                        <input 
                          type="text" 
                          value={settings.social_twitter} 
                          onChange={e => setSettings({...settings, social_twitter: e.target.value})}
                          placeholder="https://twitter.com/..."
                          style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}><LinkedinIcon style={{ width: "14px", height: "14px" }} /> LinkedIn</label>
                        <input 
                          type="text" 
                          value={settings.social_linkedin} 
                          onChange={e => setSettings({...settings, social_linkedin: e.target.value})}
                          placeholder="https://linkedin.com/in/..."
                          style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}><YoutubeIcon style={{ width: "14px", height: "14px" }} /> YouTube</label>
                        <input 
                          type="text" 
                          value={settings.social_youtube} 
                          onChange={e => setSettings({...settings, social_youtube: e.target.value})}
                          placeholder="https://youtube.com/..."
                          style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-primary)", fontSize: "14px", outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Security" && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "24px" }}>Security Configuration</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ padding: "20px", border: "1px solid var(--border-primary)", borderRadius: "12px", background: "var(--bg-secondary)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ fontWeight: 700 }}>Multi-Factor Authentication</div>
                            <div style={{ width: "40px", height: "20px", background: "#E5E7EB", borderRadius: "10px", position: "relative", cursor: "not-allowed" }}>
                                <div style={{ position: "absolute", left: "2px", top: "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%" }}></div>
                            </div>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Require MFA for all administrative accounts. (Enterprise Feature)</div>
                    </div>
                    <div style={{ padding: "20px", border: "1px solid var(--border-primary)", borderRadius: "12px", background: "var(--bg-secondary)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ fontWeight: 700 }}>Session Management</div>
                            <div style={{ width: "40px", height: "20px", background: "#E5E7EB", borderRadius: "10px", position: "relative", cursor: "not-allowed" }}>
                                <div style={{ position: "absolute", left: "2px", top: "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%" }}></div>
                            </div>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Automatically log out inactive users after 2 hours.</div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === "Notifications" && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "24px" }}>Notifications</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ padding: "20px", border: "1px solid var(--border-primary)", borderRadius: "12px", background: "var(--bg-secondary)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ fontWeight: 700 }}>Email Alerts</div>
                            <div style={{ width: "40px", height: "20px", background: "#E5E7EB", borderRadius: "10px", position: "relative", cursor: "not-allowed" }}>
                                <div style={{ position: "absolute", left: "2px", top: "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%" }}></div>
                            </div>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Send email notifications for new course enrollments.</div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === "Database" && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "24px" }}>Database Status</h2>
                <div style={{ padding: "24px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#22C55E", fontWeight: 700, marginBottom: "16px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22C55E" }}></div>
                        Connected to Supabase
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)", display: "flex", justifyContent: "space-between" }}>
                            <span>Engine</span>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>PostgreSQL 15</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)", display: "flex", justifyContent: "space-between" }}>
                            <span>Region</span>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>US East (N. Virginia)</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-tertiary)", display: "flex", justifyContent: "space-between" }}>
                            <span>Status</span>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Optimal Performance</span>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--border-primary)" }}>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{ 
                background: "#111827", 
                color: "white", 
                padding: "12px 28px", 
                borderRadius: "10px", 
                border: "none",
                fontWeight: 700, 
                fontSize: "14px",
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.2s ease",
                opacity: isSaving ? 0.5 : 1
              }}
            >
              {isSaving ? "Saving..." : <><Save size={18} /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-layout { display: grid; grid-template-columns: 250px 1fr; gap: 40px; }
        .settings-nav { display: flex; flex-direction: column; gap: 4px; }
        .settings-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .maintenance-card { padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }

        @media (max-width: 768px) {
          .settings-layout { grid-template-columns: 1fr; gap: 24px; }
          .settings-nav { flex-direction: row; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; }
          .settings-nav button { white-space: nowrap; flex: 1; justify-content: center; }
          .settings-grid-2col { grid-template-columns: 1fr; gap: 16px; }
          .maintenance-card { flex-direction: column; align-items: flex-start; gap: 16px; }
          .maintenance-card button { width: 100%; padding: 12px; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
