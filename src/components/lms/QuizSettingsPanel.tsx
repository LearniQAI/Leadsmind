'use client';

import React from 'react';
import { 
  Settings2, 
  Clock, 
  Target, 
  Layout, 
  RotateCcw, 
  AlertTriangle,
  Flame,
  Shuffle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export function QuizSettingsPanel({ quiz, onUpdate }: any) {
  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 max-h-[80vh] overflow-y-auto scrollbar-none">
       {/* Scoring Section */}
       <div className="space-y-6">
          <div className="flex items-center gap-3">
             <Target className="h-5 w-5 text-[#6c47ff]" />
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Scoring Architecture</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <SettingItem 
                label="Passing Score (%)" 
                description="Threshold for certification"
             >
                <Input 
                   type="number" 
                   defaultValue={quiz.passing_score || 80} 
                   className="bg-white/5 border-white/10"
                   onChange={(e) => onUpdate('passing_score', Number(e.target.value))}
                />
             </SettingItem>
             <SettingItem 
                label="Negative Marking" 
                description="Deduct 25% for wrong answers"
             >
                <Switch 
                   defaultChecked={quiz.negative_marking} 
                   onCheckedChange={(val) => onUpdate('negative_marking', val)}
                />
             </SettingItem>
             <SettingItem 
                label="Partial Scoring" 
                description="Award points for partial matches"
             >
                <Switch 
                   defaultChecked={quiz.partial_scoring}
                   onCheckedChange={(val) => onUpdate('partial_scoring', val)}
                />
             </SettingItem>
          </div>
       </div>

       {/* Timing Section */}
       <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
             <Clock className="h-5 w-5 text-amber-500" />
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Temporal Constraints</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <SettingItem 
                label="Assessment Limit" 
                description="Minutes to complete quiz"
             >
                <Input 
                   type="number" 
                   defaultValue={quiz.time_limit_minutes || 0}
                   className="bg-white/5 border-white/10"
                   onChange={(e) => onUpdate('time_limit_minutes', Number(e.target.value))}
                />
             </SettingItem>
             <SettingItem 
                label="Per-Question Limit" 
                description="Seconds per question"
             >
                <Input 
                   type="number" 
                   defaultValue={quiz.time_limit_per_question || 0}
                   className="bg-white/5 border-white/10"
                   onChange={(e) => onUpdate('time_limit_per_question', Number(e.target.value))}
                />
             </SettingItem>
          </div>
       </div>

       {/* Presentation Section */}
       <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
             <Layout className="h-5 w-5 text-emerald-500" />
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Visual Presentation</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <SettingItem 
                label="View Mode" 
                description="Question rendering layout"
             >
                <Select 
                   defaultValue={quiz.view_mode || 'one_per_page'}
                   onValueChange={(val) => onUpdate('view_mode', val)}
                >
                   <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#0b0b14] border-white/10 text-white">
                      <SelectItem value="one_per_page">One Per Page (Exam)</SelectItem>
                      <SelectItem value="all_on_one">Single Page Scroll</SelectItem>
                   </SelectContent>
                </Select>
             </SettingItem>
             <SettingItem 
                label="Randomize Deck" 
                description="Shuffle questions for each student"
             >
                <Switch 
                   defaultChecked={quiz.randomize_questions}
                   onCheckedChange={(val) => onUpdate('randomize_questions', val)}
                />
             </SettingItem>
             <SettingItem 
                label="Randomize Answers" 
                description="Shuffle A/B/C/D positions"
             >
                <Switch 
                   defaultChecked={quiz.randomize_answers}
                   onCheckedChange={(val) => onUpdate('randomize_answers', val)}
                />
             </SettingItem>
          </div>
       </div>

       {/* Retake Policy Section */}
       <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
             <Flame className="h-5 w-5 text-[#6c47ff]" />
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Question Bank Weights</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <SettingItem 
                label="Bank Mode" 
                description="Draw random questions from deck"
             >
                <Switch 
                   defaultChecked={quiz.bank_enabled}
                   onCheckedChange={(val) => onUpdate('bank_enabled', val)}
                />
             </SettingItem>
             <div className="col-span-2 grid grid-cols-3 gap-4 bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Draw Easy</Label>
                   <Input 
                      type="number" 
                      defaultValue={quiz.bank_config?.easy || 5}
                      className="bg-white/5 border-white/10"
                      onChange={(e) => onUpdate('bank_config', { ...quiz.bank_config, easy: Number(e.target.value) })}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Draw Med</Label>
                   <Input 
                      type="number" 
                      defaultValue={quiz.bank_config?.intermediate || 3}
                      className="bg-white/5 border-white/10"
                      onChange={(e) => onUpdate('bank_config', { ...quiz.bank_config, intermediate: Number(e.target.value) })}
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Draw Advanced</Label>
                   <Input 
                      type="number" 
                      defaultValue={quiz.bank_config?.advanced || 2}
                      className="bg-white/5 border-white/10"
                      onChange={(e) => onUpdate('bank_config', { ...quiz.bank_config, advanced: Number(e.target.value) })}
                   />
                </div>
             </div>
          </div>
       </div>

       {/* Retake Policy Section */}
       <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
             <RotateCcw className="h-5 w-5 text-rose-500" />
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Retake & Persistence</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <SettingItem 
                label="Retake Limit" 
                description="Number of allowed attempts"
             >
                <Input 
                   type="number" 
                   defaultValue={quiz.max_retakes || -1}
                   className="bg-white/5 border-white/10"
                   onChange={(e) => onUpdate('max_retakes', Number(e.target.value))}
                />
             </SettingItem>
             <SettingItem 
                label="Cooldown Period" 
                description="Wait hours between attempts"
             >
                <Input 
                   type="number" 
                   defaultValue={quiz.retake_cooldown_hours || 0}
                   className="bg-white/5 border-white/10"
                   onChange={(e) => onUpdate('retake_cooldown_hours', Number(e.target.value))}
                />
             </SettingItem>
             <SettingItem 
                label="Reveal Mastery" 
                description="When to show correct answers"
             >
                <Select 
                   defaultValue={quiz.answer_visibility || 'after_passing'}
                   onValueChange={(val) => onUpdate('answer_visibility', val)}
                >
                   <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-[#0b0b14] border-white/10 text-white">
                      <SelectItem value="never">Never Hide Intelligence</SelectItem>
                      <SelectItem value="after_passing">After Passing Score</SelectItem>
                      <SelectItem value="after_all_retakes">After Final Attempt</SelectItem>
                      <SelectItem value="always">Always Show Feedback</SelectItem>
                   </SelectContent>
                </Select>
             </SettingItem>
          </div>
       </div>
    </div>
  );
}

function SettingItem({ label, description, children }: any) {
   return (
      <div className="space-y-3">
         <div className="flex flex-col gap-0.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-white">{label}</Label>
            <span className="text-[10px] text-white/20 italic">{description}</span>
         </div>
         <div className="pt-1">
            {children}
         </div>
      </div>
   );
}
