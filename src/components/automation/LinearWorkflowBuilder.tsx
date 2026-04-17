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
  Play,
  Save,
  Loader2,
  Zap,
  Globe,
  BookOpen,
  Bell,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

// ─── Action Library Definition ────────────────────────────────────────────────
const ACTION_LIBRARY = [
  {
    category: 'Communication',
    actions: [
      { type: 'send_email',   label: 'Send Email',        icon: Mail,           description: 'Send an automated email to the contact' },
      { type: 'send_sms',     label: 'Send SMS',          icon: MessageSquare,  description: 'Send a text message to the contact' },
      { type: 'notify_team',  label: 'Internal Alert',    icon: Bell,           description: 'Notify your team inside the dashboard' },
    ]
  },
  {
    category: 'CRM',
    actions: [
      { type: 'apply_tag',      label: 'Apply Tag',             icon: TagIcon,    description: 'Add a tag to the contact record' },
      { type: 'move_to_stage',  label: 'Move Pipeline Stage',   icon: ArrowRight, description: 'Move the contact to a new pipeline stage' },
      { type: 'wait',           label: 'Wait / Delay',          icon: Clock,      description: 'Pause before running the next step' },
    ]
  },
  {
    category: 'Marketing',
    actions: [
      { type: 'social_post',  label: 'Social Media Post',   icon: Globe,      description: 'Publish a post to connected social accounts' },
    ]
  },
  {
    category: 'Courses & LMS',
    actions: [
      { type: 'lms_enroll',   label: 'Enroll in Course',    icon: BookOpen,   description: 'Enroll the contact in a course or programme' },
    ]
  },
  {
    category: 'Integrations',
    actions: [
      { type: 'send_webhook', label: 'Send Webhook',         icon: Zap,        description: 'POST contact data to any external URL' },
    ]
  },
];

function getActionMeta(type: string) {
  for (const cat of ACTION_LIBRARY) {
    const found = cat.actions.find(a => a.type === type);
    if (found) return found;
  }
  return { label: type, icon: Settings, description: '' };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LinearWorkflowBuilder({ workflowId, initialWorkflow }: { workflowId: string, initialWorkflow: any }) {
  const supabase = createClient();
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState(0);

  const selectedStep = steps.find(s => s.id === selectedStepId) || null;

  useEffect(() => { fetchSteps(); }, [workflowId]);

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
      } else { toast.error(result.error); }
    } catch { toast.error('Failed to update status'); }
  };

  const saveWorkflow = async () => {
    setSaving(true);
    try {
      await updateWorkflow(workflowId, {
        trigger_type: workflow.trigger_type,
        trigger_config: workflow.trigger_config
      });
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
      toast.success('Workflow saved');
    } catch { toast.error('Failed to save workflow'); }
    finally { setSaving(false); }
  };

  const openActionPicker = (atIndex: number) => {
    setInsertAtIndex(atIndex);
    setShowActionPicker(true);
    setSelectedStepId(null);
  };

  const addStep = (type: string) => {
    const newStep: Step = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      config: {},
      position: insertAtIndex + 1
    };
    const newSteps = [...steps];
    newSteps.splice(insertAtIndex, 0, newStep);
    setSteps(newSteps.map((s, i) => ({ ...s, position: i + 1 })));
    setShowActionPicker(false);
    setSelectedStepId(newStep.id);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id).map((s, i) => ({ ...s, position: i + 1 })));
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const updateStepConfig = (id: string, patch: any) => {
    setSteps(steps.map(s => s.id === id ? { ...s, config: { ...s.config, ...patch } } : s));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="animate-spin text-slate-600" size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0a0a0f] text-slate-200 overflow-hidden">

      {/* ── LEFT SIDEBAR: Trigger + Controls ────────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-slate-800 bg-[#0d0d14] flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Trigger</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500">When this happens</label>
              <Select
                value={workflow.trigger_type}
                onValueChange={(v) => setWorkflow({ ...workflow, trigger_type: v })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 h-9 text-xs text-slate-200 rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                  <SelectItem value="contact_created">Contact is created</SelectItem>
                  <SelectItem value="tag_added">Tag is applied</SelectItem>
                  <SelectItem value="stage_changed">Stage changes</SelectItem>
                  <SelectItem value="form_submitted">Form is submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(workflow.trigger_type === 'tag_added' || workflow.trigger_type === 'form_submitted') && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500">
                  {workflow.trigger_type === 'form_submitted' ? 'Form ID' : 'Tag name'}
                </label>
                <Input
                  placeholder="Enter value..."
                  className="bg-slate-900 border-slate-700 h-9 text-xs text-slate-200 rounded"
                  value={workflow.trigger_config?.tag || ''}
                  onChange={(e) => setWorkflow({ ...workflow, trigger_config: { ...workflow.trigger_config, tag: e.target.value } })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-3 mt-auto border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Status</p>
              <p className={`text-xs font-semibold ${workflow.is_active ? 'text-emerald-400' : 'text-slate-400'}`}>
                {workflow.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <Switch checked={workflow.is_active} onCheckedChange={toggleStatus} />
          </div>

          <Button
            onClick={saveWorkflow}
            disabled={saving}
            className="w-full h-9 text-xs font-medium bg-slate-100 hover:bg-white text-black rounded gap-2"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save size={13} />}
            Save workflow
          </Button>
        </div>
      </aside>

      {/* ── CENTER CANVAS: Step Rail ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f] relative">
        <div className="max-w-lg mx-auto py-12 px-6">

          {/* Trigger node at top */}
          <div className="flex flex-col items-center">
            <div className="w-full border border-slate-700 bg-slate-800/50 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="h-7 w-7 rounded-md bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Play size={12} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Trigger</p>
                <p className="text-xs font-medium text-slate-200 capitalize">
                  {workflow.trigger_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* First add button */}
            <AddButton onClick={() => openActionPicker(0)} />

            {/* Steps */}
            {steps.map((step, index) => {
              const meta = getActionMeta(step.type);
              const Icon = meta.icon;
              const isSelected = selectedStepId === step.id;

              return (
                <div key={step.id} className="w-full flex flex-col items-center">
                  <button
                    onClick={() => { setSelectedStepId(isSelected ? null : step.id); setShowActionPicker(false); }}
                    className={`w-full border rounded-lg px-4 py-3 flex items-center gap-3 text-left transition-colors group ${
                      isSelected
                        ? 'border-slate-500 bg-slate-800'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="h-7 w-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest">Step {index + 1}</p>
                      <p className="text-xs font-medium text-slate-200 truncate">{meta.label}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <ChevronRight size={13} className={`text-slate-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </button>

                  {/* Add button after each step */}
                  <AddButton onClick={() => openActionPicker(index + 1)} />
                </div>
              );
            })}

            {/* End marker */}
            <div className="h-8 w-px bg-slate-800" />
            <div className="h-2 w-2 rounded-full bg-slate-700" />
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL: Action Picker ───────────────────────────────────────── */}
      {showActionPicker && (
        <aside className="w-72 shrink-0 border-l border-slate-800 bg-[#0d0d14] overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300">Choose an action</p>
            <button onClick={() => setShowActionPicker(false)} className="text-slate-500 hover:text-slate-300 p-1">
              <X size={14} />
            </button>
          </div>
          <div className="p-3 space-y-4">
            {ACTION_LIBRARY.map((cat) => (
              <div key={cat.category}>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 px-2 mb-1">{cat.category}</p>
                <div className="space-y-0.5">
                  {cat.actions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.type}
                        onClick={() => addStep(action.type)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="h-7 w-7 rounded-md border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0 group-hover:border-slate-700">
                          <Icon size={13} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-300">{action.label}</p>
                          <p className="text-[10px] text-slate-500 leading-snug">{action.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* ── RIGHT PANEL: Step Config ─────────────────────────────────────────── */}
      {selectedStep && !showActionPicker && (
        <aside className="w-72 shrink-0 border-l border-slate-800 bg-[#0d0d14] overflow-y-auto">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">Configure step</p>
              <p className="text-xs font-semibold text-slate-200">{getActionMeta(selectedStep.type).label}</p>
            </div>
            <button onClick={() => setSelectedStepId(null)} className="text-slate-500 hover:text-slate-300 p-1">
              <X size={14} />
            </button>
          </div>
          <div className="p-4">
            <StepConfig step={selectedStep} update={updateStepConfig} />
          </div>
        </aside>
      )}
    </div>
  );
}

// ─── Add Button Component ──────────────────────────────────────────────────────
function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center py-1 w-full">
      <div className="h-5 w-px bg-slate-800" />
      <button
        onClick={onClick}
        className="h-7 w-7 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
        title="Add step"
      >
        <Plus size={14} />
      </button>
      <div className="h-5 w-px bg-slate-800" />
    </div>
  );
}

// ─── Step Config Panel ─────────────────────────────────────────────────────────
function StepConfig({ step, update }: { step: Step; update: (id: string, patch: any) => void }) {
  const cfg = step.config;
  const set = (patch: any) => update(step.id, patch);

  switch (step.type) {

    case 'send_email':
      return (
        <div className="space-y-4">
          <Field label="Subject line">
            <Input placeholder="e.g. Welcome to Leadsmind!" className={inputCls} value={cfg.subject || ''} onChange={e => set({ subject: e.target.value })} />
          </Field>
          <Field label="Email body">
            <textarea placeholder="Write your email..." rows={5} className={textareaCls} value={cfg.body || ''} onChange={e => set({ body: e.target.value })} />
          </Field>
        </div>
      );

    case 'send_sms':
      return (
        <Field label="SMS message">
          <textarea placeholder="Hi {first_name}, ..." rows={4} className={textareaCls} value={cfg.message || ''} onChange={e => set({ message: e.target.value })} />
        </Field>
      );

    case 'notify_team':
      return (
        <Field label="Alert message">
          <Input placeholder="{contact_name} just signed up!" className={inputCls} value={cfg.message || ''} onChange={e => set({ message: e.target.value })} />
        </Field>
      );

    case 'apply_tag':
      return (
        <Field label="Tag to apply">
          <Input placeholder="e.g. newsletter-subscriber" className={inputCls} value={cfg.tag || ''} onChange={e => set({ tag: e.target.value })} />
        </Field>
      );

    case 'move_to_stage':
      return (
        <Field label="Target stage ID">
          <Input placeholder="e.g. stage_closed_won" className={inputCls} value={cfg.stageId || ''} onChange={e => set({ stageId: e.target.value })} />
        </Field>
      );

    case 'wait':
      return (
        <div className="space-y-4">
          <Field label="Wait duration">
            <Input type="number" min={1} placeholder="1" className={inputCls} value={cfg.delayValue || ''} onChange={e => set({ delayValue: e.target.value })} />
          </Field>
          <Field label="Unit">
            <Select value={cfg.delayUnit || 'minutes'} onValueChange={v => set({ delayUnit: v })}>
              <SelectTrigger className={`${inputCls} h-9`}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    case 'social_post':
      return (
        <div className="space-y-4">
          <Field label="Post caption">
            <textarea placeholder="What should the post say?" rows={4} className={textareaCls} value={cfg.content || ''} onChange={e => set({ content: e.target.value })} />
          </Field>
          <Field label="Publish on">
            <div className="flex flex-wrap gap-2 pt-1">
              {['Instagram', 'Facebook', 'X (Twitter)', 'LinkedIn'].map(p => {
                const key = p.toLowerCase().split(' ')[0];
                const active = (cfg.platforms || []).includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => {
                      const cur = cfg.platforms || [];
                      set({ platforms: active ? cur.filter((i: string) => i !== key) : [...cur, key] });
                    }}
                    className={`px-2.5 py-1 rounded border text-[10px] font-medium transition-all ${active ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      );

    case 'lms_enroll':
      return (
        <Field label="Course ID">
          <Input placeholder="e.g. intro-to-sales-101" className={inputCls} value={cfg.courseId || ''} onChange={e => set({ courseId: e.target.value })} />
        </Field>
      );

    case 'send_webhook':
      return (
        <div className="space-y-4">
          <Field label="Webhook URL">
            <Input placeholder="https://hooks.zapier.com/..." className={inputCls} value={cfg.url || ''} onChange={e => set({ url: e.target.value })} />
          </Field>
          <Field label="Method">
            <Select value={cfg.method || 'POST'} onValueChange={v => set({ method: v })}>
              <SelectTrigger className={`${inputCls} h-9`}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      );

    default:
      return <p className="text-[11px] text-slate-500">No configuration required for this step.</p>;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "bg-slate-900 border-slate-700 h-9 text-xs text-slate-200 rounded w-full focus:border-slate-500";
const textareaCls = "w-full bg-slate-900 border border-slate-700 rounded p-3 text-xs text-slate-200 resize-none focus:outline-none focus:border-slate-500 placeholder:text-slate-600";
