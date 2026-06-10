"use client";

import React, { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, CreditCard, Lock } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const productId = searchParams.get('product') || 'BUNDLE';
  const price = Number(searchParams.get('price') || 2999);
  const title = searchParams.get('title') || 'Boxspox Premium Bundle';
  const finalPrice = Math.max(0, price - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const discountValue = data.coupon.discount_value;
      if (data.coupon.discount_type === 'PERCENTAGE') {
        setDiscountAmount(price * (discountValue / 100));
      } else {
        setDiscountAmount(discountValue);
      }
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon");
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create order on our backend
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          couponCode: couponCode || null, 
          productId, 
          productType: productId === 'SINGLE' ? 'SINGLE' : productId === 'LIFETIME' ? 'LIFETIME' : 'BUNDLE' 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SxzOxqka39bdQT", // Public key fallback
        amount: data.order.amount,
        currency: "INR",
        name: "Boxspox",
        description: title,
        order_id: data.order.id,
        handler: async function (response: any) {
          // 3. Verify payment on backend
          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              productId,
              productType: productId === 'SINGLE' ? 'SINGLE' : productId === 'LIFETIME' ? 'LIFETIME' : 'BUNDLE',
              amount: finalPrice,
              couponCode: couponCode || null
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            router.push('/dashboard?success=true');
          } else {
            setError(verifyData.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#0F6E56"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        setError(response.error.description || "Payment failed");
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div style={{ background: "var(--bg-primary)", width: "100%", maxWidth: "900px", borderRadius: "24px", overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)" }}>
        
        {/* Left Side - Order Summary */}
        <div style={{ background: "var(--bg-card)", padding: "40px", borderRight: "1px solid var(--border-primary)" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "8px" }}>Order Summary</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px" }}>Review your order details before payment.</p>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-primary)" }}>
            <div>
              <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "18px", marginBottom: "4px" }}>{title}</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>Lifetime Access</div>
            </div>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "18px" }}>
              ₹{price.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Subtotal</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "15px" }}>₹{price.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ color: "var(--brand-primary)", fontSize: "15px", fontWeight: 600 }}>Discount Applied</div>
            <div style={{ fontWeight: 600, color: "var(--brand-primary)", fontSize: "15px" }}>-₹{discountAmount.toLocaleString('en-IN')}</div>
          </div>

          {/* Coupon Input Area */}
          <div style={{ marginBottom: "24px", display: "flex", gap: "8px" }}>
            <input 
              type="text" 
              placeholder="Promo Code" 
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--border-primary)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
            <button 
              onClick={handleApplyCoupon}
              disabled={applyingCoupon || !couponCode}
              style={{
                padding: "0 16px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: applyingCoupon ? "not-allowed" : "pointer"
              }}
            >
              {applyingCoupon ? "..." : "Apply"}
            </button>
          </div>
          {couponError && <div style={{ color: "#EF4444", fontSize: "13px", marginTop: "-16px", marginBottom: "24px" }}>{couponError}</div>}
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "24px", borderTop: "1px dashed var(--border-primary)" }}>
            <div style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 800 }}>Total</div>
            <div style={{ fontWeight: 900, color: "var(--text-primary)", fontSize: "28px" }}>₹{finalPrice.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Right Side - Payment */}
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", background: "rgba(15, 110, 86, 0.1)", borderRadius: "50%", marginBottom: "16px" }}>
              <Lock size={24} color="var(--brand-primary)" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>Secure Checkout</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Your payment information is encrypted and secure.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
              <CheckCircle2 size={16} color="var(--brand-primary)" /> 30-Day Money-Back Guarantee
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
              <CheckCircle2 size={16} color="var(--brand-primary)" /> Instant Access to Course Material
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>
              <CheckCircle2 size={16} color="var(--brand-primary)" /> 24/7 Dedicated Support
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, marginBottom: "24px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button 
            onClick={handlePayment} 
            disabled={loading}
            style={{ 
              background: "var(--text-primary)", 
              color: "var(--bg-primary)", 
              padding: "16px", 
              borderRadius: "12px", 
              fontWeight: 800, 
              fontSize: "16px", 
              border: "none", 
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1,
              transition: "transform 0.1s"
            }}
          >
            {loading ? "Processing..." : (
              <>
                <CreditCard size={20} />
                Pay ₹{finalPrice.toLocaleString('en-IN')}
              </>
            )}
          </button>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", color: "var(--text-tertiary)", fontSize: "12px", fontWeight: 600 }}>
            <ShieldCheck size={14} /> Payments processed securely by Razorpay
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px", textAlign: "center" }}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
