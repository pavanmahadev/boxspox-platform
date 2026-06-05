import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const amountPaid = payment.amount / 100; // Razorpay returns paise
      
      // The notes object contains metadata we passed during create-order
      const userId = payment.notes?.userId;
      const productId = payment.notes?.productId;
      const productType = payment.notes?.productType;

      if (userId && productId && productType) {
        const supabase = await createClient();

        // Check if purchase already exists (in case client-side verification already succeeded)
        const { data: existingPurchase } = await supabase
          .from('user_purchases')
          .select('id')
          .eq('order_id', orderId)
          .single();

        if (!existingPurchase) {
          // Fallback: If the user's browser closed before /verify-payment could fire, the webhook saves it
          await supabase.from('user_purchases').insert({
            user_id: userId,
            product_type: productType,
            product_id: productId,
            amount_paid: amountPaid,
            order_id: orderId
          });
          console.log(`Webhook successfully captured and saved purchase for Order: ${orderId}`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
