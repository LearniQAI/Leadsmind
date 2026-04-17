"use client";

import { 
  Zap, 
  Play, 
  GitBranch, 
  Clock, 
  MousePointer2, 
  Lightbulb,
  X,
  Code,
  LayoutDashboard,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function WorkflowGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[420px] p-0 bg-[#050510]/95 border-l border-white/5 backdrop-blur-3xl">
        <SheetHeader className="p-8 border-b border-white/5 bg-[#0b0b15]/50">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-[#6c47ff]/20 rounded-xl">
                <Lightbulb className="w-5 h-5 text-[#6c47ff]" />
             </div>
             <SheetTitle className="text-xl font-black uppercase tracking-tight text-white">How it Works</SheetTitle>
          </div>
          <SheetDescription className="text-[11px] text-white/30 font-bold uppercase tracking-widest mt-2">
            Master the Leadsmind Automation Engine
          </SheetDescription>
        </SheetHeader>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
        {/* Core Concept */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">The Core Loop</h3>
          <p className="text-sm text-white/50 leading-relaxed font-medium">
            Automations follow a simple logic: <span className="text-white">When [Trigger]</span> happens, <span className="text-white">run [Actions]</span>.
          </p>
        </section>

        {/* Node Types */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">Workflow Components</h3>
          
          <div className="grid gap-3">
            <GuideCard 
              icon={Zap} 
              color="text-emerald-400" 
              bg="bg-emerald-400/10" 
              title="Triggers" 
              desc="The event that starts the flow (e.g., Contact Created, Lead Form Submitted)."
            />
            <GuideCard 
              icon={Play} 
              color="text-blue-400" 
              bg="bg-blue-400/10" 
              title="Actions" 
              desc="Tasks performed by the system (e.g., Send Email, Post to Social Media, CRM update)."
            />
            <GuideCard 
              icon={GitBranch} 
              color="text-amber-400" 
              bg="bg-amber-400/10" 
              title="Conditions" 
              desc="Decision points. Check lead data to follow different paths (If email contains @work...)."
            />
            <GuideCard 
              icon={Clock} 
              color="text-sky-400" 
              bg="bg-sky-400/10" 
              title="Delays" 
              desc="Wait for a specific duration before proceeding to the next step."
            />
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">Quick Tips</h3>
          <ul className="space-y-4">
            <TipItem 
              icon={MousePointer2} 
              title="Connect Nodes" 
              desc="Drag from the bottom handle of a node to the top handle of another to connect them." 
            />
            <TipItem 
              icon={Save} 
              title="Publish" 
              desc="Automations save as drafts. Click 'Publish' to make them active for new leads." 
            />
            <TipItem 
              icon={LayoutDashboard} 
              title="Lead Capture" 
              desc="Use our Form Builder to get an embed snippet for your website. Submissions will trigger your flows." 
            />
          </ul>
        </div>

        <div className="pt-6 border-t border-white/5">
          <Button 
            onClick={onClose}
            className="w-full bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-bold rounded-xl h-11"
          >
            Got it, let's build!
          </Button>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GuideCard({ icon: Icon, color, bg, title, desc }: any) {
  return (
    <Card className="bg-white/5 border-white/5 rounded-2xl overflow-hidden group hover:border-[#6c47ff]/30 transition-all">
      <CardContent className="p-4 flex gap-4">
        <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div className="space-y-1">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</h4>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TipItem({ icon: Icon, title, desc }: any) {
  return (
    <li className="flex gap-3">
      <Icon className="w-4 h-4 text-[#6c47ff] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-white">{title}</h4>
        <p className="text-[11px] text-white/30 leading-relaxed font-medium">{desc}</p>
      </div>
    </li>
  );
}
