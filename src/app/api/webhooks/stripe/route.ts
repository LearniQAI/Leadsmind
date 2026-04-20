import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Since this is a webhook, we must bypass RLS, so we use the Service Role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const workspaceId = session.metadata?.workspaceId;
        const tierId = session.metadata?.tierId;
        const subscriptionId = session.subscription;

        if (workspaceId && tierId) {
          await supabaseAdmin
            .from('workspaces')
            .update({ 
               plan_tier: tierId,
               stripe_customer_id: session.customer,
               stripe_subscription_id: subscriptionId
            })
            .eq('id', workspaceId);
        }

        // Handle CRM Invoice Payment
        const invoiceId = session.metadata?.invoiceId;
        const type = session.metadata?.type;
        
        if (type === 'crm_invoice' && invoiceId) {
          // Use the markInvoicePaid logic but via admin client to bypass RLS
          await supabaseAdmin
            .from('invoices')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', invoiceId);
            
          console.log(`CRM Invoice ${invoiceId} marked as paid via Stripe.`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        // Downgrade to starter on cancellation
        await supabaseAdmin
          .from('workspaces')
          .update({ plan_tier: 'starter', stripe_subscription_id: null })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        // Basic log of a SaaS payment from a workspace
        const { data: workspace } = await supabaseAdmin
          .from('workspaces')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (workspace) {
          // If we had a generic system invoices table, we'd log it here.
          console.log(`Invoice paid for workspace: ${workspace.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error(`Webhook handler failed: ${error.message}`);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
