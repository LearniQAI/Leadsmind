'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, ChevronRight, Zap, Target as TargetIcon, Clock, Users, Workflow, GitGraph } from 'lucide-react';
import { createOutcome } from '@/app/actions/calendar';
import { toast } from 'sonner';

interface Outcome {
  id: string;
  label: string;
  description: string;
  duration_minutes: number;
}

interface OutcomeManagerProps {
  calendarId: string;
  initialOutcomes: Outcome[];
}

export function OutcomeManager({ calendarId, initialOutcomes }: OutcomeManagerProps) {
  const [outcomes, setOutcomes] = useState<Outcome[]>(initialOutcomes);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const handleAdd = async () => {
    if (!newLabel) return;
    const res = await createOutcome({ calendarId, label: newLabel });
    if (res.success && res.data) {
      setOutcomes([...outcomes, res.data as any]);
      setNewLabel('');
      setIsAdding(false);
      toast.success('Outcome added successfully');
    } else {
      toast.error('Failed to add outcome');
    }
  };

  return (
    <div className="bg-[#0b0b14] border border-white/5 rounded-3xl p-8 mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <Target className="h-4 w-4 text-[#fdab3d]" />
             <span className="text-[10px] font-black text-[#fdab3d] uppercase tracking-[0.2em]">Outcome-Based Routing</span>
           </div>
           <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Booking Outcomes</h3>
           <p className="text-white/40 text-sm">Define what contacts can achieve and how they are routed.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)} 
          className="bg-white/5 hover:bg-[#6c47ff] text-white rounded-xl gap-2 font-bold border border-white/5 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Add Outcome
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outcomes.map((outcome) => (
          <div key={outcome.id} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#6c47ff]/30 transition-all duration-500">
             <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white group-hover:text-[#6c47ff] transition-colors uppercase italic tracking-wider">{outcome.label}</span>
                <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-bold text-white/40">{outcome.duration_minutes} MIN</Badge>
             </div>
             
             <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/3">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/3 border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                   <Users className="h-3 w-3" /> Round Robin
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/3 border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                   <Workflow className="h-3 w-3" /> Automation
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#fdab3d]/5 border border-[#fdab3d]/20 text-[9px] font-bold text-[#fdab3d] uppercase tracking-widest">
                   <GitGraph className="h-3 w-3" /> Pipeline
                </div>
             </div>
          </div>
        ))}
        
        {isAdding && (
          <div className="p-6 rounded-2xl bg-[#6c47ff]/5 border border-[#6c47ff]/30 animate-in zoom-in duration-300">
             <Input 
                id="outcome-label-input"
                autoFocus
                placeholder="Outcome Label (e.g. Sales Demo)" 
                className="bg-black/20 border-white/10 text-white mb-4 h-11"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
             />
             <div className="flex gap-2">
                <Button id="save-outcome-btn" onClick={handleAdd} size="sm" className="bg-[#6c47ff] text-white rounded-lg flex-1 font-bold">Save Outcome</Button>
                <Button id="cancel-outcome-btn" onClick={() => setIsAdding(false)} size="sm" variant="ghost" className="text-white/40 hover:text-white rounded-lg px-4 font-bold">Cancel</Button>
             </div>
          </div>
        )}
      </div>

      {!outcomes.length && !isAdding && (
        <div className="p-12 border border-dashed border-white/5 rounded-2xl text-center">
           <Zap className="h-8 w-8 text-white/10 mx-auto mb-4" />
           <p className="text-sm font-bold text-white/20 uppercase tracking-widest">No outcomes defined yet</p>
        </div>
      )}
    </div>
  );
}
