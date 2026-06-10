import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { productId, productType, couponCode } = await request.json();

    if (!productId || !productType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Optional: Validate the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to purchase.' },
        { status: 401 }
      );
    }

    // 1. Determine Base Price based on Active Sales
    let saleMode = 'NONE';
    const { data: activeSale } = await supabase
      .from('sales_events')
      .select('type')
      .eq('is_active', true)
      .single();
    
    if (activeSale) {
      saleMode = activeSale.type;
    }

    let basePrice = 0;
    if (productType === 'SINGLE') {
      basePrice = saleMode === 'BLACK_FRIDAY' ? 299 : saleMode === 'FESTIVAL' ? 499 : 999;
    } else if (productType === 'BUNDLE') {
      basePrice = saleMode === 'BLACK_FRIDAY' ? 999 : saleMode === 'FESTIVAL' ? 1499 : 2999;
    } else if (productType === 'LIFETIME') {
      basePrice = saleMode === 'BLACK_FRIDAY' ? 4999 : saleMode === 'FESTIVAL' ? 6999 : 9999;
    }

    // 2. Apply Coupon if provided
    let finalAmount = basePrice;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', couponCode)
        .single();
      
      if (coupon) {
        // Basic validation (assume frontend checked expiry/limits, but server should double check)
        const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
        const limitReached = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
        
        if (!isExpired && !limitReached) {
          if (coupon.discount_type === 'PERCENTAGE') {
            finalAmount = Math.max(0, basePrice - (basePrice * (coupon.discount_value / 100)));
          } else {
            finalAmount = Math.max(0, basePrice - coupon.discount_value);
          }
        }
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    // Create an order
    const options = {
      amount: Math.round(finalAmount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `rcpt_${Math.floor(Math.random() * 10000)}`,
      notes: {
        userId: user.id,
        productId,
        productType,
        couponCode: couponCode || ''
      }
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating order' },
      { status: 500 }
    );
  }
}
