'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';

// --- Products ---
export async function getProducts(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProduct(productData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/settings/billing');
  return data;
}

// --- Invoices ---
export async function getInvoices(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      contact:contacts(first_name, last_name, email)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// --- Stripe SaaS Checkout ---
export async function createCheckoutSession(tierId: string, interval: 'month' | 'year' = 'month') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data: membership } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    let workspaceId = membership?.workspace_id;

    if (!workspaceId) {
      return { error: 'Workspace not found. Need an active workspace to upgrade.' };
    }

    // Verify the tier
    const tiers = await getSaaSTiers();
    const selectedTier = tiers.find(t => t.id === tierId);
    if (!selectedTier) {
      return { error: 'Invalid tier' };
    }

    if (selectedTier.monthlyPrice === 0) {
      // If it's the free tier, just update immediately without Stripe
      await supabase.from('workspaces').update({ plan_tier: 'starter' }).eq('id', workspaceId);
      revalidatePath('/settings/billing');
      return { url: '/settings/billing?success=true' };
    }

    let priceId = '';
    if (tierId === 'pro') {
      priceId = interval === 'year'
        ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID || ''
        : process.env.STRIPE_PRO_PRICE_ID || '';
    }
    if (tierId === 'enterprise') {
      priceId = interval === 'year'
        ? process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || ''
        : process.env.STRIPE_ENTERPRISE_PRICE_ID || '';
    }

    if (!priceId) {
      console.error(`Missing Stripe Price ID for tier: ${tierId} (${interval}).`);
      return { error: 'missing_price_id' };
    }

    const checkoutParams: any = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId,
        tierId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
    };

    if (user.email) {
      checkoutParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(checkoutParams);

    if (session.url) {
      return { url: session.url };
    } else {
      return { error: 'invalid_session' };
    }
  } catch (err: any) {
    console.error('Critical Checkout Crash:', err.message);
    return { error: err.message || 'Unknown Server Action Exception' };
  }
}

// --- Stripe Connect ---
export async function getStripeConnectUrl(workspaceId: string) {
  const supabase = await createClient();
  
  // 1. Check existing Stripe Connect ID
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('stripe_connect_id')
    .eq('id', workspaceId)
    .single();

  let accountId = workspace?.stripe_connect_id;

  // 2. If no account exists, create one via Stripe API
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'standard', // or 'express' depending on integration requirements
    });
    accountId = account.id;

    await supabase
      .from('workspaces')
      .update({ stripe_connect_id: accountId })
      .eq('id', workspaceId);
  } else {
    // Check if account onboarding is already complete
    const account = await stripe.accounts.retrieve(accountId);
    if (account.details_submitted) {
      return { connected: true };
    }
  }

  // 3. Create Connect Onboarding Link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`,
    type: 'account_onboarding',
  });

  return { connected: false, url: accountLink.url };
}

export async function getSaaSTiers() {
  return [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Up to 500 contacts',
        '5 Funnels',
        '1 Pipeline',
        '2 Team members',
        'Basic email support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 77,
      annualPrice: 77,
      features: [
        'Unlimited contacts',
        'Unlimited funnels & pipelines',
        'WhatsApp & Social Inbox',
        'Email Campaigns',
        'SMS via Twilio',
        'Priority support',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 237,
      annualPrice: 237,
      features: [
        'Everything in Pro',
        'Custom domains & White-label',
        'SaaS reseller mode',
        'Unlimited sub-accounts',
        'Dedicated account manager',
        'SLA guarantee',
      ],
    },
  ];
}
// --- Data Management ---
export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
  revalidatePath('/settings/billing');
}

export async function createInvoice(invoiceData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/settings/billing');
  return data;
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createClient();
  
  // 1. Fetch invoice to get workspace and contact info
  const { data: invoice } = await supabase
    .from('invoices')
    .select('workspace_id, contact_id')
    .eq('id', invoiceId)
    .single();

  if (!invoice) throw new Error("Invoice not found");

  // 2. Update status
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', invoiceId);

  if (error) throw error;

  // 3. Trigger Goal Check
  try {
    const { checkActiveWorkflowGoals } = await import('@/lib/automation/executor');
    await checkActiveWorkflowGoals(invoice.workspace_id, invoice.contact_id, 'invoice_paid');
  } catch (err) {
    console.error("[finance-action] Failed to trigger goal check:", err);
  }

  revalidatePath('/settings/billing');
  return { success: true };
}

export async function getContactsForInvoicing(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email')
    .eq('workspace_id', workspaceId)
    .order('first_name');

  if (error) throw error;
  return data;
}
