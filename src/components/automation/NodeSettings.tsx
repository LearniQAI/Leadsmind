"use client";

import { X, Save, AlertCircle } from "lucide-react";
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

interface NodeSettingsProps {
  node: any;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export function NodeSettings({ node, onUpdate, onClose }: NodeSettingsProps) {
  const { type, data } = node;

  const handleChange = (key: string, value: any) => {
    onUpdate({ ...data, [key]: value });
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 z-30 w-80 translate-x-0 bg-[#050510]/95 border-l border-white/5 backdrop-blur-3xl transition-transform duration-500 ease-out">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0b0b15]/50">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Step Settings</h2>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">{data.label}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/30 hover:text-white">
            <X size={18} />
          </Button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
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
            </div>
          )}

          {/* Tag Settings */}
          {data.actionType === 'tag' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Select Tag</label>
                <Select 
                  value={data.tag || ""} 
                  onValueChange={(val) => handleChange('tag', val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Choose a tag..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="hot-lead">Hot Lead</SelectItem>
                    <SelectItem value="follow-up">Needs Follow-up</SelectItem>
                    <SelectItem value="newsletter">Newsletter Subscriber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Delay Settings */}
          {type === 'delay' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Wait Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="number"
                    value={data.durationValue || 1} 
                    onChange={(e) => handleChange('durationValue', parseInt(e.target.value))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Select 
                    value={data.durationUnit || "hours"} 
                    onValueChange={(val) => handleChange('durationUnit', val)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
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

          {/* Condition Settings */}
          {type === 'condition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Contact Field</label>
                <Select 
                  value={data.field || "email"} 
                  onValueChange={(val) => handleChange('field', val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="first_name">First Name</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="source">Source</SelectItem>
                    <SelectItem value="lead_score">Lead Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Operator</label>
                <Select 
                  value={data.operator || "contains"} 
                  onValueChange={(val) => handleChange('operator', val)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="exists">Exists</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.operator !== 'exists' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Value</label>
                  <Input 
                    value={data.value || ""} 
                    onChange={(e) => handleChange('value', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Value to check..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Trigger Details (Read-only for now) */}
          {type === 'trigger' && (
            <div className="p-4 rounded-2xl bg-[#6c47ff]/5 border border-[#6c47ff]/20">
              <div className="flex gap-3">
                <AlertCircle className="text-[#6c47ff] shrink-0" size={16} />
                <p className="text-[11px] text-[#6c47ff]/80 leading-relaxed">
                  This workflow will run every time a <strong>{data.label}</strong> event occurs. No further configuration required.
                </p>
              </div>
            </div>
          )}

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
