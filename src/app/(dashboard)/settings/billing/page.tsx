import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getInvoices, getProducts, getSaaSTiers, createCheckoutSession, getStripeConnectUrl, getContactsForInvoicing, deleteProduct } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  ExternalLink,
  Plus,
  Receipt,
  Package,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes } from '@/lib/utils'; // Reusing for numbers or adding formatCurrency
import { getCurrentWorkspace } from '@/lib/auth';
import { CheckoutButton } from '@/components/billing/CheckoutButton';
import { BillingPlansToggle } from '@/components/billing/BillingPlansToggle';
import { ProductModal } from '@/components/billing/ProductModal';
import { InvoiceModal } from '@/components/billing/InvoiceModal';

export default async function BillingPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string, success?: string, interval?: 'month' | 'year' }> 
}) {
  const params = await searchParams;
  const isAnnual = params?.interval === 'year';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const [invoices, products, tiers, workspaceResult, contacts] = await Promise.all([
    getInvoices(workspace.id),
    getProducts(workspace.id),
    getSaaSTiers(),
    supabase.from('workspaces').select('*').eq('id', workspace.id).single(),
    getContactsForInvoicing(workspace.id)
  ]);

  const workspaceData = workspaceResult.data;

  // Calculate actual financial metrics
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount_due || 0), 0);

  const pendingInvoicesCount = invoices
    .filter(inv => inv.status === 'open' || inv.status === 'pending')
    .length;

  const pendingAmount = invoices
    .filter(inv => inv.status === 'open' || inv.status === 'pending')
    .reduce((sum, inv) => sum + Number(inv.amount_due || 0), 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Finance & Billing</h1>
        <p className="mt-2 text-white/50">Manage your workspace subscription, products, and payments.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/3 border-white/5 p-5 sm:p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </Card>

        <Card className="bg-white/3 border-white/5 p-5 sm:p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#6c47ff]/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-[#6c47ff]" />
            </div>
            {pendingInvoicesCount > 0 && (
              <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-[#6c47ff]/20 text-[10px]">
                {pendingInvoicesCount} Pending
              </Badge>
            )}
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Open Invoices</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </Card>

        <Card className="bg-white/3 border-white/5 p-5 sm:p-6 transition-transform hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-400" />
            </div>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Active Products</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{products.length} Items</h3>
        </Card>
      </div>

      {/* Error & Success Messages */}
      {params?.error && (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </div>
          <div className="pt-1">
            <p className="text-red-500 font-bold">Stripe Checkout Error</p>
            <p className="text-sm text-red-500/80 mt-1">
              {params.error === 'missing_price_id' 
                ? "Your Stripe Price IDs are missing in Vercel. Please add 'STRIPE_PRO_PRICE_ID' & 'STRIPE_ENTERPRISE_PRICE_ID' to Vercel." 
                : params.error}
            </p>
          </div>
        </div>
      )}

      {/* SaaS Plan Selector */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#6c47ff]" />
          Platform Subscription
        </h2>
        <BillingPlansToggle 
          tiers={tiers} 
          currentPlanTier={workspaceData?.plan_tier}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Invoices */}
        <div className="lg:col-span-2 space-y-10">
          {/* Recent Invoices */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#6c47ff]" />
                Invoices
              </h2>
              <InvoiceModal workspaceId={workspace.id} contacts={contacts} />
            </div>
            <Card className="bg-white/3 border-white/5 overflow-hidden rounded-[32px]">
              <div className="overflow-x-auto no-scrollbar">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Student / Client</TableHead>
                      <TableHead className="text-white/40 text-[10px] uppercase tracking-widest font-bold hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Amount</TableHead>
                      <TableHead className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                      <TableHead className="text-right text-white/40 text-[10px] uppercase tracking-widest font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-white/20 text-xs font-medium">No invoices generated yet</TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv) => (
                        <TableRow key={inv.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">{inv.contact?.first_name} {inv.contact?.last_name}</span>
                              <span className="text-[10px] text-white/30 sm:hidden">{new Date(inv.created_at).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white/50 font-medium text-xs hidden sm:table-cell">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-white font-black text-sm">${inv.amount_due}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize text-[9px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'border-green-500/20 text-green-400 bg-green-500/10' : 'border-orange-500/20 text-orange-400 bg-orange-500/10'}`}>
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 group-hover:text-white group-hover:bg-white/5 rounded-lg">
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Products & Quick Actions */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-[#6c47ff]" />
                Products
              </h2>
              <ProductModal workspaceId={workspace.id} />
            </div>

            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="py-10 text-center bg-white/3 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-white/20 text-xs">No products listed</p>
                </div>
              ) : (
                products.map((prod) => (
                  <Card key={prod.id} className="bg-white/3 border-white/5 hover:bg-white/5 transition-all p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{prod.name}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">{prod.type}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-extrabold text-[#6c47ff]">${prod.price}</span>
                          <form action={async () => {
                            'use server';
                            await deleteProduct(prod.id);
                          }}>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-md">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </div>
                      </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
