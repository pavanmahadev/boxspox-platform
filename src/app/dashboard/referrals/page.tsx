"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Copy, Users, Gift, CheckCircle2, Share2 } from "lucide-react";

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase.from('referrals').select('*').eq('referrer_id', user.id);
      
      // For demo purposes, if no data, let's just show an empty array
      setReferrals(data || []);
    }
    setLoading(false);
  };

  const referralLink = user ? `https://boxspox.in/register?ref=${user.id.substring(0, 8)}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading referrals...</div>;

  return (
    <div style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "16px" }}>
          Invite Friends, Get Rewarded
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Share your unique link. When friends enroll, you unlock free courses, premium memberships, and more.
        </p>
      </div>

      <div style={{ 
        background: "var(--bg-card)", 
        padding: "32px", 
        borderRadius: "20px", 
        border: "1px solid var(--border-primary)",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
        marginBottom: "40px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Your Referral Link</h3>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Share this link anywhere to get credit.</div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ 
              background: "rgba(15, 110, 86, 0.05)", 
              padding: "12px 20px", 
              borderRadius: "10px", 
              fontFamily: "monospace", 
              color: "var(--brand-primary)",
              fontWeight: 600,
              border: "1px solid rgba(15, 110, 86, 0.2)"
            }}>
              {referralLink}
            </div>
            <button 
              onClick={copyToClipboard}
              style={{
                background: "var(--brand-primary)",
                color: "white",
                border: "none",
                padding: "0 20px",
                borderRadius: "10px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "#1DA1F2", color: "white", border: "none", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
            <Share2 size={16} /> Share on Twitter
          </button>
          <button style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "#0A66C2", color: "white", border: "none", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
            <Share2 size={16} /> Share on LinkedIn
          </button>
          <button style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "#25D366", color: "white", border: "none", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
            <Share2 size={16} /> Share on WhatsApp
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "20px" }}>Rewards Progress</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { goal: 3, reward: "1 Free Course", current: referrals.length, icon: <Gift size={24} color="#F59E0B" /> },
            { goal: 10, reward: "Premium Membership", current: referrals.length, icon: <Users size={24} color="var(--brand-primary)" /> }
          ].map((milestone, i) => {
            const progress = Math.min(100, (milestone.current / milestone.goal) * 100);
            const isComplete = progress === 100;

            return (
              <div key={i} style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ background: isComplete ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 110, 86, 0.05)", padding: "12px", borderRadius: "12px" }}>
                      {isComplete ? <CheckCircle2 size={24} color="#10B981" /> : milestone.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "16px" }}>{milestone.reward}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Invite {milestone.goal} friends</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: isComplete ? "#10B981" : "var(--text-primary)" }}>
                    {milestone.current} / {milestone.goal}
                  </div>
                </div>
                
                <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", 
                    background: isComplete ? "#10B981" : "var(--brand-primary)", 
                    width: `${progress}%`,
                    transition: "width 1s ease-in-out" 
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
