import React from "react";
import { Users, Search, Filter, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { UserActions } from "@/components/admin/UserActions";
import Link from "next/link";

interface AdminUsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    role?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { q: search, page: pageStr, role } = await searchParams;
  const page = parseInt(pageStr || "1");
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = await createClient();
  
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (role) {
    query = query.eq("role", role);
  }

  const { data: profiles, count } = await query
    .order("created_at", { ascending: false })
    .range(start, end);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
            User Management
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>Manage permissions and monitor student activity across the platform.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
        <form style={{ flex: 1, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input 
            name="q"
            defaultValue={search}
            placeholder="Search by name or email..." 
            style={{ 
              width: "100%", 
              padding: "14px 14px 14px 48px", 
              borderRadius: "14px", 
              border: "1px solid var(--border-primary)", 
              background: "var(--bg-card)",
              fontSize: "14px",
              outline: "none",
              fontWeight: 500,
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }} 
          />
        </form>
        <div style={{ display: "flex", gap: "8px" }}>
          {["admin", "instructor", "student"].map((r) => (
            <Link 
              key={r}
              href={`/admin/users?role=${r}${search ? `&q=${search}` : ""}`}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: role === r ? "var(--brand-primary)" : "var(--bg-card)",
                color: role === r ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border-primary)",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                textTransform: "capitalize",
                transition: "all 0.2s"
              }}
            >
              {r}s
            </Link>
          ))}
          {(role || search) && (
            <Link 
              href="/admin/users"
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border-primary)",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              Reset
            </Link>
          )}
        </div>
      </div>

      <div style={{ 
        background: "var(--bg-card)", 
        borderRadius: "20px", 
        border: "1px solid var(--border-primary)", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, textAlign: "left" }}>
          <thead style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
            <tr>
              <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", borderTopLeftRadius: "20px" }}>User Profile</th>
              <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px" }}>System Role</th>
              <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px" }}>Joined Date</th>
              <th style={{ padding: "18px 24px", fontSize: "11px", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", textAlign: "right", borderTopRightRadius: "20px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px", fontWeight: 500 }}>
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              profiles?.map((profile) => (
                <tr key={profile.id} style={{ borderBottom: "1px solid var(--border-primary)", transition: "background 0.2s" }}>
                  <td style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "12px", 
                        background: "var(--bg-tertiary)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: "14px", 
                        fontWeight: 800,
                        color: "var(--brand-primary)",
                        border: "1px solid var(--border-primary)"
                      }}>
                        {(profile.full_name || profile.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2px" }}>{profile.full_name || "Anonymous User"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 500 }}>{profile.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "18px 24px" }}>
                    <span style={{ 
                      padding: "6px 10px", 
                      borderRadius: "8px", 
                      background: profile.role === "admin" ? "#EEF2FF" : profile.role === "instructor" ? "#ECFDF5" : "#F9FAFB", 
                      fontSize: "11px", 
                      fontWeight: 800, 
                      color: profile.role === "admin" ? "#4F46E5" : profile.role === "instructor" ? "#10B981" : "#6B7280",
                      textTransform: "uppercase",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      border: `1px solid ${profile.role === "admin" ? "#C7D2FE" : profile.role === "instructor" ? "#A7F3D0" : "var(--border-primary)"}`
                    }}>
                      {profile.role === "admin" && <Shield size={12} />}
                      {profile.role}
                    </span>
                  </td>
                  <td style={{ padding: "18px 24px", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 500 }}>
                    {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: "18px 24px", textAlign: "right" }}>
                    <UserActions profile={profile} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "20px 24px", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 500 }}>
              Showing page {page} of {totalPages}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link 
                href={`/admin/users?page=${page - 1}${search ? `&q=${search}` : ""}${role ? `&role=${role}` : ""}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  color: page === 1 ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: page === 1 ? "none" : "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ChevronLeft size={16} /> Prev
              </Link>
              <Link 
                href={`/admin/users?page=${page + 1}${search ? `&q=${search}` : ""}${role ? `&role=${role}` : ""}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--bg-card)",
                  color: page === totalPages ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  pointerEvents: page === totalPages ? "none" : "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Next <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

