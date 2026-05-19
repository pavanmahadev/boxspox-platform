"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("articles").delete().eq("id", articleId);
      if (error) throw error;
      showToast("Article deleted successfully", "success");
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
      title="Delete Article"
    >
      <Trash2 size={16} />
    </button>
  );
}
