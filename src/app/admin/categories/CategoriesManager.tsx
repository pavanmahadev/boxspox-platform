"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { Plus, Edit2, Trash2, Save, X, GripVertical, BookOpen, Loader2, Globe } from "lucide-react";
import { DOMAIN_GROUPS, slugifyCategory } from "@/utils/domains";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order_index: number;
  courseCount: number;
}

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border-primary)",
  fontSize: "14px",
  outline: "none",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  width: "100%",
  fontWeight: 500,
};

const PRESET_DOMAINS = Object.entries(DOMAIN_GROUPS).map(([label, _]) => {
  const icon = label.split(" ")[0];
  const name = label.replace(icon + " ", "");
  const slug = slugifyCategory(name);
  const colorMap: Record<string, string> = {
    "Technology": "linear-gradient(135deg, #0F6E56 0%, #15B8A6 100%)",
    "AI & Data Science": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    "MBA & Business": "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    "Law & Legal": "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
    "Agriculture": "linear-gradient(135deg, #15803D 0%, #84CC16 100%)",
    "Healthcare": "linear-gradient(135deg, #BE123C 0%, #FB7185 100%)",
    "Engineering": "linear-gradient(135deg, #374151 0%, #6B7280 100%)",
    "Design & Creative": "linear-gradient(135deg, #EC4899 0%, #F97316 100%)",
  };
  return { icon, name, slug, color: colorMap[name] || "linear-gradient(135deg, #374151, #111827)", description: "" };
});

export default function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "seed">("manage");
  const [seedingCourses, setSeedingCourses] = useState(false);

  const handleSeedCourses = async () => {
    setSeedingCourses(true);
    try {
      const res = await fetch("/api/seed-courses", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed courses");
      showToast(data.message, "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSeedingCourses(false);
    }
  };

  const openNew = () => {
    setEditing({ name: "", slug: "", description: "", icon: "📚", color: "linear-gradient(135deg, #0F6E56, #15B8A6)", order_index: categories.length });
    setIsNew(true);
  };

  const openEdit = (cat: Category) => {
    setEditing({ ...cat });
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.slug) return showToast("Name and slug are required.", "error");
    setSaving(true);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("categories")
          .insert([{ name: editing.name, slug: editing.slug, description: editing.description, icon: editing.icon, color: editing.color, order_index: editing.order_index || 0 }])
          .select()
          .single();
        if (error) throw error;
        setCategories(prev => [...prev, { ...data, courseCount: 0 }]);
        showToast("Category created!", "success");
      } else {
        const { error } = await supabase
          .from("categories")
          .update({ name: editing.name, slug: editing.slug, description: editing.description, icon: editing.icon, color: editing.color })
          .eq("id", editing.id);
        if (error) throw error;
        setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...editing } as Category : c));
        showToast("Category updated!", "success");
      }
      setEditing(null);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Courses using this category won't be affected.")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast("Category deleted.", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleSeedDomain = async (domain: typeof PRESET_DOMAINS[number]) => {
    // Check if already exists
    const exists = categories.find(c => c.slug === domain.slug);
    if (exists) return showToast(`"${domain.name}" already exists.`, "info");

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: domain.name, slug: domain.slug, description: domain.description, icon: domain.icon, color: domain.color, order_index: categories.length }])
        .select()
        .single();
      if (error) throw error;
      setCategories(prev => [...prev, { ...data, courseCount: 0 }]);
      showToast(`"${domain.name}" added!`, "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSeedAll = async () => {
    let count = 0;
    for (const domain of PRESET_DOMAINS) {
      const exists = categories.find(c => c.slug === domain.slug);
      if (exists) continue;
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: domain.name, slug: domain.slug, description: domain.description, icon: domain.icon, color: domain.color, order_index: categories.length + count }])
        .select()
        .single();
      if (!error && data) {
        setCategories(prev => [...prev, { ...data, courseCount: 0 }]);
        count++;
      }
    }
    showToast(count > 0 ? `Seeded ${count} new domains!` : "All domains already exist.", count > 0 ? "success" : "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "4px" }}>
            🗂️ Domain Categories
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Manage learning domains — Technology, MBA, Law, Agriculture, and more.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleSeedCourses}
            disabled={seedingCourses}
            style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #10B981", background: seedingCourses ? "#d1fae5" : "#ecfdf5", color: "#065f46", fontWeight: 700, cursor: seedingCourses ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", opacity: seedingCourses ? 0.7 : 1 }}
          >
            {seedingCourses ? <Loader2 size={16} className="animate-spin" /> : "📚"} {seedingCourses ? "Seeding..." : "Seed Courses"}
          </button>
          <button
            onClick={() => setActiveTab(activeTab === "manage" ? "seed" : "manage")}
            style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-card)", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}
          >
            <Globe size={16} /> {activeTab === "manage" ? "Seed Domains" : "Manage"}
          </button>
          <button
            onClick={openNew}
            style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}
          >
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Domains", value: categories.length, icon: "🗂️" },
          { label: "Total Courses", value: categories.reduce((sum, c) => sum + (c.courseCount || 0), 0), icon: "📚" },
          { label: "Active Domains", value: PRESET_DOMAINS.filter(d => categories.find(c => c.slug === d.slug)).length, icon: "✅" },
          { label: "Available to Seed", value: PRESET_DOMAINS.filter(d => !categories.find(c => c.slug === d.slug)).length, icon: "🌱" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)" }}>{stat.value}</div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {activeTab === "seed" ? (
        /* Seed Domains Tab */
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800 }}>Preset Domain Library</h2>
            <button onClick={handleSeedAll} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#10B981", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
              🌱 Seed All Missing
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {PRESET_DOMAINS.map(domain => {
              const exists = !!categories.find(c => c.slug === domain.slug);
              return (
                <div key={domain.slug} style={{ background: "var(--bg-card)", border: `2px solid ${exists ? "var(--brand-primary)" : "var(--border-primary)"}`, borderRadius: "16px", overflow: "hidden" }}>
                  <div style={{ height: "80px", background: domain.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
                    {domain.icon}
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 800, fontSize: "15px" }}>{domain.name}</span>
                      {exists && <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-primary)", background: "rgba(15,110,86,0.1)", padding: "3px 10px", borderRadius: "20px" }}>Added ✓</span>}
                    </div>
                    <code style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "monospace" }}>/learn/{domain.slug}</code>
                    {!exists && (
                      <button
                        onClick={() => handleSeedDomain(domain)}
                        style={{ marginTop: "12px", width: "100%", padding: "8px", borderRadius: "8px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                      >
                        + Add Domain
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Manage Tab */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {categories.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 20px", color: "var(--text-tertiary)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗂️</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>No Categories Yet</h3>
              <p style={{ marginBottom: "24px" }}>Switch to "Seed Domains" to add preset domains, or create a custom one.</p>
              <button onClick={openNew} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                + Create Category
              </button>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "20px", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              >
                <div style={{ height: "100px", background: cat.color || "linear-gradient(135deg, #374151, #111827)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
                  {cat.icon || "📚"}
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary)" }}>{cat.name}</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openEdit(cat)} style={{ background: "var(--bg-tertiary)", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex" }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id} style={{ background: "#FEF2F2", border: "none", color: "#EF4444", cursor: "pointer", padding: "6px", borderRadius: "8px", display: "flex" }}>
                        {deleting === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                  {cat.description && <p style={{ fontSize: "13px", color: "var(--text-tertiary)", marginBottom: "12px", lineHeight: 1.5 }}>{cat.description}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <code style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "monospace", background: "var(--bg-secondary)", padding: "3px 8px", borderRadius: "6px" }}>
                      /learn/{cat.slug}
                    </code>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                      <BookOpen size={12} /> {cat.courseCount} courses
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "var(--bg-card)", padding: "36px", borderRadius: "24px", width: "520px", maxWidth: "95%", border: "1px solid var(--border-primary)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 900 }}>{isNew ? "Create Category" : "Edit Category"}</h2>
              <button onClick={() => setEditing(null)} style={{ background: "var(--bg-tertiary)", border: "none", cursor: "pointer", padding: "8px", borderRadius: "10px", color: "var(--text-secondary)", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            {/* Live Preview */}
            <div style={{ height: "80px", background: editing.color || "linear-gradient(135deg, #374151, #111827)", borderRadius: "16px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
              {editing.icon || "📚"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>Name *</label>
                  <input
                    value={editing.name || ""}
                    onChange={e => setEditing({ ...editing, name: e.target.value, slug: e.target.value ? slugifyCategory(e.target.value) : editing.slug })}
                    style={inputStyle}
                    placeholder="e.g. MBA & Business"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>Icon</label>
                  <input
                    value={editing.icon || ""}
                    onChange={e => setEditing({ ...editing, icon: e.target.value })}
                    style={{ ...inputStyle, textAlign: "center", fontSize: "24px" }}
                    placeholder="📚"
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>URL Slug *</label>
                <input
                  value={editing.slug || ""}
                  onChange={e => setEditing({ ...editing, slug: e.target.value })}
                  style={inputStyle}
                  placeholder="mba-business"
                />
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px", display: "block" }}>
                  URL: /learn/<strong>{editing.slug || "slug"}</strong>
                </span>
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>Description</label>
                <textarea
                  rows={2}
                  value={editing.description || ""}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Short description of this learning domain..."
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "block" }}>Gradient Color</label>
                <input
                  value={editing.color || ""}
                  onChange={e => setEditing({ ...editing, color: e.target.value })}
                  style={inputStyle}
                  placeholder="linear-gradient(135deg, #0F6E56 0%, #15B8A6 100%)"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: "12px", border: "none", background: "var(--brand-primary)", color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : isNew ? "Create Category" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
