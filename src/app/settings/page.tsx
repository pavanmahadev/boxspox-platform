"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, Mail, Shield, Palette, Save, Loader2, Camera, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type ToastType = "success" | "error" | null;

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ msg: string; type: ToastType }>({ msg: "", type: null });

  function showToast(msg: string, type: ToastType) {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: null }), 4000);
  }

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/login?next=/settings");
          return;
        }
        setUser(user);
        setFullName(user.user_metadata?.full_name || "");
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(); // maybeSingle won't error if row missing
        setProfile(prof);
        setAvatarUrl(prof?.avatar_url || null);
      } catch (e) {
        console.error("Settings load error:", e);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      // Bust cache with timestamp
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(bustedUrl);

      await supabase.from("profiles").update({ avatar_url: bustedUrl }).eq("id", user.id);
      await supabase.auth.updateUser({ data: { avatar_url: bustedUrl } });

      showToast("Avatar updated successfully!", "success");
      
      // Realtime Broadcast
      const { broadcastAnnouncement } = await import("@/utils/realtime");
      broadcastAnnouncement(`${fullName || user.email?.split('@')[0]} just updated their profile photo!`, 'success');
    } catch (err: any) {
      showToast("Avatar upload failed: " + err.message, "error");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (error) throw error;
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      showToast("Profile saved successfully!", "success");

      // Realtime Broadcast
      const { broadcastAnnouncement } = await import("@/utils/realtime");
      broadcastAnnouncement(`${fullName} updated their profile info.`, 'info');
    } catch (err: any) {
      showToast("Error saving profile: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed successfully!", "success");
    } catch (err: any) {
      showToast("Error changing password: " + err.message, "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = (fullName || user?.email || "U").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <Loader2 className="animate-spin" size={32} color="var(--brand-primary)" />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + 40px)", paddingBottom: "100px", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div className="section-container" style={{ maxWidth: "800px" }}>

        {/* Toast */}
        {toast.type && (
          <div style={{
            position: "fixed", top: "100px", right: "24px", zIndex: 9999,
            background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toast.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            color: toast.type === "success" ? "#059669" : "#DC2626",
            padding: "14px 20px", borderRadius: "14px",
            display: "flex", alignItems: "center", gap: "10px",
            fontWeight: 600, fontSize: "0.9rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            animation: "slideInRight 0.3s ease"
          }}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.msg}
          </div>
        )}

        <div style={{ marginBottom: "40px", animation: "slideInRight 0.3s ease" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Settings</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Manage your account settings and preferences.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* ── Avatar & Profile Section ── */}
          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
              <User size={20} color="var(--brand-primary)" />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Profile Information</h2>
            </div>
            <div style={{ padding: "clamp(20px, 5vw, 32px)", display: "flex", flexDirection: "column", gap: "28px" }}>

              {/* Avatar Upload */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{
                    width: "88px", height: "88px", borderRadius: "50%",
                    background: displayAvatar ? "transparent" : "var(--brand-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "2rem", fontWeight: 800, color: "white",
                    overflow: "hidden", border: "3px solid var(--border-primary)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }}>
                    {displayAvatar
                      ? <img src={displayAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials
                    }
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    style={{
                      position: "absolute", bottom: 0, right: 0,
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "var(--brand-primary)", color: "white",
                      border: "2px solid var(--bg-card)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                    title="Change avatar"
                  >
                    {avatarUploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Profile Photo</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px" }}>JPG, PNG or WebP. Max 5MB.</div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    style={{
                      padding: "8px 16px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700,
                      background: "var(--bg-secondary)", border: "1px solid var(--border-primary)",
                      cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <Camera size={14} /> {avatarUploading ? "Uploading..." : "Change Photo"}
                  </button>
                </div>
              </div>

              {/* Name & Email Grid */}
              <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Full Name</label>
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    style={{ padding: "12px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none" }}
                    placeholder="Your full name"
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                    <input type="email" disabled value={user?.email || ""}
                      style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", color: "var(--text-tertiary)", cursor: "not-allowed", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSaveProfile} disabled={saving} className="btn-primary"
                  style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: "8px" }}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Profile</>}
                </button>
              </div>
            </div>
          </section>

          {/* ── Change Password Section ── */}
          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
              <KeyRound size={20} color="var(--brand-primary)" />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Change Password</h2>
            </div>
            <div style={{ padding: "clamp(20px, 5vw, 32px)" }}>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}>
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Confirm Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                      />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}>
                        {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ color: "#ef4444", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertCircle size={14} /> Passwords do not match
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" disabled={passwordSaving || !newPassword} className="btn-primary"
                    style={{ padding: "12px 28px", display: "flex", alignItems: "center", gap: "8px", opacity: !newPassword ? 0.5 : 1 }}>
                    {passwordSaving ? <Loader2 size={18} className="animate-spin" /> : <><Shield size={18} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* ── Preferences ── */}
          <section style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
              <Palette size={20} color="var(--brand-primary)" />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Preferences</h2>
            </div>
            <div style={{ padding: "clamp(20px, 5vw, 32px)", display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { label: "Dark Mode", desc: "Use the dark theme for the interface." },
                { label: "Email Notifications", desc: "Receive updates about your courses and progress." },
                { label: "Marketing Emails", desc: "Receive tips, tutorials, and platform news." },
              ].map((pref, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: i < 2 ? "1px solid var(--border-primary)" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{pref.label}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{pref.desc}</div>
                  </div>
                  <div
                    style={{ width: "48px", height: "26px", background: i === 0 ? "var(--brand-primary)" : "var(--bg-tertiary)", borderRadius: "13px", position: "relative", cursor: "pointer", transition: "background 0.2s", border: "1px solid var(--border-primary)", flexShrink: 0 }}
                  >
                    <div style={{ position: "absolute", top: "3px", left: i === 0 ? "auto" : "3px", right: i === 0 ? "3px" : "auto", width: "18px", height: "18px", background: "var(--bg-card)", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "all 0.2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Danger Zone ── */}
          <section style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertCircle size={20} color="#ef4444" />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ef4444" }}>Danger Zone</h2>
            </div>
            <div style={{ padding: "clamp(20px, 5vw, 32px)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>Delete Account</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Permanently delete your account and all associated data. This action is irreversible.</div>
              </div>
              <button
                style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", flexShrink: 0 }}
                onClick={() => showToast("Please contact support to delete your account.", "error")}
              >
                Delete Account
              </button>
            </div>
          </section>

        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 640px) {
          .settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
