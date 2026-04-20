'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Link2, 
  RefreshCcw, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  CloudLightning,
  Loader2,
  Table
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { startMigrationJob, importTransactions } from '@/app/actions/accountant';
import { toast } from 'sonner';

export default function MigrationHub({ workspaceId, initialData }: { workspaceId: string, initialData: any[] }) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isMapping, setIsMapping] = useState(false);
  const [jobs, setJobs] = useState(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sources = [
    { id: 'sage', name: 'Sage Cloud', icon: CloudLightning, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'xero', name: 'Xero Accounting', icon: Link2, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { id: 'qbo', name: 'QuickBooks (QBO)', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
    { id: 'excel', name: 'Excel / CSV', icon: FileSpreadsheet, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const handleStartMigration = async () => {
    if (!selectedSource) return;

    if (selectedSource === 'excel') {
        fileInputRef.current?.click();
        return;
    }

    try {
      setIsMapping(true);
      const res = await startMigrationJob(workspaceId, selectedSource);
      setJobs([res, ...jobs]);
      toast.success(`Active sync established with ${selectedSource.toUpperCase()}`);
    } catch (e) {
      toast.error("Cloud connection failed. Please retry.");
    } finally {
      setTimeout(() => setIsMapping(false), 2000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsMapping(true);
      const text = await file.text();
      const lines = text.split('\n');
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const [date, description, amount, category] = line.split(',');
          return { date: date?.trim(), description: description?.trim(), amount: amount?.trim(), category: category?.trim() };
      });

      if (data.length === 0) throw new Error("File is empty or invalid format");

      await importTransactions(workspaceId, data);
      const res = await startMigrationJob(workspaceId, 'excel');
      setJobs([res, ...jobs]);
      toast.success(`Migration completed. ${data.length} transactions imported.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to parse CSV. Check format: Date,Description,Amount,Category");
    } finally {
      setIsMapping(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeJob = jobs[0];

  return (
    <div className="space-y-8">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv,.txt"
        className="hidden" 
      />

      {/* Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => setSelectedSource(source.id)}
            className={cn(
                "p-8 rounded-3xl border transition-all duration-500 text-left space-y-6 group",
                selectedSource === source.id 
                  ? "bg-primary/5 border-primary shadow-2xl shadow-primary/20" 
                  : "bg-[#0b0b15] border-white/5 hover:border-white/10"
            )}
          >
             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", source.bg)}>
                <source.icon className={source.color} size={28} />
             </div>
             <div className="space-y-1">
                <h4 className="font-black text-white tracking-tight uppercase leading-none">{source.name}</h4>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2 group-hover:text-white/40 transition-colors italic">Click to Map Data</p>
             </div>
          </button>
        ))}
      </div>

      {/* Migration Wizard */}
      <Card className="bg-[#0b0b15] border-white/5 p-12 rounded-3xl relative overflow-hidden">
        {selectedSource ? (
          <div className="max-w-2xl mx-auto space-y-12 relative z-10">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <UploadCloud size={40} className="text-primary animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight uppercase">Bulk Import from {selectedSource.toUpperCase()}</h3>
                <p className="text-white/40 font-bold max-w-sm mx-auto leading-relaxed">
                    {selectedSource === 'excel' 
                        ? "Upload your file to map transactions instantly. Expected format: Date, Description, Amount, Category (sale/expense)." 
                        : "LeadsMind will automatically map your Chart of Accounts, Contacts, and Opening Balances."
                    }
                </p>
             </div>

             <div className="space-y-8 p-10 bg-white/[0.02] border border-white/5 rounded-[40px]">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest leading-none">
                      <span className="text-white/20">Data Mapping</span>
                      <span className="text-primary">{isMapping ? "Syncing..." : activeJob?.status === 'mapping' ? "Mapping in Progress" : "Ready to Sync"}</span>
                   </div>
                   <Progress value={isMapping ? 30 : activeJob?.status === 'mapping' ? 45 : 0} className="h-1 bg-white/5 shadow-[0_0_20px_rgba(108,71,255,0.2)]" />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   {[
                     { name: 'Identifying Table Structure', status: isMapping ? 'loading' : activeJob ? 'done' : 'pending' },
                     { name: 'Mapping Expense Categories', status: activeJob?.status === 'mapping' ? 'loading' : activeJob?.status === 'completed' ? 'done' : 'pending' },
                     { name: 'Injecting Historical Ledger', status: activeJob?.status === 'completed' ? 'done' : 'pending' },
                   ].map((step, i) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                               "w-2 h-2 rounded-full",
                               step.status === 'done' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
                               step.status === 'loading' ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(108,71,255,0.5)]" : "bg-white/10"
                           )} />
                           <span className={cn(
                               "text-xs font-black uppercase tracking-widest",
                               step.status === 'pending' ? "text-white/20" : "text-white"
                           )}>{step.name}</span>
                        </div>
                        {step.status === 'done' && <CheckCircle2 className="text-emerald-500" size={14} />}
                        {step.status === 'loading' && <Loader2 className="text-primary animate-spin" size={14} />}
                     </div>
                   ))}
                </div>

                <Button 
                    onClick={handleStartMigration}
                    disabled={isMapping || !selectedSource}
                    className="w-full h-16 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-[#6c47ff]/40 group"
                >
                   {isMapping ? <Loader2 className="animate-spin" /> : (
                       <>
                       {selectedSource === 'excel' ? 'Upload & Import' : 'Start Automated Migration'}
                       <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </>
                   )}
                </Button>
             </div>
          </div>
        ) : (
          <div className="py-24 text-center space-y-6 opacity-40">
             <RefreshCcw size={48} className="mx-auto text-white" />
             <p className="font-black text-xs uppercase tracking-[0.3em]">Select a data source to begin your intelligence migration</p>
          </div>
        )}
      </Card>
      
      {/* Migration History */}
      {jobs.length > 0 && (
          <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl">
             <div className="flex items-center gap-3 mb-8">
                <Table size={20} className="text-white/20" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Sync History</h4>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {jobs.map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] group hover:bg-white/[0.02] transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                                <RefreshCcw size={18} className="text-white/40" />
                            </div>
                            <div>
                                <h5 className="font-black text-white uppercase tracking-tight tracking-[0.05em]">{job.source_system.toUpperCase()} Sync</h5>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mt-1">{new Date(job.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                    job.status === 'completed' || job.source_system === 'excel' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                    job.status === 'mapping' ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/20"
                                )}>
                                    {job.source_system === 'excel' ? 'COMPLETED' : job.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </Card>
      )}

      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-6">
            <AlertCircle className="text-amber-500 shrink-0" />
            <div className="space-y-1">
               <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Opening Balances</h4>
               <p className="text-xs text-white/40 leading-relaxed font-bold italic">Remember: For accurate SARS reporting, we need your trial balance as of the last day of your previous fiscal year.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
