import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getInvoices, getProducts, getSaaSTiers, createCheckoutSession, getStripeConnectUrl } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  ExternalLink,
  Plus,
  Receipt,
  Package,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes } from '@/lib/utils'; // Reusing for numbers or adding formatCurrency
import { getCurrentWorkspace } from '@/lib/auth';

export default async function BillingPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const [invoices, products, tiers, workspaceResult] = await Promise.all([
    getInvoices(workspace.id),
    getProducts(workspace.id),
    getSaaSTiers(),
    supabase.from('workspaces').select('*').eq('id', workspace.id).single()
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
      {searchParams?.error && (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </div>
          <div className="pt-1">
            <p className="text-red-500 font-bold">Stripe Checkout Error</p>
            <p className="text-sm text-red-500/80 mt-1">
              {searchParams.error === 'missing_price_id' 
                ? "Your Stripe Price IDs are missing in Vercel. Please add 'STRIPE_PRO_PRICE_ID' & 'STRIPE_ENTERPRISE_PRICE_ID' to Vercel." 
                : searchParams.error}
            </p>
          </div>
        </div>
      )}

      {/* SaaS Plan Selector - Full Width Section */}
      <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#6c47ff]" />
              Platform Subscription
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const isCurrentPlan = workspaceData?.plan_tier === tier.id || (workspaceData?.plan_tier === 'free' && tier.id === 'starter');
                return (
                <Card key={tier.id} className={`bg-white/3 border-white/5 relative overflow-hidden flex flex-col ${isCurrentPlan ? 'ring-2 ring-[#6c47ff] border-transparent' : ''}`}>
                  {isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-[#6c47ff] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                      Current Plan
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold text-white">${tier.price}</span>
                      <span className="text-white/40 text-sm">/mo</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                          <CheckCircle2 className="h-4 w-4 text-[#6c47ff] mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardContent className="pt-0 pb-6 mt-auto">
                    <div className="flex flex-col gap-3">
                      <form action={createCheckoutSession.bind(null, tier.id, 'month')}>
                        <Button 
                          type="submit"
                          variant={isCurrentPlan ? 'outline' : 'default'} 
                          className={`w-full py-6 text-sm font-bold ${isCurrentPlan ? 'border-white/10 text-white/40' : 'bg-[#6c47ff] hover:bg-[#5b3ce0]'}`}
                          disabled={isCurrentPlan}
                        >
                          {isCurrentPlan ? 'Active (Monthly)' : (tier.price === 0 ? 'Current Plan' : 'Upgrade Monthly')}
                        </Button>
                      </form>
                      
                      {tier.price > 0 && !isCurrentPlan && (
                        <form action={createCheckoutSession.bind(null, tier.id, 'year')}>
                          <Button 
                            type="submit"
                            variant="secondary"
                            className="w-full py-6 text-sm font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          >
                            Upgrade Annually (Save 20%)
                          </Button>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
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
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/30 hover:text-white bg-white/5 border border-white/10 rounded-lg">
                <Plus className="h-4 w-4" />
              </Button>
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
                      <span className="text-sm font-extrabold text-[#6c47ff]">${prod.price}</span>
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
