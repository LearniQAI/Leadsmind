"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

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
    if (inv.status === 'open') acc.outstanding += amount;
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

export async function createInvoice(workspaceId: string, invoiceData: any) {
  const supabase = await createClient();
  
  // 1. Get next number from workspace settings
  const { data: ws } = await supabase.from("workspaces").select("invoice_settings").eq("id", workspaceId).single();
  const settings = ws?.invoice_settings || {};
  const currentNum = settings.next_number || 1001;
  const prefix = settings.prefix || "INV-";
  const invoiceNumber = `${prefix}${currentNum}`;

  // 2. Insert Invoice
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      workspace_id: workspaceId,
      invoice_number: invoiceNumber,
      amount_due: invoiceData.total_amount || 0, // Bridge to legacy schema NOT NULL constraint
      ...invoiceData
    })
    .select()
    .single();

  if (error) throw error;

  // 3. Increment number in settings
  await supabase
    .from("workspaces")
    .update({ 
      invoice_settings: { ...settings, next_number: currentNum + 1 } 
    })
    .eq("id", workspaceId);

  revalidatePath("/invoice/invoices");
  return data;
}

export async function getRecentQuotes(workspaceId: string, limit = 50) {
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

export async function createQuote(workspaceId: string, quoteData: any) {
  const supabase = await createClient();
  
  // 1. Get next number
  const { data: ws } = await supabase.from("workspaces").select("invoice_settings").eq("id", workspaceId).single();
  const settings = ws?.invoice_settings || {};
  const currentNum = settings.quote_next_number || 2001;
  const prefix = settings.quote_prefix || "QTE-";
  const quoteNumber = `${prefix}${currentNum}`;

  // 2. Insert Quote
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      workspace_id: workspaceId,
      quote_number: quoteNumber,
      ...quoteData
    })
    .select()
    .single();

  if (error) throw error;

  // 3. Increment number
  await supabase
    .from("workspaces")
    .update({ 
      invoice_settings: { ...settings, quote_next_number: currentNum + 1 } 
    })
    .eq("id", workspaceId);

  revalidatePath("/invoice/quotes");
  return data;
}

export async function convertToInvoice(workspaceId: string, quoteId: string) {
  const supabase = await createClient();
  
  // 1. Get Quote
  const { data: quote, error: getError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();
    
  if (getError || !quote) throw new Error("Quote not found");

  // 2. Create Invoice
  const invoice = await createInvoice(workspaceId, {
    contact_id: quote.contact_id,
    items: quote.items,
    subtotal: quote.subtotal,
    tax_total: quote.tax_total,
    total_amount: quote.total_amount,
    status: 'draft',
    notes: `Converted from ${quote.quote_number}. ${quote.notes || ''}`,
    currency: quote.currency || 'ZAR'
  });

  // 3. Mark quote as accepted/converted
  await supabase
    .from("quotes")
    .update({ status: 'accepted' })
    .eq("id", quoteId);

  revalidatePath("/invoice/quotes");
  revalidatePath("/invoice/invoices");
  
  return invoice;
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

