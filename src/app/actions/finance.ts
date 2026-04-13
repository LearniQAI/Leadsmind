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

export async function createProduct(workspaceId: string, productData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({ workspace_id: workspaceId, ...productData })
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single();

  if (!profile?.workspace_id) {
    throw new Error('Workspace not found');
  }

  const workspaceId = profile.workspace_id;

  // Verify the tier
  const tiers = await getSaaSTiers();
  const selectedTier = tiers.find(t => t.id === tierId);
  if (!selectedTier) {
    throw new Error('Invalid tier');
  }

  if (selectedTier.price === 0) {
    // If it's the free tier, just update immediately without Stripe
    await supabase.from('workspaces').update({ plan_tier: 'starter' }).eq('id', workspaceId);
    revalidatePath('/settings/billing');
    return { url: '/settings/billing?success=true' };
  }

  let priceId = '';
  if (tierId === 'growth') {
    priceId = interval === 'year' 
      ? process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '' 
      : process.env.STRIPE_GROWTH_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || '';
  }
  if (tierId === 'agency') {
    priceId = interval === 'year' 
      ? process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID || process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || '' 
      : process.env.STRIPE_AGENCY_PRICE_ID || process.env.STRIPE_ENTERPRISE_PRICE_ID || '';
  }

  try {
    if (!priceId) {
      console.error(`Missing Stripe Price ID for tier: ${tierId} (${interval}).`);
      return { error: 'missing_price_id' };
    } else {
      const session = await stripe.checkout.sessions.create({
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
        customer_email: user.email,
      });

      if (session.url) {
        return { url: session.url };
      } else {
        return { error: 'invalid_session' };
      }
    }
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err.message);
    return { error: err.message };
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
    { id: 'starter', name: 'Starter', price: 0, features: ['Up to 500 contacts', '5 Funnels', '1 Pipeline', '2 Team members'] },
    { id: 'growth', name: 'Growth', price: 97, features: ['Unlimited contacts', 'Unlimited funnels', 'WhatsApp & Social Inbox', 'Email Campaigns'] },
    { id: 'agency', name: 'Agency', price: 297, features: ['Everything in Growth', 'Custom domains & White-label', 'SaaS reseller mode', 'Unlimited sub-accounts'] },
  ];
}
