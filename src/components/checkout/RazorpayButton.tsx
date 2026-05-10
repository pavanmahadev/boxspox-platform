"use client";

import React, { useState } from "react";
import { createRazorpayOrder, verifyRazorpayPayment, simulatePurchase } from "@/app/checkout/[id]/actions";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { MoveRight, Loader2 } from "lucide-react";

interface RazorpayButtonProps {
  courseId: string;
}

export default function RazorpayButton({ courseId }: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const result = await createRazorpayOrder(courseId);

      if (!result.success) {
        alert(result.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // Handle fallback to simulation mode
      if ((result as any).mock) {
        console.log("[Razorpay] Mock mode detected, simulating purchase...");
        const verification = await simulatePurchase(courseId);
        if (verification.success) {
          router.push(`/tutorials/${verification.slug}/exam`);
        } else {
          alert("Simulation failed");
          setLoading(false);
        }
        return;
      }

      const { order, keyId, user, course } = result;
      
      if (!order) {
        alert("Order data missing");
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Boxspox",
        description: course?.description || "Course Payment",
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#0f6e56", // Brand color
        },
        handler: async function (response: any) {
          setLoading(true);
          const verification = await verifyRazorpayPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            courseId
          );

          if (verification.success) {
            router.push(`/tutorials/${verification.slug}/exam`);
          } else {
            alert(verification.error || "Payment verification failed");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred during payment");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: "100%",
          background: "var(--brand-primary)",
          color: "white",
          padding: "18px",
          borderRadius: "16px",
          border: "none",
          fontSize: "16px",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          transition: "transform 0.2s",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            Pay & Unlock Exam <MoveRight size={20} />
          </>
        )}
      </button>
    </>
  );
}
