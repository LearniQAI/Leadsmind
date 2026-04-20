"use client";

import { saveAdaptiveRule } from '@/app/actions/lms';
import { 
  ArrowUpRight, 
  BookOpen, 
  Loader2, 
  Lock, 
  History, 
  Settings2, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AdaptivePathEditor({ quizId }: { quizId: string }) {
   const [activePath, setActivePath] = useState<'advanced' | 'normal' | 'remedial'>('advanced');
   const [isSyncing, setIsSyncing] = useState(false);
   const [rules, setRules] = useState<any>({
      advanced: { min: 85, max: 100, actions: ['enroll_advanced', 'skip_intro', 'email_elite'] },
      normal: { min: 60, max: 84, actions: [] },
      remedial: { min: 0, max: 59, actions: ['lock_content', 'enroll_support', 'email_remedial'] }
   });

   const handleSync = async () => {
      setIsSyncing(true);
      try {
         // Saving all 3 paths in real-time
         await Promise.all([
            saveAdaptiveRule(quizId, { min_score: 85, max_score: 100, actions: rules.advanced.actions }),
            saveAdaptiveRule(quizId, { min_score: 60, max_score: 84, actions: rules.normal.actions }),
            saveAdaptiveRule(quizId, { min_score: 0, max_score: 59, actions: rules.remedial.actions })
         ]);
         toast.success('Neural Learning Paths Synchronized');
      } catch (e) {
         toast.error('Path Synchronization Failed');
      } finally {
         setIsSyncing(false);
      }
   };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="bg-[#0b0b14] border border-white/5 rounded-[40px] p-2 flex gap-1 shadow-2xl">
            <PathTab
               label="Elite Performance"
               range={`${rules.advanced.min}% - ${rules.advanced.max}%`}
               variant="advanced"
               active={activePath === 'advanced'}
               onClick={() => setActivePath('advanced')}
            />
            <PathTab
               label="Standard Track"
               range={`${rules.normal.min}% - ${rules.normal.max}%`}
               variant="normal"
               active={activePath === 'normal'}
               onClick={() => setActivePath('normal')}
            />
            <PathTab
               label="Remedial Support"
               range={`${rules.remedial.min}% - ${rules.remedial.max}%`}
               variant="remedial"
               active={activePath === 'remedial'}
               onClick={() => setActivePath('remedial')}
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Active Automations for this Range</h3>
               </div>

               {activePath === 'advanced' && (
                  <>
                     <ActionItem icon={ArrowUpRight} title="Jump-Start Mastery" description="Auto-complete next module" status="Live" />
                     <ActionItem icon={BookOpen} title="Elite Enrollment" description="Auto-enroll in Advanced course" status="Live" />
                  </>
               )}

               {activePath === 'remedial' && (
                  <>
                     <ActionItem icon={Lock} title="Module Quarantine" description="Prevent progression until support" status="Live" variant="remedial" />
                     <ActionItem icon={History} title="Support Loop" description="Auto-enroll in Remedial course" status="Live" variant="remedial" />
                  </>
               )}

               {activePath === 'normal' && (
                  <div className="h-60 rounded-[32px] border border-dashed border-white/5 flex flex-col items-center justify-center text-center p-12">
                     <Settings2 className="h-10 w-10 text-white/10 mb-4" />
                     <p className="text-sm font-bold text-white/20 italic">Standard progression active.</p>
                  </div>
               )}
            </div>

            <div className="lg:col-span-1">
               <div className="bg-[#0b0b14] border border-white/5 rounded-[40px] p-8 space-y-6">
                  <div className="flex items-center gap-3">
                     <Zap className="h-5 w-5 text-amber-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Adaptive Logic</span>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase leading-tight">Conditional triggers will fire instantly on submission.</span>
                     </div>
                  </div>

                  <Button
                     disabled={isSyncing}
                     onClick={handleSync}
                     className="w-full h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black italic uppercase rounded-2xl gap-2"
                  >
                     {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                     Synchronize Paths
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
}

function PathTab({ label, range, active, variant, onClick }: any) {
   return (
      <button
         onClick={onClick}
         className={cn(
            "flex-1 p-6 rounded-[32px] transition-all duration-500 text-left relative overflow-hidden group",
            active ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
         )}
      >
         {active && (
            <div className={cn(
               "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full",
               variant === 'advanced' ? "bg-emerald-500" : variant === 'remedial' ? "bg-rose-500" : "bg-[#6c47ff]"
            )} />
         )}
         <div className="flex flex-col gap-1 items-start">
            <span className={cn(
               "text-[9px] font-black uppercase tracking-[0.2em]",
               variant === 'advanced' ? "text-emerald-500" : variant === 'remedial' ? "text-rose-500" : "text-[#6c47ff]"
            )}>{range}</span>
            <h4 className={cn(
               "text-sm font-black italic uppercase transition-colors",
               active ? "text-white" : "text-white/20 group-hover:text-white/40"
            )}>{label}</h4>
         </div>
      </button>
   );
}

function ActionItem({ icon: Icon, title, description, status, variant }: any) {
   return (
      <div className="bg-[#0b0b14]/50 border border-white/5 rounded-[32px] p-6 flex items-center justify-between group hover:border-white/10 transition-all">
         <div className="flex items-center gap-6">
            <div className={cn(
               "h-12 w-12 rounded-2xl flex items-center justify-center border",
               variant === 'remedial'
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            )}>
               <Icon className="h-6 w-6" />
            </div>
            <div>
               <h4 className="text-sm font-black text-white italic uppercase tracking-tighter mb-1">{title}</h4>
               <p className="text-[10px] text-white/30 font-medium">{description}</p>
            </div>
         </div>
         <Badge className={cn(
            "rounded-lg px-3 py-1 font-black italic uppercase text-[9px]",
            variant === 'remedial' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
         )}>
            {status}
         </Badge>
      </div>
   );
}
