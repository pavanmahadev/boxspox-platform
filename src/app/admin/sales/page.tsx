"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tag, AlertCircle, Save, Clock } from "lucide-react";

interface SalesEvent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<SalesEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase.from('sales_events').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      // If table is empty, seed it for demo purposes
      if (data.length === 0) {
        seedSales();
      } else {
        setSales(data);
      }
    }
    setLoading(false);
  };

  const seedSales = async () => {
    const initialSales = [
      { name: "Standard Promo", type: "PROMO", is_active: true },
      { name: "Diwali Special", type: "FESTIVAL", is_active: false },
      { name: "Black Friday Mega Sale", type: "BLACK_FRIDAY", is_active: false },
    ];
    await supabase.from('sales_events').insert(initialSales);
    fetchSales();
  };

  const toggleSale = async (id: string) => {
    setSaving(true);
    // Deactivate all others first to ensure only one is active
    await supabase.from('sales_events').update({ is_active: false }).neq('id', id);
    
    // Activate the selected one
    await supabase.from('sales_events').update({ is_active: true }).eq('id', id);
    
    await fetchSales();
    setSaving(false);
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading sales data...</div>;

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
          Sales & Pricing Controls
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
          Manage global pricing modes. Activating a sale here will instantly update pricing and UI across the entire website for all users.
        </p>
      </div>

      <div style={{ display: "grid", gap: "24px" }}>
        {sales.map((sale) => (
          <div 
            key={sale.id} 
            style={{ 
              background: sale.is_active ? "rgba(15, 110, 86, 0.05)" : "var(--bg-card)", 
              border: `2px solid ${sale.is_active ? "var(--brand-primary)" : "var(--border-primary)"}`,
              padding: "24px", 
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <Tag size={20} color={sale.is_active ? "var(--brand-primary)" : "var(--text-secondary)"} />
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>{sale.name}</h3>
                <span style={{ 
                  background: sale.is_active ? "var(--brand-primary)" : "#E5E7EB", 
                  color: sale.is_active ? "white" : "black", 
                  padding: "4px 12px", 
                  borderRadius: "50px", 
                  fontSize: "12px", 
                  fontWeight: 700 
                }}>
                  {sale.is_active ? "ACTIVE NOW" : "INACTIVE"}
                </span>
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "14px", display: "flex", gap: "24px" }}>
                <span>Type: <strong>{sale.type}</strong></span>
                {sale.ends_at && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> Ends: {new Date(sale.ends_at).toLocaleString()}</span>}
              </div>
            </div>

            <button
              onClick={() => toggleSale(sale.id)}
              disabled={sale.is_active || saving}
              style={{
                background: sale.is_active ? "#E5E7EB" : "var(--text-primary)",
                color: sale.is_active ? "var(--text-tertiary)" : "var(--bg-primary)",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 800,
                border: "none",
                cursor: sale.is_active ? "default" : "pointer",
                opacity: saving ? 0.7 : 1
              }}
            >
              {sale.is_active ? "Currently Active" : "Activate Sale"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "40px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "20px", borderRadius: "12px", display: "flex", gap: "16px" }}>
        <AlertCircle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ color: "#EF4444", fontWeight: 800, marginBottom: "4px" }}>Warning: Immediate Effect</h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Changing the active sale will immediately drop or raise prices for all users currently on the website. Ensure you have communicated the sale properly before activating Black Friday mode.
          </p>
        </div>
      </div>
    </div>
  );
}
