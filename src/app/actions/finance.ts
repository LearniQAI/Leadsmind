'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';
import { createNotification } from './notifications';
import { format } from 'date-fns';
import React from 'react';

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
export async function getInvoices(workspaceId: string, contactId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(*),
      contact:contacts(first_name, last_name, email)
    `)
    .eq('workspace_id', workspaceId);

  if (contactId) {
    query = query.eq('contact_id', contactId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getQuotes(workspaceId: string, contactId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('quotes')
    .select(`
      *,
      items:invoice_items(*),
      contact:contacts(first_name, last_name, email)
    `)
    .eq('workspace_id', workspaceId);

  if (contactId) {
    query = query.eq('contact_id', contactId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getInvoiceSettings(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertInvoiceSettings(settingsData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoice_settings')
    .upsert(settingsData)
    .select()
    .single();

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

export async function createInvoiceCheckoutSession(invoiceId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Fetch Invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*, contact:contacts(email)')
      .eq('id', invoiceId)
      .single();

    if (invError || !invoice) throw new Error("Invoice not found");

    // 2. Create Stripe line item
    const lineItems = [
      {
        price_data: {
          currency: (invoice.currency || 'usd').toLowerCase(),
          product_data: {
            name: `Invoice ${invoice.invoice_number}`,
            description: `Payment for invoice ${invoice.invoice_number} from LeadsMind`,
          },
          unit_amount: Math.round(Number(invoice.total_amount) * 100),
        },
        quantity: 1,
      },
    ];

    // 3. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: invoice.contact?.email || undefined,
      metadata: {
        invoiceId: invoice.id,
        workspaceId: invoice.workspace_id,
        type: 'crm_invoice'
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoice/${invoice.id}?canceled=true`,
    });

    return { url: session.url };
  } catch (err: any) {
    console.error('[finance] Invoice Checkout Error:', err);
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
export async function saveInvoice(invoiceData: any, items: any[]) {
  try {
    const supabase = await createClient();
    const workspaceId = invoiceData.workspace_id;

    // 1. Insert Invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        amount_due: invoiceData.total_amount || 0, // Bridge for legacy NOT NULL constraint
        ...invoiceData
      })
      .select()
      .single();

    if (invError) {
      console.error("[finance] Invoice Insert Error:", invError);
      return { success: false, error: invError.message };
    }

    // 2. Insert Items
    if (items && items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoice.id,
        workspace_id: workspaceId
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) {
        console.error("[finance] Items Insert Error:", itemsError);
        // We might want to delete the invoice here if items fail, but for now we log it.
      }
    }

    // 3. Increment Invoice Number in Settings
    const { data: settings } = await supabase
      .from('invoice_settings')
      .select('next_invoice_number')
      .eq('workspace_id', workspaceId)
      .single();

    if (settings) {
      await supabase
        .from('invoice_settings')
        .update({ next_invoice_number: settings.next_invoice_number + 1 })
        .eq('workspace_id', workspaceId);
    }

    // 4. Log Activity in CRM Timeline (Silent Fail)
    try {
      await supabase
        .from('contact_activities')
        .insert({
          workspace_id: workspaceId,
          contact_id: invoice.contact_id,
          type: 'invoice',
          description: `Invoice ${invoice.invoice_number} created for $${invoice.total_amount.toLocaleString()}`,
          metadata: {
            invoice_id: invoice.id,
            amount: invoice.total_amount,
            status: invoice.status
          }
        });
    } catch (e) {
      console.warn("[finance] Failed to log activity:", e);
    }

    // 5. Send Email if published (Silent Fail)
    if (invoice.status === 'open') {
      try {
        const { data: contact } = await supabase
          .from('contacts')
          .select('email, first_name')
          .eq('id', invoice.contact_id)
          .single();

        if (contact?.email) {
          await sendEmail({
            to: contact.email,
            subject: `New Invoice: ${invoice.invoice_number}`,
            text: `A new invoice (${invoice.invoice_number}) for $${invoice.total_amount} is ready.`,
            react: React.createElement('div', null, [
              React.createElement('h1', null, 'New Invoice'),
              React.createElement('p', null, `Invoice Number: ${invoice.invoice_number}`),
              React.createElement('p', null, `Total Amount: $${invoice.total_amount}`),
            ])
          });
        }
      } catch (emailErr) {
        console.warn("[finance] Email failed:", emailErr);
      }
    }

    revalidatePath('/invoices');
    return { success: true, data: invoice };
  } catch (err: any) {
    console.error("[finance] Fatal Save Error:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function markInvoicePaid(invoiceId: string) {
  try {
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

    // 3. Trigger 2-Way Emails & Notifications
    const { data: admins } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', invoice.workspace_id)
      .eq('role', 'admin');

    const { data: user } = await supabase.auth.getUser();
    const adminEmail = user.user?.email;

    const { data: contact } = await supabase
      .from('contacts')
      .select('email, first_name')
      .eq('id', invoice.contact_id)
      .single();

    // Emails
    if (contact?.email) {
      await sendEmail({
        to: contact.email,
        subject: `Payment Received - Invoice [PAID]`,
        text: `We have received your payment. Thank you!`,
        react: React.createElement('div', null, 'Payment Received. Thank you for your business!')
      });
    }

    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Payment Success: Invoice marked as PAID`,
        text: `Great news! A payment has been recorded for your invoice.`,
        react: React.createElement('div', null, `Payment received from contact ID: ${invoice.contact_id}`)
      });
    }

    // Notification
    if (admins) {
      for (const admin of admins) {
        await createNotification({
          workspace_id: invoice.workspace_id,
          user_id: admin.user_id,
          type: 'system',
          title: 'Payment Received',
          message: `Invoice for ${contact?.first_name} marked as PAID.`,
          link: `/invoices/${invoiceId}`
        });
      }
    }

    // 4. Trigger Goal Check (Silent Fail)
    try {
      const { checkActiveWorkflowGoals } = await import('@/lib/automation/executor');
      await checkActiveWorkflowGoals(invoice.workspace_id, invoice.contact_id, 'invoice_paid');
    } catch (err) {
      console.warn("[finance-action] Goal check skipped:", err);
    }

    revalidatePath('/settings/billing');
    revalidatePath('/invoices');
    return { success: true };
  } catch (err: any) {
    console.error("[finance] markPaid Error:", err);
    return { success: false, error: err.message };
  }
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(*),
      contact:contacts(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function sendInvoice(id: string) {
  try {
    const supabase = await createClient();
    // 1. Update status to sent
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', id)
      .select(`
        *,
        contact:contacts(*)
      `)
      .single();

    if (error) throw error;

    // 2. Fetch Workspace Admins to notify
    const { data: admins } = await supabase
      .from('workspace_members')
      .select('user_id, role')
      .eq('workspace_id', invoice.workspace_id)
      .eq('role', 'admin');

    const { data: user } = await supabase.auth.getUser();
    const adminEmail = user.user?.email;

    // 3. Send 2-Way Emails
    const emailPromises = [];
    
    // To Client
    if (invoice.contact?.email) {
      emailPromises.push(sendEmail({
        to: invoice.contact.email,
        subject: `Invoice ${invoice.invoice_number} from LeadsMind`,
        text: `Your invoice ${invoice.invoice_number} for $${invoice.total_amount} is ready.`,
        react: React.createElement('div', null, [
          React.createElement('h1', null, 'Invoice Ready'),
          React.createElement('p', null, `Amount: $${invoice.total_amount}`),
          React.createElement('p', null, `Please click here to view and pay: [Link Your Invoice]`),
        ])
      }));
    }

    // To Admin
    if (adminEmail) {
      emailPromises.push(sendEmail({
        to: adminEmail,
        subject: `Invoice Sent: ${invoice.invoice_number}`,
        text: `Invoice ${invoice.invoice_number} for $${invoice.total_amount} has been sent to ${invoice.contact?.email}.`,
        react: React.createElement('div', null, [
          React.createElement('h1', null, 'Invoice Sent Successfully'),
          React.createElement('p', null, `Client: ${invoice.contact?.first_name} ${invoice.contact?.last_name}`),
          React.createElement('p', null, `Amount: $${invoice.total_amount}`),
        ])
      }));
    }

    await Promise.all(emailPromises);

    // 4. Create Notification for Admin
    if (admins) {
      for (const admin of admins) {
        await createNotification({
          workspace_id: invoice.workspace_id,
          user_id: admin.user_id,
          type: 'system',
          title: 'Invoice Sent',
          message: `Invoice ${invoice.invoice_number} sent to ${invoice.contact?.first_name}`,
          link: `/invoices/${invoice.id}`
        });
      }
    }

    // 5. Record activity
    await supabase.from('contact_activities').insert({
      workspace_id: invoice.workspace_id,
      contact_id: invoice.contact_id,
      type: 'invoice',
      description: `Invoice ${invoice.invoice_number} sent to client`,
      metadata: { invoice_id: invoice.id, status: 'sent' }
    });

    revalidatePath('/invoices');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function triggerPaymentReminder(invoiceId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Fetch Invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, contact:contacts(*)')
      .eq('id', invoiceId)
      .single();

    if (!invoice) throw new Error("Invoice not found");

    // 2. Fetch Admin Email
    const { data: userAuth } = await supabase.auth.getUser();
    const adminEmail = userAuth.user?.email;

    // 3. Send 2-Way Reminder Emails
    if (invoice.contact?.email) {
      await sendEmail({
        to: invoice.contact.email,
        subject: `Reminder: Invoice ${invoice.invoice_number} is pending`,
        text: `Friendly reminder: Your invoice ${invoice.invoice_number} for $${invoice.total_amount} is awaiting payment.`,
        react: React.createElement('div', null, `A reminder for invoice ${invoice.invoice_number} has been sent.`)
      });
    }

    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `Reminder Sent: ${invoice.invoice_number}`,
        text: `You have sent a payment reminder to ${invoice.contact?.email} for invoice ${invoice.invoice_number}.`,
        react: React.createElement('div', null, `Manual reminder triggered for $${invoice.total_amount}`)
      });
    }

    // 4. Create Notification for Admin
    const { data: admins } = await supabase
      .from('workspace_members')
      .select('user_id')
      .eq('workspace_id', invoice.workspace_id)
      .eq('role', 'admin');

    if (admins) {
      for (const admin of admins) {
        await createNotification({
          workspace_id: invoice.workspace_id,
          user_id: admin.user_id,
          type: 'system',
          title: 'Reminder Sent',
          message: `Reminder email sent to ${invoice.contact?.first_name}`,
          link: `/invoices/${invoice.id}`
        });
      }
    }

    revalidatePath('/invoices');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    if (error) throw error;
    revalidatePath('/invoices');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getContactsForInvoicing(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('first_name');

  if (error) throw error;
  return data;
}

export async function getRecentClients(workspaceId: string, limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, total_invoices:invoices(count)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map((c: any) => ({
    ...c,
    total_invoices: c.total_invoices?.[0]?.count || 0
  }));
}

export async function getInvoiceStats(workspaceId: string) {
  const supabase = await createClient();

  // 1. Total Invoiced
  const { data: allInvoices } = await supabase
    .from("invoices")
    .select("total_amount, amount_due, status")
    .eq("workspace_id", workspaceId);

  if (!allInvoices) return { total_invoiced: 0, collected: 0, outstanding: 0, overdue: 0 };

  const stats = allInvoices.reduce((acc, inv) => {
    const amount = Number(inv.total_amount || inv.amount_due || 0);
    acc.total += amount;
    if (inv.status === 'paid') acc.collected += amount;
    if (inv.status === 'open' || inv.status === 'sent') acc.outstanding += amount;
    if (inv.status === 'overdue') acc.overdue += amount;
    return acc;
  }, { total: 0, collected: 0, outstanding: 0, overdue: 0 });

  return {
    total_invoiced: stats.total,
    collected: stats.collected,
    outstanding: stats.outstanding,
    overdue: stats.overdue
  };
}

export async function getRecentInvoices(workspaceId: string, limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, contact:contacts(first_name, last_name, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(inv => ({
    ...inv,
    total_amount: inv.total_amount || inv.amount_due || 0
  }));
}

export async function getInvoiceAnalytics(workspaceId: string) {
  const supabase = await createClient();
  
  // Fetch invoices for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_amount, amount_due, status, created_at")
    .eq("workspace_id", workspaceId)
    .gte("created_at", sixMonthsAgo.toISOString());

  if (!invoices) return { monthly: [], summary: { total: 0, count: 0 } };

  // Group by month
  const monthlyData = Object.values(invoices.reduce((acc: any, inv: any) => {
    const month = format(new Date(inv.created_at), "MMM yyyy");
    const amount = Number(inv.total_amount || inv.amount_due || 0);
    if (!acc[month]) acc[month] = { month, total: 0, collected: 0 };
    acc[month].total += amount;
    if (inv.status === 'paid') acc[month].collected += amount;
    return acc;
  }, {}));

  return {
    monthly: monthlyData,
    summary: {
      total: invoices.reduce((sum, inv) => sum + Number(inv.total_amount || inv.amount_due || 0), 0),
      count: invoices.length
    }
  };
}

export async function getRecentQuotes(workspaceId: string, limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*, contact:contacts(first_name, last_name, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createQuote(quoteData: any, items: any[]) {
  const supabase = await createClient();
  const workspaceId = quoteData.workspace_id;

  // 1. Insert Quote
  const { data: quote, error: qError } = await supabase
    .from('quotes')
    .insert(quoteData)
    .select()
    .single();

  if (qError) throw qError;

  // 2. Insert Items (Using same table as invoices for consistency)
  if (items && items.length > 0) {
    const itemsWithQuoteId = items.map(item => ({
      ...item,
      quote_id: quote.id,
      workspace_id: workspaceId
    }));

    await supabase.from('invoice_items').insert(itemsWithQuoteId);
  }

  revalidatePath('/invoices');
  return { success: true, data: quote };
}

export async function convertToInvoice(quoteId: string) {
  const supabase = await createClient();
  
  // 1. Get Quote & Items
  const { data: quote } = await supabase.from('quotes').select('*, items:invoice_items(*)').eq('id', quoteId).single();
  if (!quote) throw new Error("Quote not found");

  // 2. Map to Invoice Data
  const invoiceData = {
    workspace_id: quote.workspace_id,
    contact_id: quote.contact_id,
    invoice_number: `INV-${Date.now()}`,
    status: 'open',
    total_amount: quote.total_amount,
    tax_amount: quote.tax_amount || 0,
    discount_amount: quote.discount_amount || 0,
    currency: quote.currency || 'USD',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  };

  // 3. Save as Invoice
  const result = await saveInvoice(invoiceData, quote.items || []);
  
  // 4. Update Quote Status
  if (result.success) {
    await supabase.from('quotes').update({ status: 'converted' }).eq('id', quoteId);
  }

  return result;
}
