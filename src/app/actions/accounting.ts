'use server';

import { createServerClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { ActionResult } from '@/types/crm.types';
import { revalidatePath } from 'next/cache';

export async function addExpense(payload: {
    category: string;
    amount: number;
    currency?: string;
    merchant?: string;
    date: string;
    description?: string;
    receiptUrl?: string;
}): Promise<ActionResult> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();
    
    const { error } = await supabase
        .from('expenses')
        .insert({
            workspace_id: workspaceId,
            category: payload.category,
            amount: payload.amount,
            currency: payload.currency || 'USD',
            merchant: payload.merchant,
            date: payload.date,
            description: payload.description,
            receipt_url: payload.receiptUrl
        });

    if (error) return { success: false, error: error.message };
    revalidatePath('/finance/expenses');
    return { success: true };
}

export async function getFinancialSummary(): Promise<ActionResult<{ income: number; expenses: number; profit: number }>> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();

    // Fetch Income (Paid Invoices)
    const { data: incomeData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('workspace_id', workspaceId)
        .eq('status', 'paid');

    // Fetch Expenses
    const { data: expenseData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('workspace_id', workspaceId);

    const income = incomeData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
    const expenses = expenseData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    return {
        success: true,
        data: {
            income,
            expenses,
            profit: income - expenses
        }
    };
}

export async function updateTaxSettings(payload: { taxName: string; rate: number }): Promise<ActionResult> {
    const workspaceId = await getCurrentWorkspaceId();
    const supabase = await createServerClient();

    const { error } = await supabase
        .from('tax_settings')
        .upsert({
            workspace_id: workspaceId,
            tax_name: payload.taxName,
            rate: payload.rate
        }, { onConflict: 'workspace_id, tax_name' });

    if (error) return { success: false, error: error.message };
    return { success: true };
}
