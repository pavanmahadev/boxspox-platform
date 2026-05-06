"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";
import { CATEGORIES, slugifyCategory } from "./CourseSearch";

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

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "var(--text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "6px",
  display: "block",
};

interface CourseFormProps {
  initialData?: any;
  instructorId?: string;
}

export function CourseForm({ initialData, instructorId }: CourseFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "web-development",
    difficulty: initialData?.difficulty || "beginner",
    status: initialData?.status || "draft",
    icon: initialData?.icon || "📚",
    gradient: initialData?.gradient || "linear-gradient(135deg, #0F6E56 0%, #15B8A6 100%)",
    image_url: initialData?.image_url || "",
    duration: initialData?.duration || "",
    price: initialData?.price || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?.id) {
        const { error } = await supabase.from("courses").update(formData).eq("id", initialData.id);
        if (error) throw error;
        showToast("Course updated successfully!", "success");
        router.refresh();
      } else {
        const payload = instructorId ? { ...formData, instructor_id: instructorId } : formData;
        const { data, error } = await supabase.from("courses").insert([payload]).select().single();
        if (error) throw error;
        showToast("Course created! Now add modules & lessons.", "success");
        router.push(`${instructorId ? '/instructor/courses' : '/admin/courses'}/${data.id}`);
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const selectField = (
    label: string,
    key: keyof typeof formData,
    options: { value: string; label: string }[]
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={formData[key] as string}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        {options.map((o, i) => (
          <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 20px", background: "var(--bg-card)", borderRadius: "14px",
        border: "1px solid var(--border-primary)"
      }}>
        <Link href={instructorId ? "/instructor/courses" : "/admin/courses"} style={{
          color: "var(--text-tertiary)", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "14px"
        }}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => router.push(instructorId ? "/instructor/courses" : "/admin/courses")}
            style={{
              padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--border-primary)",
              background: "var(--bg-secondary)", fontWeight: 700, cursor: "pointer",
              fontSize: "14px", color: "var(--text-primary)"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: "var(--brand-primary)", color: "white", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "14px", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {loading ? "Saving..." : initialData ? "Save Changes" : "Create Course"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "24px" }}>
        {/* Main Details */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "20px",
          background: "var(--bg-card)", padding: "28px", borderRadius: "16px",
          border: "1px solid var(--border-primary)"
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Course Details</h2>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Title *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({
                ...formData,
                title: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
              })}
              placeholder="Enter course name"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>URL Slug *</label>
            <input
              required
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="course-slug"
              style={inputStyle}
            />
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              Preview: /tutorials/<strong>{formData.slug || "course-slug"}</strong>
            </span>
          </div>

          {/* Image URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Course overview and what students will learn..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            background: "var(--bg-card)", padding: "28px", borderRadius: "16px",
            border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "16px"
          }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>Settings</h2>

            {selectField("Status", "status", [
              { value: "draft", label: "📝 Draft (Private)" },
              { value: "published", label: "✅ Published (Public)" },
              { value: "archived", label: "📦 Archived" },
            ])}

            {selectField("Category", "category", [
              { value: "web-development", label: "Web Development" },
              { value: "mobile-apps", label: "Mobile Apps" },
              ...CATEGORIES.map(c => ({ value: slugifyCategory(c), label: c }))
            ])}

            {selectField("Difficulty", "difficulty", [
              { value: "beginner", label: "🟢 Beginner" },
              { value: "intermediate", label: "🟡 Intermediate" },
              { value: "advanced", label: "🔴 Advanced" },
            ])}

            {/* Duration */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 4 hours"
                style={inputStyle}
              />
            </div>

            {/* Price */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                step="0.01"
                style={inputStyle}
              />
            </div>

            {/* Icon */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Emoji Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                style={{ ...inputStyle, textAlign: "center", fontSize: "22px" }}
              />
            </div>

            {/* Gradient */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Color Gradient</label>
              <input
                type="text"
                value={formData.gradient}
                onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                placeholder="linear-gradient(...)"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div style={{
            background: "var(--bg-card)", padding: "20px", borderRadius: "16px",
            border: "1px solid var(--border-primary)"
          }}>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Live Preview</p>
            <div style={{
              height: "100px", borderRadius: "12px", background: formData.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "36px", border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}>
              {formData.icon}
            </div>
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                {formData.title || "Untitled Course"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                {formData.difficulty} · {formData.duration || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
