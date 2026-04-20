'use client';

import React, { useEffect, useState } from 'react';
import { 
  CloudLightning, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

export function AppointmentBrief({ contactId }: { contactId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrief() {
      const supabase = createClient();
      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setActivities(data || []);
      setLoading(false);
    }
    loadBrief();
  }, [contactId]);

  return (
    <div className="bg-[#0b0b14] border border-white/5 rounded-[40px] p-8 space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <CloudLightning className="h-5 w-5 text-amber-500" />
             </div>
             <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Pre-Meeting <span className="text-white/20">Brief</span></h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Intelligence synthesis of CRM activities</p>
             </div>
          </div>
          <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none font-black italic uppercase text-[9px] px-3">Priority Brief</Badge>
       </div>

       <div className="space-y-6">
          {activities.length > 0 ? (
             <div className="space-y-4">
                {activities.map((act, idx) => (
                   <div key={idx} className="p-5 rounded-[24px] bg-white/[0.02] border border-white/5 flex gap-4 group hover:border-white/10 transition-all">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                         {act.type === 'meeting' ? <Calendar className="h-4 w-4 text-emerald-500" /> : 
                          act.type === 'quiz_passed' ? <Brain className="h-4 w-4 text-[#6c47ff]" /> :
                          <MessageSquare className="h-4 w-4 text-white/20" />}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white italic truncate max-w-[180px]">{act.subject}</span>
                            <span className="text-[9px] font-bold text-white/10 uppercase">{format(new Date(act.created_at), 'dd MMM')}</span>
                         </div>
                         <p className="text-[10px] text-white/40 leading-relaxed italic">{act.description || 'No detailed log provided for this interaction.'}</p>
                      </div>
                   </div>
                ))}
             </div>
          ) : (
             <div className="h-40 flex flex-col items-center justify-center text-center opacity-20">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p className="text-xs font-bold uppercase italic">No historical activities found</p>
             </div>
          )}
       </div>

       <div className="pt-6 border-t border-white/5">
          <div className="p-6 rounded-[32px] bg-linear-to-br from-[#6c47ff]/5 to-transparent border border-[#6c47ff]/10">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[#6c47ff]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Sentiment Insight</span>
             </div>
             <p className="text-[10px] text-white/60 leading-relaxed font-medium">Student has shown high engagement with technical modules but requires clarification on scalability architectures. Priority: Review the last quiz failure points.</p>
          </div>
       </div>
    </div>
  );
}
