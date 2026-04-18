"use client";

import { X, Save, AlertCircle, Zap, Sparkles, Plus, Trash2, GitBranch, Copy, Check, Link, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface NodeSettingsProps {
  workflowId?: string;
  node: any;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export function NodeSettings({ workflowId, node, onUpdate, onClose }: NodeSettingsProps) {
  const { type, data } = node;
  const [newKey, setNewKey] = useState("");
  const [newField, setNewField] = useState("email");

  const handleChange = (key: string, value: any) => {
    onUpdate({ ...data, [key]: value });
  };

  const branches = data.branches || [];

  const addBranch = () => {
    if (branches.length >= 6) return;
    const newBranch = {
      name: `Branch ${branches.length + 1}`,
      conditions: [{ field: 'email', operator: 'contains', value: '' }]
    };
    handleChange('branches', [...branches, newBranch]);
  };

  const updateBranch = (index: number, key: string, val: any) => {
    const newBranches = [...branches];
    newBranches[index] = { ...newBranches[index], [key]: val };
    handleChange('branches', newBranches);
  };

  const removeBranch = (index: number) => {
    const newBranches = branches.filter((_: any, i: number) => i !== index);
    handleChange('branches', newBranches);
  };

  const updateBranchCondition = (bIdx: number, cIdx: number, key: string, val: any) => {
    const newBranches = [...branches];
    const newConditions = [...newBranches[bIdx].conditions];
    newConditions[cIdx] = { ...newConditions[cIdx], [key]: val };
    newBranches[bIdx].conditions = newConditions;
    handleChange('branches', newBranches);
  };

  const addMapping = () => {
    if (!newKey) return;
    const mapping = data.webhook_mapping || {};
    handleChange('webhook_mapping', { ...mapping, [newKey]: newField });
    setNewKey("");
  };

  const removeMapping = (targetKey: string) => {
    const mapping = { ...data.webhook_mapping };
    delete mapping[targetKey];
    handleChange('webhook_mapping', mapping);
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 z-30 w-80 translate-x-0 bg-[#050510]/95 border-l border-white/5 backdrop-blur-3xl transition-transform duration-500 ease-out">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0b0b15]/50">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Configuration</h2>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">{data.label}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </Button>
        </div>

        {/* Helpful Intro for Non-Techies */}
        <div className="px-6 py-4 bg-primary/5 border-b border-white/5 flex gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0 h-fit">
            <Zap className="w-3 h-3 text-primary" />
          </div>
          <p className="text-[10px] text-white/50 leading-relaxed italic">
            {type === 'trigger' && "This is how your automation starts. When this happens, the following steps will run."}
            {type === 'delay' && "This pauses the automation for a specific amount of time before moving to the next step."}
            {type === 'condition' && "This checks a specific detail about your lead and splits them into two paths: Yes or No."}
            {type === 'action' && "This is an action that Leadsmind will perform automatically for you."}
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Step Name (Renaming) */}
          <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Display name</label>
            <Input
              value={data.label || ""}
              onChange={(e) => handleChange('label', e.target.value)}
              className="bg-transparent border-none text-white font-bold p-0 h-auto focus-visible:ring-0 text-base"
              placeholder="Give this step a name..."
            />
          </div>

          {/* Email Settings */}
          {data.actionType === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Email Subject</label>
                <Input
                  value={data.subject || ""}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Welcome to Leadsmind!"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Email Body</label>
                <Textarea
                  value={data.body || ""}
                  onChange={(e) => handleChange('body', e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[150px]"
                  placeholder="Hey there, thanks for signing up..."
                />
              </div>

              {/* Business Hours Window */}
              <div className="pt-4 border-t border-white/5 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white tracking-tight">Business Hours Window</span>
                    <span className="text-[9px] text-white/30 italic">Only send during specific hours</span>
                  </div>
                  <Switch
                    checked={data.business_hours?.enabled || false}
                    onCheckedChange={(checked) => handleChange('business_hours', { ...(data.business_hours || {}), enabled: checked })}
                  />
                </div>

                {data.business_hours?.enabled && (
                  <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Start Time</label>
                      <Input
                        type="time"
                        value={data.business_hours?.start_time || "08:00"}
                        onChange={(e) => handleChange('business_hours', { ...data.business_hours, start_time: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">End Time</label>
                      <Input
                        type="time"
                        value={data.business_hours?.end_time || "17:00"}
                        onChange={(e) => handleChange('business_hours', { ...data.business_hours, end_time: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SMS Settings */}
          {data.actionType === 'sms' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">SMS Message</label>
                <Textarea
                  value={data.message || ""}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Your automated SMS text here..."
                />
              </div>

              {/* Business Hours Window */}
              <div className="pt-4 border-t border-white/5 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white tracking-tight">Business Hours Window</span>
                    <span className="text-[9px] text-white/30 italic">Only send during specific hours</span>
                  </div>
                  <Switch
                    checked={data.business_hours?.enabled || false}
                    onCheckedChange={(checked) => handleChange('business_hours', { ...(data.business_hours || {}), enabled: checked })}
                  />
                </div>

                {data.business_hours?.enabled && (
                  <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Start Time</label>
                      <Input
                        type="time"
                        value={data.business_hours?.start_time || "08:00"}
                        onChange={(e) => handleChange('business_hours', { ...data.business_hours, start_time: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">End Time</label>
                      <Input
                        type="time"
                        value={data.business_hours?.end_time || "17:00"}
                        onChange={(e) => handleChange('business_hours', { ...data.business_hours, end_time: e.target.value })}
                        className="bg-white/5 border-white/10 text-white h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logic: Delay Settings */}
          {type === 'delay' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Wait for how long?</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={data.durationValue || 1}
                    onChange={(e) => handleChange('durationValue', parseInt(e.target.value))}
                    className="bg-white/5 border-white/10 text-white h-12"
                  />
                  <Select value={data.durationUnit || "minutes"} onValueChange={(val) => handleChange('durationUnit', val)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Logic: Condition Settings */}
          {type === 'condition' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">1. What detail should we check?</label>
                <Select value={data.field || "email"} onValueChange={(val) => handleChange('field', val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="email">Email Address</SelectItem>
                    <SelectItem value="first_name">Person's Name</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="lead_score">Lead Score (Hotness)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">2. Check if it...</label>
                <Select value={data.operator || "contains"} onValueChange={(val) => handleChange('operator', val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="equals">Exactly matches</SelectItem>
                    <SelectItem value="contains">Contains this text</SelectItem>
                    <SelectItem value="exists">Is not empty (is known)</SelectItem>
                    <SelectItem value="greater_than">Is greater than (score)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.operator !== 'exists' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">3. Match this text/value:</label>
                  <Input
                    value={data.value || ""}
                    onChange={(e) => handleChange('value', e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-12"
                    placeholder="Enter value here..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Logic: Multi-Branch Router */}
          {type === 'route' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Branches ({branches.length}/6)</label>
                {branches.length < 6 && (
                  <Button variant="ghost" size="sm" onClick={addBranch} className="h-7 text-[9px] text-blue-400 hover:text-blue-300 gap-1 bg-blue-500/5">
                    <Plus size={10} /> Add Path
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {branches.map((branch: any, bIdx: number) => (
                  <div key={bIdx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative group/branch">
                    <div className="flex items-center justify-between gap-4">
                      <Input
                        value={branch.name}
                        onChange={(e) => updateBranch(bIdx, 'name', e.target.value)}
                        className="bg-transparent border-none text-white font-black p-0 h-auto focus-visible:ring-0 text-[11px] uppercase tracking-wider"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeBranch(bIdx)} className="h-6 w-6 text-white/10 hover:text-rose-500 hover:bg-rose-500/10">
                        <Trash2 size={12} />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {branch.conditions.map((cond: any, cIdx: number) => (
                        <div key={cIdx} className="space-y-2">
                          <Select value={cond.field || "email"} onValueChange={(val) => updateBranchCondition(bIdx, cIdx, 'field', val)}>
                            <SelectTrigger className="bg-slate-900 border-white/5 h-8 text-[10px] text-white/70">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="first_name">First Name</SelectItem>
                              <SelectItem value="lead_score">Lead Score</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="grid grid-cols-2 gap-2">
                            <Select value={cond.operator || "equals"} onValueChange={(val) => updateBranchCondition(bIdx, cIdx, 'operator', val)}>
                              <SelectTrigger className="bg-slate-900 border-white/5 h-8 text-[10px] text-white/70">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="not_contains">Not Contains</SelectItem>
                                <SelectItem value="exists">Exists</SelectItem>
                                <SelectItem value="not_exists">Not Exists</SelectItem>
                                <SelectItem value="gt">Greater Than</SelectItem>
                                <SelectItem value="lt">Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              value={cond.value || ""}
                              onChange={(e) => updateBranchCondition(bIdx, cIdx, 'value', e.target.value)}
                              className="bg-slate-900 border-white/5 h-8 text-[10px] text-white"
                              placeholder="Value..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Default Fallback</span>
                  <div className="px-2 py-0.5 rounded-full bg-white/5 text-[8px] font-bold text-white/30 uppercase">Always Wins Last</div>
                </div>
              </div>
            </div>
          )}

          {/* Action: Update Record Settings */}
          {data.actionType === 'update_field' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">Update which field?</label>
                <Select value={data.updateField || "lead_score"} onValueChange={(val) => { if (val) handleChange('updateField', val); }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="email">Email Address</SelectItem>
                    <SelectItem value="first_name">First Name</SelectItem>
                    <SelectItem value="last_name">Last Name</SelectItem>
                    <SelectItem value="lead_score">Lead Score</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">To what value?</label>
                <Input
                  value={data.updateValue || ""}
                  onChange={(e) => handleChange('updateValue', e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12"
                  placeholder="Enter new value..."
                />
              </div>
            </div>
          )}

          {/* Conversion Goal Settings */}
          {type === 'goal' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#06b6d4]/5 border border-[#06b6d4]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#06b6d4]">
                  <Sparkles size={14} className="fill-[#06b6d4]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#06b6d4]">Goal Objective</span>
                </div>
                <p className="text-[10px] text-[#06b6d4]/60 italic leading-relaxed">
                  Set a target for this workflow. When reached, the contact is marked as "Converted".
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Goal Event</label>
                <Select value={data.goal_event_type || "appointment_booked"} onValueChange={(val) => handleChange('goal_event_type', val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="appointment_booked">Appointment Booked</SelectItem>
                    <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* TRIGGER GLOBAL GOAL SETTINGS */}
          {type === 'trigger' && (
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6c47ff] uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={12} className="fill-[#6c47ff]" />
                  Sequence Goal (Optional)
                </label>
                <p className="text-[10px] text-white/40 italic mb-2">
                  Stop this workflow automatically if the contact:
                </p>
                <Select value={data.goal_event_type || "none"} onValueChange={(val) => handleChange('goal_event_type', val)}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white h-12">
                    <SelectValue placeholder="No goal set" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="none">Keep running until end</SelectItem>
                    <SelectItem value="appointment_booked">Books an Appointment</SelectItem>
                    <SelectItem value="invoice_paid">Pays an Invoice</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[9px] text-white/30 leading-snug">
                    <span className="text-emerald-400 font-bold uppercase tracking-tighter mr-1">Pro Tip:</span>
                    This prevents "embarrassing" automation by stopping follow-ups once they convert.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TRIGGER: Webhook Settings */}
          {type === 'trigger' && data.triggerType === 'webhook' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Link size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Your Endpoint</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-blue-400 hover:bg-blue-400/10"
                    onClick={() => {
                      const url = `${window.location.origin}/api/webhooks/workflow/${workflowId || 'ID'}`;
                      navigator.clipboard.writeText(url);
                      toast.success("URL copied to clipboard!");
                    }}
                  >
                    <Copy size={12} />
                  </Button>
                </div>
                <code className="block text-[10px] bg-black/40 p-2 rounded border border-white/5 text-white/60 break-all leading-relaxed">
                  {window.location.origin}/api/webhooks/workflow/{workflowId || '...'}
                </code>
                <p className="text-[9px] text-white/30 italic">
                  Send POST requests here with JSON body to trigger this flow.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Data Mapping</label>
                <div className="space-y-3">
                  {Object.entries(data.webhook_mapping || {}).map(([key, field]: [string, any], idx) => (
                    <div key={idx} className="flex items-center gap-2 group/map">
                      <div className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-white/70 font-mono">
                        {key}
                      </div>
                      <ArrowRight size={12} className="text-white/20" />
                      <div className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
                        {field}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMapping(key)} className="h-6 w-6 text-white/10 hover:text-rose-500 opacity-0 group-hover/map:opacity-100 transition-opacity">
                        <Trash2 size={10} />
                      </Button>
                    </div>
                  ))}

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-white/20 uppercase">JSON Key</label>
                        <Input
                          placeholder="e.g. user_email"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          className="bg-black/20 border-white/5 h-8 text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-white/20 uppercase">CRM Field</label>
                        <Select value={newField} onValueChange={(val) => { if (val) setNewField(val); }}>
                          <SelectTrigger className="bg-black/20 border-white/5 h-8 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="first_name">First Name</SelectItem>
                            <SelectItem value="last_name">Last Name</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="lead_score">Lead Score</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={addMapping} className="w-full h-8 bg-blue-500 hover:bg-blue-600 text-[10px] font-bold uppercase tracking-wider gap-2">
                      <Plus size={12} /> Add Mapping
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION: Send Webhook Settings */}
          {data.actionType === 'send_webhook' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Destination URL</label>
                <Input
                  placeholder="https://hooks.zapier.com/..."
                  value={data.url || ""}
                  onChange={(e) => handleChange('url', e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12"
                />
                <p className="text-[9px] text-white/20">Supports tokens like {"{{contact.email}}"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Method</label>
                <Select value={data.method || "POST"} onValueChange={(val) => handleChange('method', val)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">JSON Body Template</label>
                  <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-tighter" onClick={() => handleChange('bodyTemplate', '{\n  "email": "{{contact.email}}",\n  "name": "{{contact.first_name}}"\n}')}>
                    Load Example
                  </Button>
                </div>
                <Textarea
                  value={data.bodyTemplate || ""}
                  onChange={(e) => handleChange('bodyTemplate', e.target.value)}
                  rows={8}
                  className="bg-white/5 border-white/10 text-white font-mono text-[10px]"
                  placeholder='{ "key": "value" }'
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#6c47ff]/5 border border-[#6c47ff]/20 flex gap-3">
            <AlertCircle size={16} className="shrink-0 text-[#6c47ff]" />
            <p className="text-[11px] leading-relaxed text-white/70">
              This workflow will run every time a <strong>{data.label}</strong> event occurs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0b0b15]/50">
          <Button
            className="w-full h-12 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-bold rounded-2xl shadow-lg shadow-[#6c47ff]/20 gap-2"
            onClick={onClose}
          >
            <Save size={16} />
            <span>Apply Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
