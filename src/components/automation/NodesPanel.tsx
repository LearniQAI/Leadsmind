"use client";

import { 
  Zap, 
  GitBranch, 
  Clock, 
  MessageSquare, 
  Mail, 
  UserPlus, 
  Share2,
  Database,
  LayoutGrid,
  BellRing,
  GitCompare
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const NODE_CATEGORIES = [
  {
    title: "1. When should this start?",
    items: [
      { type: "trigger", triggerType: "contact_created", label: "New Contact", icon: UserPlus, color: "#10b981", description: "Start when someone new is added" },
      { type: "trigger", triggerType: "form_submitted", label: "Form Filled Out", icon: Mail, color: "#10b981", description: "Start when a website form is submitted" },
    ]
  },
  {
    title: "2. Decision & Logic",
    items: [
      { type: "route", label: "Multi-Branch Router", icon: GitBranch, color: "#f59e0b", description: "Route to up to 6 different paths" },
      { type: "condition", label: "Yes/No Decision", icon: GitBranch, color: "#f59e0b", description: "Split the flow into two paths" },
      { type: "split", label: "A/B Split Test", icon: GitCompare, color: "#f43f5e", description: "Test two versions of a flow" },
      { type: "delay", label: "Wait a while", icon: Clock, color: "#6366f1", description: "Pause before the next step" }
    ]
  },
  {
    title: "3. Perform an Auto-Action",
    items: [
      { type: "action", actionType: "email", label: "Send Email", icon: Mail, color: "#6366f1", description: "Send an automated email" },
      { type: "action", actionType: "sms", label: "Send Text", icon: MessageSquare, color: "#6366f1", description: "Send an automated SMS" },
      { type: "action", actionType: "update_field", label: "Update Record", icon: LayoutGrid, color: "#6366f1", description: "Change status or add tags" },
    ]
  },
  {
    title: "4. Conversion Goals",
    items: [
      { type: "goal", label: "Set Goal Indicator", icon: Zap, color: "#06b6d4", description: "Mark a primary objective for this flow" }
    ]
  }
];

interface NodesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: string, item: any) => void;
}

export function NodesPanel({ isOpen, onClose, onAdd }: NodesPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[380px] p-0 bg-[#050510]/95 border-r border-white/5 backdrop-blur-3xl">
        <SheetHeader className="p-8 border-b border-white/5 bg-[#0b0b15]/50">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-primary/20 rounded-xl">
                <Zap size={18} className="text-primary fill-primary" />
             </div>
             <SheetTitle className="text-xl font-black uppercase tracking-tight text-white">Step Library</SheetTitle>
          </div>
          <SheetDescription className="text-[11px] text-white/30 font-bold uppercase tracking-widest mt-2">
            Add logic or actions to your flow
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] w-full">
          <div className="p-6 space-y-10">
            {NODE_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-2">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => onAdd(item.type, item)}
                      className="group w-full flex items-center gap-4 rounded-[22px] p-4 text-left transition-all duration-500 hover:bg-white/5 border border-transparent hover:border-white/5"
                    >
                      <div 
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 shadow-inner"
                        style={{ color: item.color }}
                      >
                        <item.icon size={20} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[12px] font-bold text-white/90 uppercase tracking-tight group-hover:text-primary transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[10px] leading-snug text-white/30 line-clamp-2 italic font-medium group-hover:text-white/50">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
