"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Tag as TagIcon, 
  Clock, 
  UserPlus, 
  ArrowRight,
  Settings,
  MoreVertical,
  ChevronDown,
  Play,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { updateWorkflow } from '@/app/actions/automation';
import { createClient } from '@/lib/supabase/client';

interface Step {
  id: string;
  type: string;
  config: any;
  position: number;
}

export function LinearWorkflowBuilder({ workflowId, initialWorkflow }: { workflowId: string, initialWorkflow: any }) {
  const supabase = createClient();
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSteps();
  }, [workflowId]);

  const fetchSteps = async () => {
    const { data } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('position', { ascending: true });
    
    setSteps(data || []);
    setLoading(false);
  };

  const saveWorkflow = async () => {
    setSaving(true);
    try {
      // 1. Update workflow trigger
      await updateWorkflow(workflowId, {
        trigger_type: workflow.trigger_type,
        trigger_config: workflow.trigger_config
      });

      // 2. Sync steps (simplistic: delete and recreate for this MVP)
      // In a real app we'd do a batch upsert/delete
      await supabase.from('workflow_steps').delete().eq('workflow_id', workflowId);
      
      const stepsToInsert = steps.map((s, idx) => ({
        workflow_id: workflowId,
        workspace_id: workflow.workspace_id,
        position: idx + 1,
        type: s.type,
        config: s.config
      }));

      if (stepsToInsert.length > 0) {
        await supabase.from('workflow_steps').insert(stepsToInsert);
      }

      toast.success("Workflow saved successfully");
    } catch (error) {
      toast.error("Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  const addStep = (type: string, atIndex: number) => {
    const newStep: Step = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: {},
      position: atIndex + 1
    };

    const newSteps = [...steps];
    newSteps.splice(atIndex, 0, newStep);
    setSteps(newSteps.map((s, i) => ({ ...s, position: i + 1 })));
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id).map((s, i) => ({ ...s, position: i + 1 })));
  };

  const updateStepConfig = (id: string, config: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, config: { ...s.config, ...config } } : s));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Loading logic engine...</p>
    </div>
  );

  return (
    <div className="flex h-full bg-[#050505] text-white font-sans selection:bg-white/10">
      {/* TRIGGER PANEL (LEFT) - Industrial Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#08080f] p-8 flex flex-col gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50 italic">Workflow Trigger</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">Input Source</label>
              <Select 
                value={workflow.trigger_type} 
                onValueChange={(v) => setWorkflow({ ...workflow, trigger_type: v })}
              >
                <SelectTrigger className="bg-white/[0.02] border-white/5 h-11 text-[11px] rounded-xl font-bold hover:bg-white/5 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c14] border-white/10 text-white">
                  <SelectItem value="contact_created">New Lead Created</SelectItem>
                  <SelectItem value="tag_added">Tag Applied</SelectItem>
                  <SelectItem value="stage_changed">Logic Variable Change</SelectItem>
                  <SelectItem value="form_submitted">Capture Form Submit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {workflow.trigger_type === 'tag_added' && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                 <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1">Observation Tag</label>
                 <Input 
                   placeholder="Enter identifier..." 
                   className="bg-white/[0.02] border-white/5 h-11 text-[11px] rounded-xl font-bold focus:border-white/20"
                   value={workflow.trigger_config.tag || ''}
                   onChange={(e) => setWorkflow({...workflow, trigger_config: { ...workflow.trigger_config, tag: e.target.value }})}
                 />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
           <Button 
             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-2xl shadow-2xl shadow-blue-600/10 gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
             onClick={saveWorkflow}
             disabled={saving}
           >
             {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
             <span className="uppercase tracking-[0.1em]">Commit Changes</span>
           </Button>
           <p className="text-[9px] text-center text-white/10 font-bold uppercase tracking-widest italic">Manual Save Mode Enabled</p>
        </div>
      </aside>

      {/* WORKFLOW STEPS (CENTER) - Clean Logic List */}
      <main className="flex-1 overflow-y-auto p-16 scrollbar-thin scrollbar-thumb-white/5">
        <div className="max-w-xl mx-auto flex flex-col items-center">
            
            {/* START INDICATOR */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <div className="h-12 w-12 rounded-[20px] bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/20 shadow-xl group-hover:text-white transition-colors">
                <Play size={18} fill="currentColor" className="opacity-40" />
              </div>
              <div className="h-10 w-px bg-white/5" />
            </div>

            {/* STEPS LIST */}
            <div className="w-full space-y-4">
              {steps.length === 0 && (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-[40px] flex flex-col items-center gap-6 bg-white/[0.01]">
                   <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <Plus className="text-white/5" size={40} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Logic Engine Idle</p>
                     <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Append an instruction to begin</p>
                   </div>
                </div>
              )}

              {steps.map((step, index) => (
                <div key={step.id} className="group relative">
                  <Card className="bg-[#0c0c14] border-white/5 hover:border-white/10 transition-all p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-white/[0.02]" />
                    
                    <div className="flex items-center justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all">
                           {getIconForStep(step.type)}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 italic">Instruction Point {index + 1}</span>
                           <h4 className="text-base font-black text-white uppercase tracking-tight italic">{step.type.replace('_', ' ')}</h4>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="h-9 w-9 text-white/5 hover:text-rose-500 hover:bg-rose-500/5 transition-all">
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 px-1">
                        {renderStepConfig(step, updateStepConfig)}
                    </div>
                  </Card>

                  {/* Connector and Add Button */}
                  <div className="flex justify-center -mb-4 pt-6 pb-6">
                    <div className="h-16 w-px bg-white/5 group-hover:bg-white/10 transition-colors relative">
                        <AddStepPopover onSelect={(type) => addStep(type, index + 1)} />
                    </div>
                  </div>
                </div>
              ))}

              {steps.length > 0 && (
                <div className="flex flex-col items-center pt-6">
                    <div className="h-12 w-px bg-gradient-to-b from-white/5 to-transparent" />
                    <div className="h-2 w-2 rounded-full border border-white/10 mt-4 animate-pulse" />
                </div>
              )}

              {/* Initial Add Button if list is empty */}
              {steps.length === 0 && (
                   <div className="flex justify-center pt-8">
                     <AddStepPopover onSelect={(type) => addStep(type, 0)} isInitial />
                   </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
}

function AddStepPopover({ onSelect, isInitial = false }: { onSelect: (type: string) => void, isInitial?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { type: 'send_email', label: 'Send Email', icon: <Mail size={14} /> },
    { type: 'send_sms', label: 'Send SMS', icon: <MessageSquare size={14} /> },
    { type: 'add_tag', label: 'Add Tag', icon: <TagIcon size={14} /> },
    { type: 'wait', label: 'Delay', icon: <Clock size={14} /> },
  ];

  return (
    <div className={`relative ${isInitial ? '' : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}`}>
      <Button 
        variant="outline" 
        size="icon" 
        className={`h-7 w-7 rounded-full bg-[#0c0c12] border-white/10 hover:border-white/40 hover:text-white transition-all z-10`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus size={14} className={isOpen ? 'rotate-45' : ''} />
      </Button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-10 w-48 bg-[#0c0c14] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
           <div className="text-[9px] font-black uppercase tracking-widest text-white/10 px-3 py-2 mb-1">Logic Instructions</div>
           {actions.map(action => (
             <button
               key={action.type}
               onClick={() => { onSelect(action.type); setIsOpen(false); }}
               className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left transition-colors group/item"
             >
               <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-white/40 group-hover/item:text-white group-hover/item:border-white/10 transition-all">
                 {action.icon}
               </div>
               <span className="text-[11px] font-bold text-white/60 group-hover/item:text-white transition-colors uppercase tracking-tight italic">{action.label}</span>
             </button>
           ))}
        </div>
      )}
    </div>
  );
}

function getIconForStep(type: string) {
  switch(type) {
    case 'send_email': return <Mail size={16} className="text-blue-400" />;
    case 'send_sms': return <MessageSquare size={16} className="text-emerald-400" />;
    case 'add_tag': return <TagIcon size={16} className="text-orange-400" />;
    case 'wait': return <Clock size={16} className="text-yellow-400" />;
    default: return <Settings size={16} className="text-white/40" />;
  }
}

function renderStepConfig(step: Step, update: (id: string, config: any) => void) {
  switch(step.type) {
    case 'send_email':
      return (
        <div className="space-y-3">
          <Input 
            placeholder="Email Subject" 
            className="h-9 bg-white/[0.03] border-white/5 text-xs rounded-lg"
            value={step.config.subject || ''}
            onChange={(e) => update(step.id, { subject: e.target.value })}
          />
          <textarea 
            placeholder="Email Body (Markdown supported)"
            className="w-full min-h-[100px] bg-white/[0.03] border border-white/5 rounded-lg p-3 text-xs text-white/60 focus:outline-none focus:border-blue-500/50 transition-colors"
            value={step.config.body || ''}
            onChange={(e) => update(step.id, { body: e.target.value })}
          />
        </div>
      );
    case 'wait':
      return (
        <div className="flex items-center gap-3">
           <Input 
             type="number"
             className="h-9 w-20 bg-white/[0.03] border-white/5 text-xs rounded-lg"
             value={step.config.delayValue || 1}
             onChange={(e) => update(step.id, { delayValue: e.target.value })}
           />
           <Select 
             value={step.config.delayUnit || 'minutes'}
             onValueChange={(v) => update(step.id, { delayUnit: v })}
           >
             <SelectTrigger className="h-9 bg-white/[0.03] border-white/5 text-xs rounded-lg">
               <SelectValue />
             </SelectTrigger>
             <SelectContent className="bg-[#0c0c14] border-white/10 text-white">
               <SelectItem value="minutes">Minutes</SelectItem>
               <SelectItem value="hours">Hours</SelectItem>
               <SelectItem value="days">Days</SelectItem>
             </SelectContent>
           </Select>
        </div>
      );
    case 'add_tag':
      return (
        <Input 
          placeholder="Tag name to add" 
          className="h-9 bg-white/[0.03] border-white/5 text-xs rounded-lg"
          value={step.config.tag || ''}
          onChange={(e) => update(step.id, { tag: e.target.value })}
        />
      );
    default:
      return <p className="text-[10px] text-white/20">No configuration required.</p>;
  }
}
