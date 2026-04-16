"use client";

import { 
  Zap, 
  Play, 
  GitBranch, 
  Clock, 
  MessageSquare, 
  Mail, 
  UserPlus, 
  Tag,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const NODE_CATEGORIES = [
  {
    title: "Triggers",
    items: [
      { type: "trigger", label: "Contact Created", icon: UserPlus, color: "#10b981", description: "When a new lead enters the system" },
      { type: "trigger", label: "Tag Added", icon: Tag, color: "#10b981", description: "When a specific tag is applied" },
      { type: "trigger", label: "Webhook", icon: Zap, color: "#10b981", description: "Trigger from external HTTP request" }
    ]
  },
  {
    title: "Logic",
    items: [
      { type: "condition", label: "If / Else", icon: GitBranch, color: "#f59e0b", description: "Split flow based on conditions" },
      { type: "delay", label: "Wait / Delay", icon: Clock, color: "#0ea5e9", description: "Pause flow for a duration" }
    ]
  },
  {
    title: "Actions",
    items: [
      { type: "action", label: "Send SMS", icon: MessageSquare, actionType: "sms", color: "#6c47ff", description: "Send automated text message" },
      { type: "action", label: "Send Email", icon: Mail, actionType: "email", color: "#6c47ff", description: "Send personalized email" },
      { type: "action", label: "Apply Tag", icon: Tag, actionType: "tag", color: "#6c47ff", description: "Add tag to the contact" },
      { type: "action", label: "Social Post", icon: ArrowRight, actionType: "social_post", color: "#ec4899", description: "Post to Facebook/LinkedIn" },
      { type: "action", label: "LMS Enroll", icon: Zap, actionType: "lms_enroll", color: "#8b5cf6", description: "Enroll student in course" },
      { type: "action", label: "LMS Progress", icon: ArrowRight, actionType: "lms_update_progress", color: "#8b5cf6", description: "Update lesson progress" }
    ]
  }
];

interface NodesPanelProps {
  onAddNode: (type: string, data: any) => void;
}

export function NodesPanel({ onAddNode }: NodesPanelProps) {
  return (
    <div className="absolute top-24 left-6 z-20 w-72 rounded-3xl border border-white/5 bg-[#050510]/80 p-1 shadow-2xl backdrop-blur-3xl">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Step Library</h2>
      </div>
      
      <ScrollArea className="h-[500px] px-2 py-2">
        <div className="space-y-6">
          {NODE_CATEGORIES.map((category) => (
            <div key={category.title} className="space-y-2">
              <h3 className="px-2 text-[9px] font-bold uppercase tracking-widest text-white/20">
                {category.title}
              </h3>
              <div className="grid gap-1">
                {category.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onAddNode(item.type, item)}
                    className="group relative flex items-start gap-3 rounded-2xl p-3 text-left transition-all hover:bg-white/5"
                  >
                    <div 
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-transform group-hover:scale-110"
                      style={{ color: item.color }}
                    >
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1 pr-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                          {item.label}
                        </span>
                        <ArrowRight size={10} className="text-white/0 transition-all group-hover:text-white/20" />
                      </div>
                      <p className="text-[9px] leading-relaxed text-white/30 line-clamp-1">
                        {item.description}
                      </p>
                    </div>

                    {/* Hover Glow */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
                      style={{ 
                        background: `radial-gradient(400px circle at var(--x) var(--y), ${item.color}10, transparent 40%)` 
                      }}
                    />
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
