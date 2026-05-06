"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  courseId: string;
  currentUserId: string;
}

export default function WishlistButton({ courseId, currentUserId }: WishlistButtonProps) {
  const supabase = createClient();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkWishlist() {
    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", currentUserId)
      .eq("course_id", courseId)
      .maybeSingle();
    setWishlisted(!!data);
    setLoading(false);
  }

  useEffect(() => { checkWishlist(); }, [courseId]);

  async function toggleWishlist() {
    setLoading(true);
    if (wishlisted) {
      await supabase.from("wishlists").delete().eq("user_id", currentUserId).eq("course_id", courseId);
      setWishlisted(false);
    } else {
      await supabase.from("wishlists").insert({ user_id: currentUserId, course_id: courseId });
      setWishlisted(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      style={{
        background: wishlisted ? "rgba(239, 68, 68, 0.08)" : "var(--bg-secondary)",
        border: `1px solid ${wishlisted ? "rgba(239, 68, 68, 0.3)" : "var(--border-primary)"}`,
        borderRadius: "10px",
        padding: "10px 16px",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s",
        fontWeight: 700,
        fontSize: "0.9rem",
        color: wishlisted ? "#ef4444" : "var(--text-secondary)",
        opacity: loading ? 0.7 : 1
      }}
    >
      <Heart
        size={18}
        fill={wishlisted ? "#ef4444" : "none"}
        stroke={wishlisted ? "#ef4444" : "currentColor"}
        style={{ transition: "all 0.2s" }}
      />
      {wishlisted ? "Saved" : "Save"}
    </button>
  );
}
