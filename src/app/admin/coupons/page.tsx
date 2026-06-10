"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tag, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  usage_limit: number | null;
  used_count: number;
  valid_until: string | null;
  created_at: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  // Form State
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(10);
  const [usageLimit, setUsageLimit] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching coupons:", error);
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCreating(true);
    setErrorMsg("");

    const payload = {
      code: newCode.toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      used_count: 0
    };

    const { error } = await supabase.from('coupons').insert([payload]);

    if (error) {
      if (error.code === '23505') { // Unique violation
        setErrorMsg("Coupon code already exists.");
      } else {
        setErrorMsg("Failed to create coupon.");
      }
    } else {
      setNewCode("");
      setDiscountValue(10);
      setUsageLimit("");
      fetchCoupons();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      await supabase.from('coupons').delete().eq('id', id);
      fetchCoupons();
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading coupons...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px", display: "grid", gridTemplateColumns: "1fr 350px", gap: "32px" }}>
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      {/* Left Column: Existing Coupons */}
      <div>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
            Promo Codes & Coupons
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>
            Manage active discounts, track redemptions, and generate new promotional campaigns.
          </p>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div 
                key={coupon.id} 
                style={{ 
                  background: "var(--bg-card)", 
                  padding: "20px", 
                  borderRadius: "16px", 
                  border: "1px solid var(--border-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 900, color: "var(--brand-primary)", letterSpacing: "1px", background: "rgba(15, 110, 86, 0.1)", padding: "4px 12px", borderRadius: "6px", fontFamily: "monospace" }}>
                      {coupon.code}
                    </h3>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-primary)" }}>
                      {coupon.discount_type === "PERCENTAGE" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "20px", color: "var(--text-tertiary)", fontSize: "13px", fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Tag size={14} /> Redemptions: {coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "(Unlimited)"}
                    </span>
                    {coupon.valid_until && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={14} /> Valid until: {new Date(coupon.valid_until).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                  title="Delete Coupon"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border-primary)", color: "var(--text-tertiary)" }}>
              No coupons found. Create one to get started!
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Create Form */}
      <div>
        <div style={{ position: "sticky", top: "100px", background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-primary)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={20} color="var(--brand-primary)" /> Generate New Code
          </h2>

          <form onSubmit={handleCreateCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {errorMsg && (
              <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} /> {errorMsg}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>Coupon Code</label>
              <input 
                type="text" 
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/[^A-Za-z0-9-_]/g, '').toUpperCase())}
                placeholder="e.g. SUMMER50" 
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontWeight: 700, fontFamily: "monospace" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>Type</label>
                <select 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontWeight: 600 }}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>Value</label>
                <input 
                  type="number" 
                  min="1"
                  max={discountType === "PERCENTAGE" ? "100" : "99999"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px" }}>Usage Limit (Optional)</label>
              <input 
                type="number" 
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited" 
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px", outline: "none", fontWeight: 500 }}
              />
            </div>

            <button 
              type="submit" 
              disabled={creating || !newCode}
              style={{ width: "100%", padding: "14px", borderRadius: "10px", background: "var(--brand-primary)", color: "white", border: "none", fontWeight: 800, fontSize: "15px", marginTop: "8px", cursor: creating || !newCode ? "not-allowed" : "pointer", opacity: creating || !newCode ? 0.7 : 1 }}
            >
              {creating ? "Generating..." : "Generate Code"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
