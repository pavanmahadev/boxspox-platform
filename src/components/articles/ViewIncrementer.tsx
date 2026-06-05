"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface ViewIncrementerProps {
  articleId: string;
}

export function ViewIncrementer({ articleId }: ViewIncrementerProps) {
  useEffect(() => {
    const incrementView = async () => {
      const supabase = createClient();
      try {
        await supabase.rpc("increment_article_views", { article_id: articleId });
      } catch (err) {
        console.warn("RPC view increment failed, falling back to manual update:", err);
        // Fallback: manually fetch and update view count
        try {
          const { data } = await supabase
            .from("articles")
            .select("view_count")
            .eq("id", articleId)
            .single();
          
          if (data) {
            await supabase
              .from("articles")
              .update({ view_count: (data.view_count || 0) + 1 })
              .eq("id", articleId);
          }
        } catch (fallbackErr) {
          console.error("View increment fallback failed:", fallbackErr);
        }
      }
    };

    incrementView();
  }, [articleId]);

  return null;
}
