"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone and will delete all associated modules and lessons.")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      showToast("Course deleted successfully", "success");
      router.refresh();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      style={{ padding: "8px", borderRadius: "6px", color: "#EF4444", background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
      title="Delete Course"
    >
      <Trash2 size={16} />
    </button>
  );
}
