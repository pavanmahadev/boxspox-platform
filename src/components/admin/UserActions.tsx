"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { Shield, ShieldAlert, ShieldCheck, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { deleteUser, updateUserRole } from "@/app/admin/users/actions";

interface UserActionsProps {
  profile: any;
}

export function UserActions({ profile }: UserActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === profile.role) {
      setShowMenu(false);
      return;
    }
    
    setLoading(true);
    const result = await updateUserRole(profile.id, newRole);
    
    if (result.success) {
      showToast(`Role updated to ${newRole}`, "success");
    } else {
      showToast(result.error || "Failed to update role", "error");
    }
    
    setLoading(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${profile.full_name || profile.email}? This action cannot be undone and will delete their authentication account.`)) return;
    
    setLoading(true);
    const result = await deleteUser(profile.id);
    
    if (result.success) {
      showToast("User deleted successfully", "success");
    } else {
      showToast(result.error || "Failed to delete user. Check if SUPABASE_SERVICE_ROLE_KEY is set.", "error");
    }
    
    setLoading(false);
    setShowMenu(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={menuRef}>
      <button 
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        style={{ 
          padding: "8px", 
          borderRadius: "8px", 
          background: showMenu ? "var(--bg-tertiary)" : "none", 
          border: "none", 
          cursor: "pointer", 
          color: "var(--text-tertiary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s"
        }}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <MoreVertical size={18} />}
      </button>

      {showMenu && (
        <div style={{ 
          position: "absolute", 
          right: 0, 
          top: "calc(100% + 4px)", 
          background: "var(--bg-card)", 
          border: "1px solid var(--border-primary)", 
          borderRadius: "12px", 
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", 
          zIndex: 100,
          minWidth: "180px",
          padding: "6px",
          animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-tertiary)", padding: "8px 12px", textTransform: "uppercase", letterSpacing: "1px" }}>Manage User</div>
          
          <button 
            onClick={() => handleRoleChange("student")}
            style={{ 
              width: "100%", 
              textAlign: "left", 
              padding: "10px 12px", 
              border: "none", 
              background: profile.role === "student" ? "var(--bg-tertiary)" : "none", 
              borderRadius: "8px",
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              fontSize: "13px", 
              fontWeight: 600, 
              color: profile.role === "student" ? "var(--brand-primary)" : "var(--text-secondary)" 
            }}
          >
            <Shield size={16} /> Student {profile.role === "student" && "✓"}
          </button>
          
          <button 
            onClick={() => handleRoleChange("instructor")}
            style={{ 
              width: "100%", 
              textAlign: "left", 
              padding: "10px 12px", 
              border: "none", 
              background: profile.role === "instructor" ? "var(--bg-tertiary)" : "none", 
              borderRadius: "8px",
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              fontSize: "13px", 
              fontWeight: 600, 
              color: profile.role === "instructor" ? "var(--brand-primary)" : "var(--text-secondary)" 
            }}
          >
            <ShieldCheck size={16} /> Instructor {profile.role === "instructor" && "✓"}
          </button>
          
          <button 
            onClick={() => handleRoleChange("admin")}
            style={{ 
              width: "100%", 
              textAlign: "left", 
              padding: "10px 12px", 
              border: "none", 
              background: profile.role === "admin" ? "var(--bg-tertiary)" : "none", 
              borderRadius: "8px",
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              fontSize: "13px", 
              fontWeight: 600, 
              color: profile.role === "admin" ? "var(--brand-primary)" : "var(--text-secondary)" 
            }}
          >
            <ShieldAlert size={16} /> Admin {profile.role === "admin" && "✓"}
          </button>
          
          <div style={{ height: "1px", background: "var(--border-primary)", margin: "6px 0" }} />
          
          <button 
            onClick={handleDelete}
            style={{ 
              width: "100%", 
              textAlign: "left", 
              padding: "10px 12px", 
              border: "none", 
              background: "none", 
              borderRadius: "8px",
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#EF4444" 
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

