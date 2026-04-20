import { getCurrentWorkspace } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
   Sparkles,
   TrendingUp,
   AlertCircle,
   Calendar,
   Calculator,
   UserCircle,
   Home,
   Landmark,
   Package,
   RefreshCcw,
   Target
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProvisionalTaxCalculator from "@/components/accountant/ProvisionalTaxCalculator";
import DirectorLoanTracker from "@/components/accountant/DirectorLoanTracker";
import HomeOfficeCalculator from "@/components/accountant/HomeOfficeCalculator";
import LoanManager from "@/components/accountant/LoanManager";
import InventoryDashboard from "@/components/accountant/InventoryDashboard";
import MigrationHub from "@/components/accountant/MigrationHub";
import {
   getAccountantOnboarding,
   getProvisionalTaxRecords,
   getDirectorLoans,
   getHomeOfficeSetup,
   getBusinessLoans,
   getRecentTransactions,
   getInventory,
   getMigrationJobs,
   getAIAlerts,
   getComplianceDeadlines,
   generateIntelligence,
   getBusinessGoals,
   updateGoalProgress,
   getFinancialSummary
} from "@/app/actions/accountant";
import { cn } from "@/lib/utils";
import AIAdvisorFeed from "@/components/accountant/AIAdvisorFeed";
import StrategyHub from "@/components/accountant/StrategyHub";

export default async function AccountantDashboardPage() {
   const supabase = await createServerClient();
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) redirect("/login");

   const workspace = await getCurrentWorkspace(session.user);
   if (!workspace) redirect("/dashboard");

   // Trigger scanners
   await Promise.all([
      generateIntelligence(workspace.id),
      updateGoalProgress(workspace.id)
   ]);

   // Fetch all data in parallel
   const [
      onboarding,
      provisionalTax,
      directorLoans,
      homeOffice,
      businessLoans,
      recentTransactions,
      inventoryItems,
      migrationJobs,
      aiAlerts,
      deadlines,
      businessGoals,
      financialSummary
   ] = await Promise.all([
      getAccountantOnboarding(workspace.id),
      getProvisionalTaxRecords(workspace.id),
      getDirectorLoans(workspace.id),
      getHomeOfficeSetup(workspace.id),
      getBusinessLoans(workspace.id),
      getRecentTransactions(workspace.id),
      getInventory(workspace.id),
      getMigrationJobs(workspace.id),
      getAIAlerts(workspace.id),
      getComplianceDeadlines(workspace.id),
      getBusinessGoals(workspace.id),
      getFinancialSummary(workspace.id)
   ]);

   const netProfit = financialSummary.netProfit;

   return (
      <div className="space-y-10 animate-in fade-in duration-700 max-w-full overflow-x-hidden">
         {/* Header */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-[#6c47ff]">
               <Sparkles className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Compliance & Accounting Engine</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase leading-none italic">Intelligence Layer</h1>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">South African Statutory Monitoring & Tax Efficiency</p>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
            <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl space-y-4 hover:border-[#6c47ff]/30 transition-all">
               <div className="flex items-center justify-between">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Net Profit</span>
               </div>
               <div className="space-y-1">
                  <span className={cn(
                     "text-3xl font-black tracking-tight leading-none",
                     netProfit >= 0 ? "text-white" : "text-rose-500"
                  )}>R{netProfit.toLocaleString()}</span>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Fiscal Year to Date</p>
               </div>
            </Card>

            <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl space-y-4 shadow-xl shadow-amber-500/5">
               <div className="flex items-center justify-between">
                  <AlertCircle className="text-amber-500" size={20} />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Provisional Liability</span>
               </div>
               <div className="space-y-1">
                  <span className="text-3xl font-black text-white tracking-tight leading-none">R{provisionalTax[0]?.estimated_tax_liability?.toLocaleString() || '0.00'}</span>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Next Deadline: August 31</p>
               </div>
            </Card>

            <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl space-y-4">
               <div className="flex items-center justify-between">
                  <Calendar className="text-sky-500" size={20} />
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">Active Loans</span>
               </div>
               <div className="space-y-1">
                  <span className="text-3xl font-black text-white tracking-tight leading-none">{businessLoans.length}</span>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Monitoring Debt Repayment</p>
               </div>
            </Card>
         </div>

         {/* Proactive Advisor Feed */}
         <AIAdvisorFeed alerts={aiAlerts} deadlines={deadlines} />

         {/* Intelligence Tabs */}
         <Tabs defaultValue="strategy" className="space-y-8 w-full max-w-full overflow-x-hidden">
            <div className="grid grid-cols-1 w-full overflow-hidden relative group/tabs">
               {/* Fade Indicators */}
               <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#030308] to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
               <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#030308] to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
               
               <TabsList className="bg-[#0b0b15] border border-white/5 h-14 p-1 rounded-2xl flex items-center justify-start overflow-x-auto no-scrollbar gap-1 flex-nowrap scroll-smooth w-full min-w-0">
                  <TabsTrigger value="strategy" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <Target size={14} /> Strategy & Goals
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <Calculator size={14} /> Tax Compliance
                  </TabsTrigger>
                  <TabsTrigger value="governance" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <UserCircle size={14} /> Director & Owner
                  </TabsTrigger>
                  <TabsTrigger value="operations" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <Home size={14} /> Office & Assets
                  </TabsTrigger>
                  <TabsTrigger value="debt" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <Landmark size={14} /> Loan Management
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <Package size={14} /> Inventory
                  </TabsTrigger>
                  <TabsTrigger value="migration" className="data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] px-5 h-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap shrink-0">
                     <RefreshCcw size={14} /> Migrations
                  </TabsTrigger>
               </TabsList>
            </div>

            <div className="mt-8">
               <TabsContent value="strategy" className="focus-visible:outline-none focus-visible:ring-0">
                  <StrategyHub workspaceId={workspace.id} goals={businessGoals} />
               </TabsContent>
               <TabsContent value="tax" className="focus-visible:outline-none focus-visible:ring-0">
                  <ProvisionalTaxCalculator workspaceId={workspace.id} initialData={provisionalTax} />
               </TabsContent>
               <TabsContent value="governance" className="focus-visible:outline-none focus-visible:ring-0">
                  <DirectorLoanTracker workspaceId={workspace.id} initialData={directorLoans[0]} transactions={recentTransactions} />
               </TabsContent>
               <TabsContent value="operations" className="focus-visible:outline-none focus-visible:ring-0">
                  <HomeOfficeCalculator workspaceId={workspace.id} initialData={homeOffice} />
               </TabsContent>
               <TabsContent value="debt" className="focus-visible:outline-none focus-visible:ring-0">
                  <LoanManager workspaceId={workspace.id} initialData={businessLoans} />
               </TabsContent>
               <TabsContent value="inventory" className="focus-visible:outline-none focus-visible:ring-0">
                  <InventoryDashboard workspaceId={workspace.id} initialData={inventoryItems} />
               </TabsContent>
               <TabsContent value="migration" className="focus-visible:outline-none focus-visible:ring-0">
                  <MigrationHub workspaceId={workspace.id} initialData={migrationJobs} />
               </TabsContent>
            </div>
         </Tabs>

         {/* Global Transaction Ledger */}
         <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl space-y-8 mt-12">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Intelligence Audit Trail</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Global Transaction Ledger & Historical Records</p>
               </div>
               <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total Records: {recentTransactions.length}</span>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-white/5">
                        <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Date</th>
                        <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Description</th>
                        <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Category</th>
                        <th className="pb-6 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {recentTransactions.map((tx, i) => (
                        <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                           <td className="py-5 text-xs font-bold text-white/40 uppercase tracking-tighter">{new Date(tx.date || tx.created_at).toLocaleDateString()}</td>
                           <td className="py-5">
                              <div className="flex items-center gap-3">
                                 <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    tx.source_type === 'revenue' ? "bg-emerald-500" : "bg-rose-500"
                                 )} />
                                 <span className="font-black text-white tracking-tight uppercase text-sm">{tx.description}</span>
                              </div>
                           </td>
                           <td className="py-5">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{tx.source_type}</span>
                           </td>
                           <td className="py-5 text-right font-black text-white tracking-tight">
                              R{parseFloat(tx.total_amount).toLocaleString()}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {recentTransactions.length === 0 && (
                  <div className="py-20 text-center opacity-30 select-none">
                     <Calculator size={48} className="mx-auto mb-4" />
                     <p className="font-black uppercase tracking-widest text-xs">Awaiting data injection via migration hub</p>
                  </div>
               )}
            </div>
         </Card>
      </div>
   );
}
