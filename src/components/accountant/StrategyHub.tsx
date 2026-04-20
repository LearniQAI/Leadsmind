"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Users, 
  Factory, 
  TrendingUp, 
  ArrowUpRight,
  Plus,
  Loader2,
  Trophy,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addBusinessGoal } from '@/app/actions/accountant';
import { toast } from 'sonner';

interface BusinessGoal {
    id: string;
    type: 'revenue_target' | 'hiring_plan' | 'capital_purchase';
    title: string;
    target_value: number;
    current_value: number;
    deadline_date: string;
    status: string;
}

export default function StrategyHub({ workspaceId, goals }: { workspaceId: string, goals: BusinessGoal[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic Narrative Generation
  const generateNarrative = () => {
    if (goals.length === 0) return "Establish your first strategic growth vector to begin receiving intelligence narratives.";
    
    const revGoal = goals.find(g => g.type === 'revenue_target');
    if (revGoal) {
        const perc = (revGoal.current_value / revGoal.target_value) * 100;
        if (perc > 50) return `Your revenue momentum is strong at ${perc.toFixed(0)}% of target. This is an ideal window to accelerate your hiring or capital investment plans.`;
        if (perc > 0) return `You have reached R${(revGoal.current_value/1000).toLocaleString()}k in revenue. Maintaining this velocity will put you on track for your Q4 objective.`;
    }
    return "Your strategic goals are active. We are currently monitoring your transaction history for growth signals.";
  };

  const activeNarrative = generateNarrative();

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
        await addBusinessGoal({
            workspace_id: workspaceId,
            title: formData.get('title') as string,
            type: formData.get('type') as any,
            target_value: parseFloat(formData.get('target') as string),
            deadline_date: formData.get('deadline') as string
        });
        toast.success("Strategic milestone set!");
        setIsOpen(false);
    } catch (error) {
        toast.error("Failed to set milestone");
    } finally {
        setIsSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'revenue_target': return <Target className="text-emerald-500" />;
        case 'hiring_plan': return <Users className="text-sky-500" />;
        case 'capital_purchase': return <Factory className="text-amber-500" />;
        default: return <Target className="text-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
               <Trophy className="text-primary" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Business Strategy Hub</h3>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Growth Milestones & Resource Planning</p>
            </div>
         </div>

         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={() => (
                <Button className="h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] px-6 border border-white/5" onClick={() => setIsOpen(true)}>
                    <Plus size={16} />
                    Set New Milestone
                </Button>
            )} />
            <DialogContent className="bg-[#0b0b15] border-white/5 rounded-3xl text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight italic">Set Growth Milestone</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGoal} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Milestone Title</Label>
                        <Input name="title" required placeholder="e.g. Q4 Growth Sprint" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</Label>
                            <Select name="type" required>
                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0b0b15] border-white/10 text-white">
                                    <SelectItem value="revenue_target">Revenue Target</SelectItem>
                                    <SelectItem value="hiring_plan">Hiring Plan</SelectItem>
                                    <SelectItem value="capital_purchase">Capital Purchase</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Value</Label>
                            <Input name="target" type="number" required placeholder="e.g. 1000000" className="bg-white/5 border-white/10 h-12 rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Deadline</Label>
                        <Input name="deadline" type="date" required className="bg-white/5 border-white/10 h-12 rounded-xl" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSaving} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl">
                            {isSaving ? <Loader2 className="animate-spin" /> : "Deploy Milestone"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
         </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {goals.length === 0 && (
             <Card className="col-span-full bg-[#0b0b15] border-white/5 p-20 text-center border-dashed">
                <Rocket className="mx-auto text-primary mb-6 opacity-20" size={64} />
                <h4 className="text-lg font-black text-white uppercase tracking-tight">No Strategic Goals Set</h4>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Initialize your growth vectors in the Strategy Hub</p>
             </Card>
         )}

         {goals.map((goal) => {
            const percentage = goal.target_value ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0;
            
            return (
                <Card key={goal.id} className="bg-[#0b0b15] border-white/5 p-8 rounded-[40px] space-y-8 group hover:border-primary/20 transition-all flex flex-col justify-between min-h-[300px]">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {getIcon(goal.type)}
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{goal.deadline_date ? new Date(goal.deadline_date).getFullYear() : 'Q4'} PLAN</span>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xl font-black text-white uppercase tracking-tight leading-snug">{goal.title}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Progress</span>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    percentage >= 100 ? "text-emerald-500" : "text-primary"
                                )}>{percentage.toFixed(0)}% Achieved</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Progress value={percentage} className="h-1.5 bg-white/5 [&>div]:bg-primary" />
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Target</p>
                                <p className="text-lg font-black text-white tracking-tight leading-none mt-1">
                                    {goal.type === 'hiring_plan' ? `${goal.target_value} Headcount` : `R${(goal.target_value / 1000).toLocaleString()}k`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Current</p>
                                <p className="text-lg font-black text-white tracking-tight leading-none mt-1">
                                    {goal.type === 'hiring_plan' ? `${goal.current_value} Active` : `R${(goal.current_value / 1000).toLocaleString()}k`}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            );
         })}
      </div>

      {/* Narrative Section */}
      <Card className="bg-[#0b0b15] border-white/5 p-12 rounded-[50px] relative overflow-hidden">
         <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
         
         <div className="max-w-2xl space-y-8 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-primary" size={20} />
               </div>
               <h4 className="text-sm font-black text-white uppercase tracking-widest">Strategic Intelligence Narrative</h4>
            </div>

            <div className="space-y-6">
               <blockquote className="text-2xl font-black text-white leading-relaxed tracking-tight italic">
                  "{activeNarrative}"
               </blockquote>
               <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><CheckCircle className="text-emerald-500" size={12} /> Positive Momentum</span>
                  <span className="flex items-center gap-1"><ArrowUpRight className="text-primary" size={12} /> Growth Potential</span>
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}

function CheckCircle({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
