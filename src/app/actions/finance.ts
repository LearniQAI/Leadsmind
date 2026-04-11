import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

// --- Stripe Connect ---
export async function getStripeConnectUrl(workspaceId: string) {
  // In a real app, this would call the Stripe API to create an account link
  // For now, we'll simulate it by returning a placeholder URL or updating the DB
  const supabase = await createClient();
  
  // Simulate checking Stripe Connect ID
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('stripe_connect_id')
    .eq('id', workspaceId)
    .single();

  if (workspace?.stripe_connect_id) {
    return { connected: true };
  }

  // Placeholder URL
  return { connected: false, url: 'https://connect.stripe.com/oauth/authorize' };
}

export async function getSaaSTiers() {
  return [
    { id: 'free', name: 'Free', price: 0, features: ['Up to 100 contacts', 'Basic CRM', 'Email support'] },
    { id: 'pro', name: 'Pro', price: 49, features: ['Unlimited contacts', 'LMS Engine', 'Stripe Connect', 'AI Insights'] },
    { id: 'enterprise', name: 'Enterprise', price: 199, features: ['Custom branding', 'Advanced Automations', 'Dedicated support', 'Unlimited users'] },
  ];
}
