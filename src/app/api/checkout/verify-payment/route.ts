import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      productType,
      amount,
      couponCode
    } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET as string;

    // Create signature to verify
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment is verified. Save to database.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { error: dbError } = await supabase
      .from('user_purchases')
      .insert({
        user_id: user.id,
        product_type: productType,
        product_id: productId,
        amount_paid: amount,
        order_id: razorpay_order_id
      });

    if (dbError) {
      console.error("Database error saving purchase:", dbError);
      return NextResponse.json({ error: "Payment verified but failed to grant access." }, { status: 500 });
    }

    // Process Coupon if provided
    if (couponCode) {
      try {
        const { data: coupon } = await supabase.from('coupons').select('id, used_count').ilike('code', couponCode).single();
        if (coupon) {
          await supabase.from('coupons').update({ used_count: (coupon.used_count || 0) + 1 }).eq('id', coupon.id);
        }
      } catch (err) {
        console.error("Failed to increment coupon:", err);
      }
    }

    // Process Referral
    try {
      const { data: pendingReferrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_email', user.email)
        .eq('status', 'PENDING');
      
      if (pendingReferrals && pendingReferrals.length > 0) {
        // Mark as completed
        await supabase
          .from('referrals')
          .update({ status: 'COMPLETED' })
          .eq('referred_email', user.email)
          .eq('status', 'PENDING');
      }
    } catch (err) {
      console.error("Failed to process referral:", err);
    }

    // Fire Discord Webhook
    try {
      const { sendDiscordNotification } = await import('@/utils/discord');
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      
      const buyerName = profile?.full_name || user.email?.split('@')[0] || "A Student";
      
      await sendDiscordNotification(`🎉 **Ka-ching! New Sale!**`, {
        title: "New Course Enrollment",
        description: `${buyerName} just purchased a new Pandaschool product!`,
        color: 0x10B981, // Success Green
        fields: [
          { name: "Product Type", value: productType || "Course", inline: true },
          { name: "Amount", value: `₹${amount.toLocaleString('en-IN')}`, inline: true }
        ]
      });
    } catch (discordErr) {
      console.error("Failed to fire discord webhook:", discordErr);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
