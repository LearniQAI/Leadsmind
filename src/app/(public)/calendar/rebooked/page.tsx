import { CheckCircle2, Sparkles, CalendarDays, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RebookedSuccessPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-[#6c47ff]/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,transparent_50%)] pointer-events-none opacity-40" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-700 text-center">
        <div className="h-20 w-20 rounded-3xl bg-[#6c47ff]/10 border border-[#6c47ff]/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(108,71,255,0.2)]">
           <CheckCircle2 className="h-10 w-10 text-[#6c47ff]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6c47ff]/5 border border-[#6c47ff]/10 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-[#6c47ff] fill-[#6c47ff]" />
          <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.2em]">Priority Rebooked</span>
        </div>

        <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase mb-4">You're All <span className="text-[#6c47ff]">Set</span>!</h1>
        <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed">
          We've successfully updated your appointment. No need to fill out any forms — your data is securely synced with our team.
        </p>

        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 mb-8 relative overflow-hidden group">
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6c47ff]/30 to-transparent" />
           
           <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#6c47ff]/10 transition-colors">
                <CalendarDays className="h-6 w-6 text-white/40 group-hover:text-[#6c47ff] transition-colors" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Confirmation</span>
                 <span className="text-sm font-bold text-white tracking-tight">Syncing to your calendar...</span>
              </div>
           </div>
        </div>

        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] mb-4">Powered by Leadsmind Intelligence</p>
      </main>
    </div>
  );
}
