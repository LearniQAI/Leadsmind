'use server';

import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  FileText, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createInvoiceCheckoutSession } from '@/app/actions/finance';
import { createNotification } from '@/app/actions/notifications';

interface PublicInvoicePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;
  }>;
}

export async function generateMetadata({ params }: PublicInvoicePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase.from('invoices').select('invoice_number').eq('id', id).single();
  
  return {
    title: invoice ? `Invoice ${invoice.invoice_number}` : 'Invoice View',
    description: 'Securely view and pay your invoice.',
  };
}

export default async function PublicInvoicePage({ params, searchParams }: PublicInvoicePageProps) {
  const { id } = await params;
  const { success, canceled } = await searchParams;
  const supabase = await createClient();
  
  // 1. Fetch Invoice with items, contact, and branding
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(*),
      contact:contacts(first_name, last_name, email),
      settings:invoice_settings(*),
      workspace:workspaces(
        name,
        branding:workspace_branding(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !invoice) notFound();

  // @ts-ignore - nested join translation
  const branding = invoice.workspace?.branding?.[0] || null;
  const platformName = branding?.platform_name || invoice.workspace?.name || 'Platform';

  // 2. Track View (Silent notification to Admin)
  if (invoice.status === 'sent') {
    try {
      // Find workspace admins to notify
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
            title: 'Invoice Viewed',
            message: `Client ${invoice.contact?.first_name} viewed invoice ${invoice.invoice_number}`,
            link: `/invoices/${invoice.id}`
          });
        }
      }

      // Record activity
      await supabase.from('contact_activities').insert({
        workspace_id: invoice.workspace_id,
        contact_id: invoice.contact_id,
        type: 'system',
        description: `Customer viewed invoice ${invoice.invoice_number}`,
        metadata: { invoice_id: invoice.id, action: 'viewed' }
      });
    } catch (e) {
      console.warn("Tracking failed", e);
    }
  }

  const handlePay = async () => {
    'use server';
    const result = await createInvoiceCheckoutSession(invoice.id);
    if (result.url) {
      return result.url;
    }
    return null;
  };

  const isPaid = invoice.status === 'paid' || success === 'true';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-violet-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#2e1065_0%,transparent_50%)] pointer-events-none opacity-40" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="w-full max-w-2xl z-10 animate-in fade-in zoom-in duration-1000">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="h-16 w-16 rounded-[24px] bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]">
            <FileText size={32} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Invoice</h1>
            <p className="text-violet-400/60 font-mono text-sm tracking-widest">{invoice.invoice_number}</p>
          </div>
        </div>

        {/* Success/Error Toasts */}
        {success === 'true' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-fade-down">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <p className="text-emerald-400 text-sm font-bold">Payment successful! Thank you.</p>
          </div>
        )}

        <div className="bg-[#0c0c14]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden group">
          {/* Subtle Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="p-10 space-y-12">
            {/* Top Row: Meta Info */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Billed To</p>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-white">{invoice.contact?.first_name} {invoice.contact?.last_name}</p>
                  <p className="text-xs text-white/40">{invoice.contact?.email}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Due Date</p>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-white">
                    {invoice.due_date ? format(new Date(invoice.due_date), 'MMMM dd, yyyy') : 'On Receipt'}
                  </p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block",
                    isPaid ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  )}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Description</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Amount</p>
              </div>
              <div className="space-y-4">
                {invoice.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white/90">{item.description}</p>
                      <p className="text-[10px] text-white/20 font-medium">QTY: {Number(item.quantity)} × ${Number(item.unit_price).toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-black text-white">${Number(item.total_amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-8 border-t border-white/5">
              <div className="flex justify-between text-xs font-medium text-white/40">
                <span>Subtotal</span>
                <span>${Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-white/40">
                <span>Tax</span>
                <span>${Number(invoice.tax_total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Total Amount</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  ${Number(invoice.total_amount).toLocaleString()}
                  <span className="text-xs ml-1 text-white/20 uppercase">{invoice.currency}</span>
                </p>
              </div>
            </div>

            {/* CTA */}
            {!isPaid && (
              <form action={async () => {
                'use server';
                const res = await createInvoiceCheckoutSession(invoice.id);
                if (res.url) {
                  redirect(res.url);
                }
              }}>
                <Button className="w-full h-16 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-[24px] gap-3 font-black uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(108,71,255,0.4)] transition-all active:scale-[0.98]">
                  <CreditCard size={20} />
                  Secure Payment
                </Button>
              </form>
            )}

            {isPaid && (
              <div className="h-16 w-full flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[24px] font-black uppercase tracking-widest italic">
                <ShieldCheck size={20} />
                Paid Successfully
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex flex-col items-center gap-6">
           <div className="flex gap-8 items-center opacity-30">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                 <Smartphone size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Mobile Friendly</span>
              </div>
           </div>
           <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Powered by {platformName} Finance Network</p>
        </div>
      </main>
    </div>
  );
}
