import React from "react";
import { createClient } from "@/utils/supabase/server";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default async function AdminFinancePage() {
  const supabase = await createClient();

  // Fetch all purchases
  const { data: rawPurchases, error } = await supabase
    .from("user_purchases")
    .select("*")
    .order("purchased_at", { ascending: false });

  if (error) {
    console.error("Error fetching finance data:", error);
    return <div style={{ padding: "40px", color: "red" }}>Error loading finance data: {error.message || "Unknown error"}</div>;
  }

  // Fetch profiles separately since FK points to auth.users
  const userIds = Array.from(new Set(rawPurchases?.map((p: any) => p.user_id) || []));
  let profilesData: any[] = [];
  
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    if (profs) profilesData = profs;
  }

  const purchases = rawPurchases?.map((p: any) => ({
    ...p,
    profiles: profilesData.find((prof: any) => prof.id === p.user_id) || null
  })) || [];

  // Calculate Metrics
  const totalRevenue = purchases?.reduce((acc: number, p: any) => acc + (p.amount_paid || 0), 0) || 0;
  
  // Calculate this month's revenue
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthPurchases = purchases?.filter((p: any) => new Date(p.purchased_at) >= startOfMonth) || [];
  const mrr = thisMonthPurchases.reduce((acc: number, p: any) => acc + (p.amount_paid || 0), 0);
  
  const totalOrders = purchases?.length || 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, color: "#10b981" },
    { label: "Revenue This Month", value: `₹${mrr.toLocaleString('en-IN')}`, icon: <TrendingUp size={20} />, color: "#6366f1" },
    { label: "Total Transactions", value: totalOrders.toString(), icon: <CreditCard size={20} />, color: "#8b5cf6" },
    { label: "Avg. Order Value", value: `₹${averageOrderValue.toLocaleString('en-IN')}`, icon: <CheckCircle2 size={20} />, color: "#f59e0b" },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>
          Financial Overview
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>
          Track Razorpay revenue, analyze sales trends, and view transaction history.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ 
            background: "var(--bg-card)", 
            padding: "24px", 
            borderRadius: "16px", 
            border: "1px solid var(--border-primary)",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${stat.color}15`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
              <div style={{ color: "var(--text-tertiary)", fontWeight: 600, fontSize: "14px" }}>
                {stat.label}
              </div>
            </div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Recent Transactions</h2>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "var(--bg-secondary)" }}>
              <tr>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Transaction ID / Date</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Product</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "right" }}>Amount</th>
                <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases && purchases.length > 0 ? (
                purchases.map((purchase: any) => (
                  <tr key={purchase.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                        {purchase.order_id || `txn_${purchase.id.substring(0, 8)}`}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                        {new Date(purchase.purchased_at).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {purchase.profiles?.full_name || "Unknown User"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                        {purchase.profiles?.email || ""}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                        {purchase.product_type} - {purchase.product_id}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 800, color: "var(--text-primary)", fontSize: "15px" }}>
                      ₹{purchase.amount_paid.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <span style={{ background: "#ECFDF5", color: "#10B981", padding: "4px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: 700 }}>
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-tertiary)" }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
