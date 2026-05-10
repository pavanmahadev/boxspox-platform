import { createClient } from "@/utils/supabase/server";

export default async function AIUsagePage() {
  const supabase = await createClient();
  
  const { data: usage } = await supabase
    .from("ai_usage")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .order("created_at", { ascending: false });

  // Calculate totals
  const totalTokens = usage?.reduce((acc: any, curr: any) => acc + curr.total_tokens, 0) || 0;
  const totalRequests = usage?.length || 0;

  // Calculate today's usage
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayUsage = usage?.filter((item: any) => new Date(item.created_at) >= today) || [];
  const todayTokens = todayUsage.reduce((acc: any, curr: any) => acc + curr.total_tokens, 0);
  
  const DAILY_LIMIT = 100000;
  const percentage = Math.min((todayTokens / DAILY_LIMIT) * 100, 100);

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "24px", fontFamily: "var(--font-heading)" }}>AI Usage Tracking</h1>
      
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "var(--bg-card)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Total Requests</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{totalRequests}</div>
        </div>
        <div style={{ background: "var(--bg-card)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Total Tokens Used</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--brand-primary)" }}>{totalTokens.toLocaleString()}</div>
        </div>
      </div>

      {/* Daily Limit Progress Bar */}
      <div style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-primary)", marginBottom: "32px" }}>
        <div className="flex-responsive" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>Daily Usage Limit</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Resets at midnight</div>
          </div>
          <div style={{ textAlign: "right" }} className="text-left-mobile">
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>{todayTokens.toLocaleString()} / {DAILY_LIMIT.toLocaleString()}</div>
            <div style={{ fontSize: "0.8rem", color: percentage > 80 ? "#EF4444" : "var(--text-tertiary)", fontWeight: 600 }}>
              {percentage.toFixed(1)}% used
            </div>
          </div>
        </div>
        <div style={{ width: "100%", height: "12px", background: "var(--bg-secondary)", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ 
            width: `${percentage}%`, 
            height: "100%", 
            background: percentage > 80 ? "#EF4444" : "var(--brand-primary)", 
            borderRadius: "6px", 
            transition: "width 0.3s ease" 
          }}></div>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "8px" }}>
          This is a custom limit set in the app. Groq's actual limit is usually higher.
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-primary)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-primary)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>User</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Feature</th>
                <th className="hide-mobile" style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Model</th>
                <th className="hide-mobile" style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Prompt</th>
                <th className="hide-mobile" style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Comp.</th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Total</th>
                <th className="hide-tablet" style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {usage?.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.profiles?.full_name || "Unknown"}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{item.profiles?.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "4px", background: "var(--bg-secondary)", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {item.feature}
                    </span>
                  </td>
                  <td className="hide-mobile" style={{ padding: "12px 16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{item.model}</td>
                  <td className="hide-mobile" style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{item.prompt_tokens}</td>
                  <td className="hide-mobile" style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{item.completion_tokens}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.total_tokens}</td>
                  <td className="hide-tablet" style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!usage || usage.length === 0) && (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--text-tertiary)" }}>
                    No usage data recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .flex-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .text-left-mobile {
            text-align: left !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
        @media (max-width: 1024px) {
          .hide-tablet {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
