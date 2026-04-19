"use client";

import { X, Save, Settings, Shield, Clock, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { updateWorkflow } from "@/app/actions/automation";
import { toast } from "sonner";

interface WorkflowSettingsDrawerProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: any;
}

export function WorkflowSettingsDrawer({
  workflowId,
  isOpen,
  onClose,
  initialSettings = {}
}: WorkflowSettingsDrawerProps) {
  const [settings, setSettings] = useState({
    max_concurrent: 1,
    re_enrollment_delay_hours: 0,
    allow_re_enrollment: true,
    cancel_conflicting: false,
    ...initialSettings
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateWorkflow(workflowId, { enrollment_settings: settings });
      toast.success("Workflow settings updated");
      onClose();
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-[400px] bg-[#050510]/98 border-l border-white/5 backdrop-blur-3xl shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0b0b15]/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl">
                <Settings size={18} className="text-primary" />
             </div>
             <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Global Logic</h2>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Workflow Controls</h3>
             </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/30 hover:text-white rounded-full">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Concurrency Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white/90">
              <Shield size={16} className="text-cyan-400" />
              <span className="text-[12px] font-black uppercase tracking-widest">Cross-Workflow Control</span>
            </div>
            
            <div className="space-y-4 p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Max Concurrent Flows</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number"
                    value={settings.max_concurrent}
                    onChange={(e) => setSettings({ ...settings, max_concurrent: parseInt(e.target.value) })}
                    className="bg-black/40 border-white/10 h-12 text-lg font-bold"
                  />
                </div>
                <p className="text-[9px] text-white/30 italic leading-relaxed">
                  Controls how many active workflows a single contact can be enrolled in at once. 
                  Exceeding this sends new enrollments to the <strong>Wait Queue</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Re-enrollment Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white/90">
              <Clock size={16} className="text-purple-400" />
              <span className="text-[12px] font-black uppercase tracking-widest">Re-enrollment Rules</span>
            </div>

            <div className="space-y-6 p-6 rounded-3xl bg-white/5 border border-white/5">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-white tracking-tight uppercase">Allow Multi-Enroll</span>
                    <p className="text-[9px] text-white/30 italic">Can a contact enter this flow more than once?</p>
                  </div>
                  <Switch 
                     checked={settings.allow_re_enrollment}
                     onCheckedChange={(checked) => setSettings({ ...settings, allow_re_enrollment: checked })}
                  />
               </div>

               {settings.allow_re_enrollment && (
                 <div className="space-y-2 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Re-enrollment Delay</label>
                    <Select 
                      value={settings.re_enrollment_delay_hours.toString()} 
                      onValueChange={(val) => setSettings({ ...settings, re_enrollment_delay_hours: parseInt(val) })}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                        <SelectItem value="0">Immediately (No Delay)</SelectItem>
                        <SelectItem value="24">After 24 Hours</SelectItem>
                        <SelectItem value="168">After 7 Days</SelectItem>
                        <SelectItem value="720">After 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
               )}
            </div>
          </div>

          {/* Safety Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white/90">
              <Zap size={16} className="text-amber-400" />
              <span className="text-[12px] font-black uppercase tracking-widest">Workflow Safety</span>
            </div>

            <div className="space-y-4 p-6 rounded-3xl bg-amber-400/5 border border-amber-400/10">
               <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <span className="text-[11px] font-bold text-amber-100 tracking-tight uppercase">Cancel Conflicting</span>
                    <p className="text-[9px] text-amber-100/30 italic">Stop all other active workflows for this contact when this one starts.</p>
                  </div>
                  <Switch 
                     checked={settings.cancel_conflicting}
                     onCheckedChange={(checked) => setSettings({ ...settings, cancel_conflicting: checked })}
                  />
               </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 italic">
             <AlertCircle size={16} className="text-primary shrink-0" />
             <p className="text-[10px] text-white/50 leading-relaxed">
               Settings changed here apply to all <strong>future</strong> enrollments. Existing active runs will follow their original rules.
             </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-[#0b0b15]/80">
          <Button 
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : (
              <>
                <Save size={18} />
                Update Global Logic
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
