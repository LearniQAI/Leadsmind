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

export async function getAIAlerts(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('accountant_ai_alerts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getComplianceDeadlines(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('compliance_deadlines')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('deadline_date', { ascending: true });
    if (error) throw error;
    return data;
}

export async function generateIntelligence(workspaceId: string) {
    const supabase = await createClient();
    
    // 1. Fetch data for analysis
    const { data: txs } = await supabase.from('accounting_transactions').select('*').eq('workspace_id', workspaceId);
    const { data: loans } = await supabase.from('director_loans').select('*').eq('workspace_id', workspaceId).single();

    const alerts = [];

    // SCANNER 1: Section 12C Equipment Allowance
    const equipmentPurchase = txs?.find(t => t.description.toLowerCase().includes('laptop') || t.description.toLowerCase().includes('machine') || t.description.toLowerCase().includes('equipment'));
    if (equipmentPurchase) {
        alerts.push({
            workspace_id: workspaceId,
            type: 'tax_deduction',
            title: 'Section 12C Opportunity',
            description: `We noticed a purchase of "${equipmentPurchase.description}". You may be eligible for an accelerated 40/20/20 depreciation allowance under Section 12C.`,
            priority: 'high',
            metadata: { transaction_id: equipmentPurchase.id }
        });
    }

    // SCANNER 2: Overdrawn Director Loan
    if (loans && (loans.total_borrowed - loans.total_repaid) > 0) {
        alerts.push({
            workspace_id: workspaceId,
            type: 'compliance_warning',
            title: 'Overdrawn Director Loan',
            description: `The director's loan account is currently overdrawn by R${(loans.total_borrowed - loans.total_repaid).toLocaleString()}. SARS requires interest to be charged at a minimum of 8.25% to avoid deemed dividends.`,
            priority: 'high'
        });
    }

    // SCANNER 3: Cash Flow Runway (Simple)
    const income = txs?.filter(t => t.source_type === 'revenue').reduce((acc, t) => acc + parseFloat(t.total_amount), 0) || 0;
    const expenses = txs?.filter(t => t.source_type === 'expense').reduce((acc, t) => acc + parseFloat(t.total_amount), 0) || 0;
    if (expenses > income && income > 0) {
        alerts.push({
            workspace_id: workspaceId,
            type: 'financial_health',
            title: 'Negative Cash Flow Alert',
            description: 'Your expenses exceeded your revenue over the recorded period. Consider reviewing operational costs for the next quarter.',
            priority: 'medium'
        });
    }

    // Batch insert if not duplicate (simplified here, in real world use upsert with unique constraint)
    for (const alert of alerts) {
        await supabase.from('accountant_ai_alerts').upsert(alert, { onConflict: 'workspace_id, title' });
    }

    // 4. SEED COMPLIANCE DEADLINES (If empty)
    const { count: deadlineCount } = await supabase.from('compliance_deadlines').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId);
    if (deadlineCount === 0) {
        const standardDeadlines = [
            { workspace_id: workspaceId, title: 'VAT201 Submission', deadline_date: '2026-04-25', type: 'VAT', description: 'Monthly VAT return' },
            { workspace_id: workspaceId, title: 'EMP201 (PAYE)', deadline_date: '2026-05-07', type: 'PAYE', description: 'Monthly payroll tax' },
            { workspace_id: workspaceId, title: 'IRP6 P1 (Provisional)', deadline_date: '2026-08-31', type: 'TAX', description: 'First provisional tax payment' },
        ];
        await supabase.from('compliance_deadlines').insert(standardDeadlines);
    }

    // 5. SEED BUSINESS GOALS (If empty)
    const { count: goalCount } = await supabase.from('business_goals').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId);
    if (goalCount === 0) {
        const initialGoals = [
            { workspace_id: workspaceId, type: 'revenue_target', title: 'Fiscal Year Revenue Target', target_value: 5000000, current_value: 0, deadline_date: '2027-02-28' },
            { workspace_id: workspaceId, type: 'hiring_plan', title: 'Scale-up Hiring (3 New Hires)', target_value: 3, current_value: 0, deadline_date: '2026-12-31' },
            { workspace_id: workspaceId, type: 'capital_purchase', title: 'Cloud Infrastructure Upgrade', target_value: 150000, current_value: 0, deadline_date: '2026-06-30' },
        ];
        await supabase.from('business_goals').insert(initialGoals);
    }

    return alerts;
}

export async function getBusinessGoals(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('business_goals')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
}

export async function updateGoalProgress(workspaceId: string) {
    const supabase = await createClient();
    
    // 1. Calculate current revenue
    const { data: txs } = await supabase.from('accounting_transactions').select('total_amount').eq('workspace_id', workspaceId).eq('source_type', 'revenue');
    const totalRev = txs?.reduce((acc, t) => acc + parseFloat(t.total_amount), 0) || 0;

    // 2. Update 'revenue_target' goals
    await supabase
        .from('business_goals')
        .update({ current_value: totalRev })
        .eq('workspace_id', workspaceId)
        .eq('type', 'revenue_target');
}

export async function getContactFinancialHealth(workspaceId: string, contactId: string) {
    const supabase = await createClient();
    const { data: txs } = await supabase
        .from('accounting_transactions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('metadata->contact_id', contactId); // Hypothetical link

    if (!txs || txs.length === 0) return { score: 0, narrative: 'No transaction history' };

    const totalVal = txs.reduce((acc, t) => acc + parseFloat(t.total_amount), 0);
    const narrative = totalVal > 50000 ? 'High-Value Strategic Partner' : 'Emerging Customer';

    return { totalVal, narrative, count: txs.length };
}

export async function addBusinessGoal(goal: any) {
    const supabase = await createClient();
    const { error } = await supabase.from('business_goals').insert([goal]);
    if (error) throw error;
    revalidatePath('/accountant');
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

export async function getFinancialSummary(workspaceId: string) {
    const supabase = await createClient();
    const { data: txs } = await supabase.from('accounting_transactions').select('total_amount, source_type').eq('workspace_id', workspaceId);
    
    const revenue = txs?.filter(t => t.source_type === 'revenue').reduce((acc, t) => acc + parseFloat(t.total_amount), 0) || 0;
    const expenses = txs?.filter(t => t.source_type === 'expense').reduce((acc, t) => acc + parseFloat(t.total_amount), 0) || 0;
    
    return {
        revenue,
        expenses,
        netProfit: revenue - expenses
    };
}

export async function sellInventoryItem(workspaceId: string, saleData: { product_id: string, quantity: number, price_each: number }) {
    const supabase = await createClient();
    
    // 1. FIFO Depletion Logic
    const { data: lots } = await supabase
        .from('inventory_lots')
        .select('*')
        .eq('product_id', saleData.product_id)
        .gt('quantity_remaining', 0)
        .order('created_at', { ascending: true });

    if (!lots || lots.length === 0) throw new Error("Out of stock (no available lots)");

    let needed = saleData.quantity;
    let totalCogs = 0;

    for (const lot of lots) {
        if (needed <= 0) break;
        const consume = Math.min(needed, lot.quantity_remaining);
        await supabase.from('inventory_lots').update({ 
            quantity_remaining: lot.quantity_remaining - consume 
        }).eq('id', lot.id);
        
        totalCogs += consume * lot.unit_cost;
        needed -= consume;
    }

    if (needed > 0) throw new Error("Insufficient stock in FIFO lots");

    // 2. Update main product stock
    await supabase.rpc('increment_product_stock', { pid: saleData.product_id, amount: -saleData.quantity });

    // 3. Record Revenue
    await recordTransaction(workspaceId, {
        description: `Sale: ${saleData.quantity} unit(s)`,
        amount: saleData.quantity * saleData.price_each,
        type: 'revenue',
        reference: saleData.product_id
    });

    // 4. Record COGS Expense
    await recordTransaction(workspaceId, {
        description: `COGS for sale (${saleData.product_id})`,
        amount: totalCogs,
        type: 'expense'
    });

    revalidatePath('/accountant');
}

export async function getRecentTransactions(workspaceId: string, limit = 10) {
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
