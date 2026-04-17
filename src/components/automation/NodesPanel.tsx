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
  BellRing
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const NODE_CATEGORIES = [
  {
    title: "1. When should this start?",
    items: [
      { type: "trigger", triggerType: "contact_created", label: "New Contact", icon: UserPlus, color: "#10b981", description: "Start when someone new is added" },
      { type: "trigger", triggerType: "form_submitted", label: "Form Filled Out", icon: Mail, color: "#10b981", description: "Start when a website form is submitted" },
      { type: "trigger", triggerType: "webhook", label: "Website Sync", icon: Share2, color: "#10b981", description: "Sync data from your own website" }
    ]
  },
  {
    title: "2. Add a decision or a wait",
    items: [
      { type: "condition", label: "Add a Decision", icon: GitBranch, color: "#f59e0b", description: "Split the flow (e.g. Yes/No)" },
      { type: "delay", label: "Wait a while", icon: Clock, color: "#0ea5e9", description: "Pause before the next step" }
    ]
  },
  {
    title: "3. What should happen?",
    items: [
      { type: "action", label: "Change Lead Info", icon: Database, actionType: "update_field", color: "#6c47ff", description: "Update details like tags or score" },
      { type: "action", label: "Move in Pipeline", icon: LayoutGrid, actionType: "move_to_stage", color: "#6c47ff", description: "Move lead to a new sales column" },
      { type: "action", label: "Internal Alert", icon: BellRing, actionType: "notify_team", color: "#f43f5e", description: "Notify yourself or your team" }
    ]
  },
  {
    title: "Communication",
    items: [
      { type: "action", label: "Message Lead (SMS)", icon: MessageSquare, actionType: "sms", color: "#38bdf8", description: "Send an automated text message" },
      { type: "action", label: "Send an Email", icon: Mail, actionType: "email", color: "#38bdf8", description: "Send a personalized automated email" },
      { type: "action", label: "Post to Socials", icon: Share2, actionType: "social_post", color: "#ec4899", description: "Auto-post to Facebook or LinkedIn" }
    ]
  }
];

interface NodesPanelProps {
  onAddNode: (type: string, data: any) => void;
}

export function NodesPanel({ onAddNode }: NodesPanelProps) {
  return (
    <div className="absolute top-24 left-8 z-20 w-80 rounded-[32px] border border-white/5 bg-[#080812]/90 p-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] backdrop-blur-3xl ring-1 ring-white/10">
      <div className="px-5 py-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">Add Action</h2>
        <p className="text-[9px] text-white/40 font-medium mt-1 italic">Pick what should happen next in your workflow</p>
      </div>
      
      <ScrollArea className="h-[520px] px-3">
        <div className="space-y-8 pb-4">
          {NODE_CATEGORIES.map((category: any) => (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <h3 className="text-[9px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                  {category.title}
                </h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid gap-2">
                {category.items.map((item: any) => (
                  <button
                    key={item.label}
                    onClick={() => onAddNode(item.type, item)}
                    className="group relative flex items-start gap-4 rounded-2xl p-4 text-left transition-all hover:bg-white/5 active:scale-95"
                  >
                    <div 
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 shadow-inner"
                      style={{ color: item.color }}
                    >
                      <item.icon size={20} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[12px] font-bold text-white/90 uppercase tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[10px] leading-snug text-white/30 line-clamp-2 italic font-medium">
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
    </div>
  );
}
