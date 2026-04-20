'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function recordTransaction(workspaceId: string, data: { description: string, amount: number, type: string, reference?: string }) {
    const supabase = await createClient();
    await supabase.from('accounting_transactions').insert({
        workspace_id: workspaceId,
        description: data.description,
        total_amount: data.amount,
        source_type: data.type,
        reference: data.reference,
        date: new Date().toISOString().split('T')[0]
    });
}

export async function saveAccountantOnboarding(workspaceId: string, rawData: any) {
  const supabase = await createClient();
  
  // Map conversational step IDs to database columns
  const mappedData: any = {
    workspace_id: workspaceId,
    is_completed: rawData.is_completed || false,
    updated_at: new Date().toISOString(),
    
    // Explicit mappings
    business_structure: rawData.structure || rawData.business_structure,
    industry: rawData.industry,
    tax_scope: rawData.scope || rawData.tax_scope,
    has_business_bank_account: rawData.bank_gate === 'yes' || !!rawData.has_business_bank_account,
    sars_registered: rawData.sars_setup === 'yes' || !!rawData.sars_registered,
    vat_registered: rawData.vat_setup === 'vat_registered' || !!rawData.vat_registered,
    
    // Store everything in JSONB for the AI layer to scan later
    onboarding_data: {
      ...rawData
    }
  };

  // Clean up any undefined keys from the mapped object to prevent SQL errors
  const cleanData = Object.fromEntries(
    Object.entries(mappedData).filter(([_, v]) => v !== undefined)
  );

  const { data: onboarding, error } = await supabase
    .from('accountant_onboarding')
    .upsert(cleanData, { onConflict: 'workspace_id' })
    .select()
    .single();

  if (error) throw error;

  // If onboarding is completed, seed the Chart of Accounts
  if (cleanData.is_completed) {
    await seedChartOfAccounts(
      workspaceId, 
      cleanData.industry as string, 
      cleanData.business_structure as string
    );
  }

  revalidatePath('/accountant');
  return onboarding;
}

async function seedChartOfAccounts(workspaceId: string, industry: string, structure: string) {
  const supabase = await createClient();

  // Basic accounts for all businesses
  const baseAccounts = [
    { code: '1000', name: 'Bank Account - Business', type: 'asset', category: 'current_asset', is_system: true },
    { code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'current_asset', is_system: true },
    { code: '2000', name: 'Accounts Payable', type: 'liability', category: 'current_liability', is_system: true },
    { code: '2100', name: 'VAT Control Account', type: 'liability', category: 'current_liability', is_system: true },
    { code: '3000', name: 'Owner Equity', type: 'equity', category: 'equity', is_system: true },
    { code: '4000', name: 'Sales Revenue', type: 'revenue', category: 'operating_revenue', is_system: true },
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense', category: 'cogs', is_system: true },
    { code: '6000', name: 'Software & Subscriptions', type: 'expense', category: 'operating_expense', is_system: true },
    { code: '6100', name: 'Rent & Utilities', type: 'expense', category: 'operating_expense', is_system: true }
  ];

  // Industry Specific Additions
  const industryAccounts: any = {
    retail: [
      { code: '1200', name: 'Inventory Asset', type: 'asset', category: 'current_asset' },
      { code: '4100', name: 'Point of Sale Revenue', type: 'revenue', category: 'operating_revenue' }
    ],
    law: [
      { code: '2200', name: 'Client Trust Account (Liability)', type: 'liability', category: 'current_liability' },
      { code: '1300', name: 'Trust Bank Account', type: 'asset', category: 'current_asset' }
    ],
    construction: [
      { code: '1400', name: 'Work in Progress', type: 'asset', category: 'current_asset' },
      { code: '5100', name: 'Subcontractor Costs', type: 'expense', category: 'cogs' }
    ]
  };

  const finalAccounts = [
    ...baseAccounts,
    ...(industryAccounts[industry] || [])
  ].map(acc => ({
    ...acc,
    workspace_id: workspaceId,
    tax_category: getTaxCategory(acc.code, structure)
  }));

  // Batch insert
  const { error } = await supabase
    .from('chart_of_accounts')
    .insert(finalAccounts);

  if (error && error.code !== '23505') { // Ignore unique constraint errors (already seeded)
    console.error("CoA Seeding Error:", error);
  }
}

function getTaxCategory(code: string, structure: string) {
  // Simple mapping for SARS forms (concept)
  if (code.startsWith('4')) return 'Income';
  if (code.startsWith('5') || code.startsWith('6')) return 'Allowable Deductions';
  return 'Other';
}

export async function getAccountantOnboarding(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('accountant_onboarding')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// --- PROVISIONAL TAX (IRP6) ACTIONS ---
export async function saveProvisionalTax(workspaceId: string, record: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('provisional_tax_records')
        .upsert({ workspace_id: workspaceId, ...record })
        .select()
        .single();
    if (error) throw error;

    await recordTransaction(workspaceId, {
        description: `Provisional Tax Draft Created (${record.period_type} ${record.period_year})`,
        amount: record.estimated_tax_liability,
        type: 'tax'
    });

    revalidatePath('/accountant');
    return data;
}

export async function getProvisionalTaxRecords(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('provisional_tax_records')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('period_year', { ascending: false });
    if (error) throw error;
    return data;
}

// --- DIRECTOR'S LOAN ACTIONS ---
export async function updateDirectorLoan(workspaceId: string, loanData: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('director_loans')
        .upsert({ workspace_id: workspaceId, ...loanData })
        .select()
        .single();
    if (error) throw error;

    const isDrawing = loanData.balance > (loanData.oldBalance || 0);
    await recordTransaction(workspaceId, {
        description: isDrawing ? 'Director Drawing Recorded' : 'Director Loan Repayment',
        amount: Math.abs(loanData.balance - (loanData.oldBalance || 0)),
        type: 'loan'
    });

    revalidatePath('/accountant');
    return data;
}

export async function getDirectorLoans(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('director_loans')
        .select('*')
        .eq('workspace_id', workspaceId);
    if (error) throw error;
    return data;
}

// --- HOME OFFICE ACTIONS ---
export async function saveHomeOfficeSetup(workspaceId: string, setup: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('home_office_setup')
        .upsert({ workspace_id: workspaceId, ...setup })
        .select()
        .single();
    if (error) throw error;
    revalidatePath('/accountant');
    return data;
}

export async function getHomeOfficeSetup(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('home_office_setup')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// --- BUSINESS LOAN ACTIONS ---
export async function addBusinessLoan(workspaceId: string, loan: any) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('business_loans')
        .insert({ workspace_id: workspaceId, ...loan })
        .select()
        .single();
    if (error) throw error;
    revalidatePath('/accountant');
    return data;
}

export async function getInventory(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('type', 'physical');
    if (error) throw error;
    return data;
}

export async function addIncomingStock(workspaceId: string, lotData: any) {
    const supabase = await createClient();
    
    // 1. Create the inventory lot (for FIFO)
    const { data: lot, error: lotError } = await supabase
        .from('inventory_lots')
        .insert({
            workspace_id: workspaceId,
            product_id: lotData.product_id,
            quantity_bought: lotData.quantity,
            quantity_remaining: lotData.quantity,
            unit_cost: lotData.unit_cost,
            reference: lotData.reference
        })
        .select()
        .single();

    if (lotError) throw lotError;

    // 2. Update the main product quantity
    const { error: updateError } = await supabase.rpc('increment_product_stock', {
        pid: lotData.product_id,
        amount: lotData.quantity
    });

    // If RPC doesn't exist, we fallback to manual logic (but RPC is safer for concurrency)
    if (updateError) {
        const { data: p } = await supabase.from('products').select('quantity_on_hand').eq('id', lotData.product_id).single();
        await supabase.from('products').update({ 
            quantity_on_hand: (p?.quantity_on_hand || 0) + lotData.quantity 
        }).eq('id', lotData.product_id);
    }

    revalidatePath('/accountant');
    return lot;
}

export async function startMigrationJob(workspaceId: string, source: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('migration_jobs')
        .insert({
            workspace_id: workspaceId,
            source_system: source,
            status: 'mapping',
            mapping_config: { started_at: new Date().toISOString() }
        })
        .select()
        .single();
    if (error) throw error;
    revalidatePath('/accountant');
    return data;
}

export async function getMigrationJobs(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('migration_jobs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function importTransactions(workspaceId: string, transactions: any[]) {
    const supabase = await createClient();
    const formatted = transactions.map(t => ({
        workspace_id: workspaceId,
        date: t.date || new Date().toISOString().split('T')[0],
        description: t.description,
        total_amount: parseFloat(t.amount),
        source_type: t.category === 'sale' ? 'revenue' : 'expense',
        reference: 'CSV-IMPORT'
    }));

    const { data, error } = await supabase
        .from('accounting_transactions')
        .insert(formatted)
        .select();

    if (error) throw error;
    revalidatePath('/accountant');
    return data;
}

export async function getBusinessLoans(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('business_loans')
        .select('*')
        .eq('workspace_id', workspaceId);
    if (error) throw error;
    return data;
}

export async function getRecentTransactions(workspaceId: string, limit = 5) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('accounting_transactions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data;
}
