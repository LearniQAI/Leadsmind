import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getInvoices, getProducts, getSaaSTiers } from '@/app/actions/finance';
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

export default async function BillingPage() {
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
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">+12.5%</Badge>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Revenue</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">$4,250.00</h3>
        </Card>

        <Card className="bg-white/3 border-white/5 p-5 sm:p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#6c47ff]/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-[#6c47ff]" />
            </div>
            <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-[#6c47ff]/20 text-[10px]">8 Pending</Badge>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Open Invoices</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">$1,120.00</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: SaaS Tiers & Connect */}
        <div className="lg:col-span-2 space-y-10">
          {/* Stripe Connect Card */}
          <Card className="bg-linear-to-br from-[#6c47ff]/20 to-transparent border-[#6c47ff]/20 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Stripe Connect</CardTitle>
                <CardDescription className="text-white/60">Connect your account to start accepting payments from your students and clients.</CardDescription>
              </div>
              <DollarSign className="h-10 w-10 text-[#6c47ff]/40" />
            </CardHeader>
            <CardContent>
              {workspaceData?.stripe_connect_id ? (
                <div className="flex items-center gap-3 text-green-400 font-bold bg-green-400/10 p-4 rounded-2xl border border-green-400/20">
                  <CheckCircle2 className="h-5 w-5" />
                  Stripe connected (Account: {workspaceData.stripe_connect_id})
                </div>
              ) : (
                <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white gap-2 font-bold px-8 h-12 rounded-xl">
                  Connect Stripe Account
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* SaaS Plan Selector */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#6c47ff]" />
              Platform Subscription
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <Card key={tier.id} className={`bg-white/3 border-white/5 relative overflow-hidden flex flex-col ${workspaceData?.plan_tier === tier.id ? 'ring-2 ring-[#6c47ff] border-transparent' : ''}`}>
                  {workspaceData?.plan_tier === tier.id && (
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
                  <CardContent className="pt-0">
                    <Button
                      variant={workspaceData?.plan_tier === tier.id ? 'outline' : 'default'}
                      className={`w-full ${workspaceData?.plan_tier === tier.id ? 'border-white/10 text-white/40' : 'bg-[#6c47ff] hover:bg-[#5b3ce0]'}`}
                      disabled={workspaceData?.plan_tier === tier.id}
                    >
                      {workspaceData?.plan_tier === tier.id ? 'Active' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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
