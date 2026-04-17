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
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { updateWorkflow, updateWorkflowStatus } from '@/app/actions/automation';
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

  const toggleStatus = async () => {
    const newStatus = !workflow.is_active;
    try {
      const result = await updateWorkflowStatus(workflowId, newStatus);
      if (result.success) {
        setWorkflow({ ...workflow, is_active: newStatus });
        toast.success(`Workflow ${newStatus ? 'activated' : 'deactivated'}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
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
    <div className="flex h-full bg-black text-slate-200">
      {/* TRIGGER PANEL (LEFT) */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-700" />
            <h3 className="text-xs font-semibold text-slate-400">Trigger</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-medium text-slate-500">Source</label>
              <Select 
                value={workflow.trigger_type} 
                onValueChange={(v) => setWorkflow({ ...workflow, trigger_type: v })}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 h-10 text-xs rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <SelectItem value="contact_created">Contact Created</SelectItem>
                  <SelectItem value="tag_added">Tag Applied</SelectItem>
                  <SelectItem value="stage_changed">Stage Changed</SelectItem>
                  <SelectItem value="form_submitted">Form Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(workflow.trigger_type === 'tag_added' || workflow.trigger_type === 'form_submitted') && (
              <div className="space-y-2">
                 <label className="text-[10px] font-medium text-slate-500 text-slate-500">
                   {workflow.trigger_type === 'form_submitted' ? 'Form ID' : 'Tag Name'}
                 </label>
                 <Input 
                   placeholder="Enter ID..." 
                   className="bg-slate-950 border-slate-800 h-10 text-xs rounded-md"
                   value={workflow.trigger_config.tag || ''}
                   onChange={(e) => setWorkflow({...workflow, trigger_config: { ...workflow.trigger_config, tag: e.target.value }})}
                 />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
           <div className={`flex items-center justify-between px-3 py-3 rounded-md border ${workflow.is_active ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-slate-500">Status</span>
                <span className={`text-[11px] font-semibold ${workflow.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {workflow.is_active ? 'Online' : 'Offline'}
                </span>
              </div>
              <Switch 
                checked={workflow.is_active} 
                onCheckedChange={toggleStatus}
              />
           </div>

           <Button 
             className="w-full bg-slate-200 hover:bg-white text-black font-semibold h-10 rounded-md gap-2 transition-colors"
             onClick={saveWorkflow}
             disabled={saving}
           >
             {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
             <span className="text-xs">Save Changes</span>
           </Button>
        </div>
      </aside>

      {/* WORKFLOW STEPS (CENTER) */}
      <main className="flex-1 overflow-y-auto p-12 bg-slate-950">
        <div className="max-w-xl mx-auto flex flex-col items-center">
            
            {/* START INDICATOR */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-md border border-slate-800 flex items-center justify-center text-slate-600">
                <Play size={16} />
              </div>
              <div className="h-8 w-px bg-slate-800" />
            </div>

            {/* STEPS LIST */}
            <div className="w-full space-y-px bg-slate-800 border border-slate-800 rounded-md overflow-hidden">
              {steps.length === 0 && (
                <div className="py-16 text-center bg-slate-900 flex flex-col items-center gap-4">
                   <div className="p-4 rounded-md border border-slate-800">
                      <Plus className="text-slate-700" size={24} />
                   </div>
                   <div className="space-y-1">
                     <p className="text-xs font-semibold text-slate-400">No steps defined</p>
                     <p className="text-[10px] text-slate-500 line-clamp-1">Click the + button below to add your first action</p>
                   </div>
                </div>
              )}

              {steps.map((step, index) => (
                <div key={step.id} className="group relative bg-slate-900 p-6 border-b border-slate-800 last:border-b-0">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                         {getIconForStep(step.type)}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-medium text-slate-500">Step {index + 1}</span>
                         <h4 className="text-xs font-semibold text-slate-200 capitalize">{step.type.replace('_', ' ')}</h4>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="h-8 w-8 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10">
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {renderStepConfig(step, updateStepConfig)}
                  </div>

                  {/* Add Button Below */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <AddStepPopover onSelect={(type) => addStep(type, index + 1)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Initial Add Button if list is empty */}
            {steps.length === 0 && (
                 <div className="flex justify-center pt-8">
                   <AddStepPopover onSelect={(type) => addStep(type, 0)} isInitial />
                 </div>
            )}
        </div>
      </main>
    </div>
  );
}

function AddStepPopover({ onSelect, isInitial = false }: { onSelect: (type: string) => void, isInitial?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  const actionCategories = [
    {
      name: "Communication",
      actions: [
        { type: 'send_email', label: 'Email', icon: <Mail size={12} /> },
        { type: 'send_sms', label: 'SMS', icon: <MessageSquare size={12} /> },
        { type: 'notify_team', label: 'Alert', icon: <Play size={12} /> },
      ]
    },
    {
      name: "CRM",
      actions: [
        { type: 'apply_tag', label: 'Tag', icon: <TagIcon size={12} /> },
        { type: 'move_to_stage', label: 'Stage', icon: <ArrowRight size={12} /> },
        { type: 'wait', label: 'Delay', icon: <Clock size={12} /> },
      ]
    },
    {
      name: "More",
      actions: [
        { type: 'social_post', label: 'Social', icon: <Zap size={12} /> },
        { type: 'lms_enroll', label: 'LMS', icon: <UserPlus size={12} /> },
        { type: 'send_webhook', label: 'Webhook', icon: <Play size={12} /> },
      ]
    }
  ];

  return (
    <div className={`relative ${isInitial ? '' : ''}`}>
      <Button 
        variant="outline" 
        size="icon" 
        className={`h-6 w-6 rounded-md bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors z-10`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus size={14} className={isOpen ? 'rotate-45' : ''} />
      </Button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-8 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-xl p-2 z-50">
           {actionCategories.map((category, idx) => (
             <div key={idx} className="mb-2 last:mb-0">
               <div className="text-[9px] font-semibold text-slate-500 px-2 py-1 uppercase">{category.name}</div>
               {category.actions.map(action => (
                 <button
                   key={action.type}
                   onClick={() => { onSelect(action.type); setIsOpen(false); }}
                   className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-slate-800 text-left transition-colors"
                 >
                   <span className="text-slate-500">{action.icon}</span>
                   <span className="text-[11px] text-slate-300">{action.label}</span>
                 </button>
               ))}
             </div>
           ))}
        </div>
      )}
    </div>
  );
}

function getIconForStep(type: string) {
  const cls = "text-slate-400";
  switch(type) {
    case 'send_email': return <Mail size={14} className={cls} />;
    case 'send_sms': return <MessageSquare size={14} className={cls} />;
    case 'apply_tag': return <TagIcon size={14} className={cls} />;
    case 'social_post': return <Zap size={14} className={cls} />;
    case 'move_to_stage': return <ArrowRight size={14} className={cls} />;
    case 'notify_team': return <Play size={14} className={cls} />;
    case 'lms_enroll': return <UserPlus size={14} className={cls} />;
    case 'send_webhook': return <Play size={14} className={cls} />;
    case 'wait': return <Clock size={14} className={cls} />;
    default: return <Settings size={14} className={cls} />;
  }
}

function renderStepConfig(step: Step, update: (id: string, config: any) => void) {
  switch(step.type) {
    case 'send_email':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Subject Line</label>
            <Input 
              placeholder="e.g. Welcome to the team!" 
              className="h-10 bg-white/[0.03] border-white/5 text-xs rounded-xl focus:border-blue-500/30 transition-all font-medium"
              value={step.config.subject || ''}
              onChange={(e) => update(step.id, { subject: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Message Body</label>
            <textarea 
              placeholder="Write your email content here..."
              className="w-full min-h-[120px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs text-white/70 focus:outline-none focus:border-blue-500/30 transition-all font-medium resize-none"
              value={step.config.body || ''}
              onChange={(e) => update(step.id, { body: e.target.value })}
            />
          </div>
        </div>
      );
    case 'wait':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Delay Duration</label>
          <div className="flex items-center gap-2">
            <Input 
              type="number"
              className="h-10 w-24 bg-white/[0.03] border-white/5 text-xs rounded-xl font-bold"
              value={step.config.delayValue || 1}
              onChange={(e) => update(step.id, { delayValue: e.target.value })}
            />
            <Select 
              value={step.config.delayUnit || 'minutes'}
              onValueChange={(v) => update(step.id, { delayUnit: v })}
            >
              <SelectTrigger className="h-10 flex-1 bg-white/[0.03] border-white/5 text-xs rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0c0c14] border-white/10 text-white">
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    case 'send_sms':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">SMS Message</label>
          <textarea 
            placeholder="Hi {first_name}, thanks for joining us!"
            className="w-full min-h-[80px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs text-white/70 focus:outline-none focus:border-emerald-500/30 transition-all font-medium resize-none shadow-inner"
            value={step.config.message || ''}
            onChange={(e) => update(step.id, { message: e.target.value })}
          />
        </div>
      );
    case 'social_post':
      return (
        <div className="space-y-4">
           <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Caption / Content</label>
            <textarea 
              placeholder="What should the post say?"
              className="w-full min-h-[80px] bg-white/[0.03] border border-white/5 rounded-xl p-4 text-xs text-white/70 focus:outline-none focus:border-cyan-500/30 transition-all font-medium resize-none shadow-inner"
              value={step.config.content || ''}
              onChange={(e) => update(step.id, { content: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Publish On</label>
            <div className="flex gap-2">
               {['Instagram', 'Facebook', 'X'].map(p => (
                 <button 
                   key={p}
                   className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${step.config.platforms?.includes(p.toLowerCase()) ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-white/[0.02] border-white/5 text-white/20'}`}
                   onClick={() => {
                     const current = step.config.platforms || [];
                     const updated = current.includes(p.toLowerCase()) 
                       ? current.filter((i: string) => i !== p.toLowerCase()) 
                       : [...current, p.toLowerCase()];
                     update(step.id, { platforms: updated });
                   }}
                 >
                   {p}
                 </button>
               ))}
            </div>
          </div>
        </div>
      );
    case 'move_to_stage':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Target Stage ID</label>
          <Input 
            placeholder="e.g. stage_v12_closed_won" 
            className="h-10 bg-white/[0.03] border-white/5 text-xs rounded-xl font-bold"
            value={step.config.stageId || ''}
            onChange={(e) => update(step.id, { stageId: e.target.value })}
          />
        </div>
      );
    case 'notify_team':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Alert Message</label>
          <Input 
            placeholder="e.g. {contact_name} just signed up!" 
            className="h-10 bg-white/[0.03] border-white/5 text-xs rounded-xl font-bold"
            value={step.config.message || ''}
            onChange={(e) => update(step.id, { message: e.target.value })}
          />
        </div>
      );
    case 'lms_enroll':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Course ID</label>
          <Input 
            placeholder="e.g. mastering_leadsmind_101" 
            className="h-10 bg-white/[0.03] border-white/5 text-xs rounded-xl font-bold"
            value={step.config.courseId || ''}
            onChange={(e) => update(step.id, { courseId: e.target.value })}
          />
        </div>
      );
    case 'apply_tag':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Tag Identifier</label>
          <Input 
            placeholder="e.g. newsletter_joined" 
            className="h-10 bg-white/[0.03] border-white/5 text-xs rounded-xl font-bold"
            value={step.config.tag || ''}
            onChange={(e) => update(step.id, { tag: e.target.value })}
          />
        </div>
      );
    case 'send_webhook':
      return (
        <div className="space-y-1.5">
          <label className="text-[9px] font-medium text-slate-500 ml-1">Webhook URL</label>
          <Input 
            placeholder="https://hooks.zapier.com/..." 
            className="h-10 bg-slate-950 border-slate-800 text-xs rounded-md"
            value={step.config.url || ''}
            onChange={(e) => update(step.id, { url: e.target.value })}
          />
        </div>
      );
    default:
      return <p className="text-[10px] text-white/20">No configuration required.</p>;
  }
}
