'use client';

import { 
  Zap, 
  Sparkles, 
  Mail, 
  UserPlus, 
  GraduationCap, 
  PlayCircle, 
  Bell, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export const AUTOMATION_BLUEPRINTS = [
  {
    id: 'lead-capture-welcome',
    title: 'Lead Capture & Welcome',
    description: 'Automatically greet new leads from your website forms.',
    icon: UserPlus,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    nodes: [
      { id: '1', type: 'trigger', data: { label: 'Website Form Submitted' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'delay', data: { durationValue: 2, durationUnit: 'minutes', label: 'Wait 2 Minutes' }, position: { x: 0, y: 150 } },
      { id: '3', type: 'action', data: { actionType: 'create_deal', label: 'Add to Sales Pipeline' }, position: { x: 0, y: 300 } },
      { id: '4', type: 'action', data: { actionType: 'send_notif', label: 'Notify Team (Email)', message: 'New lead captured!' }, position: { x: 0, y: 450 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' }
    ]
  },
  {
    id: 'lms-enrollment',
    title: 'LMS Student Onboarding',
    description: 'Automate course access and student tagging.',
    icon: GraduationCap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    nodes: [
      { id: '1', type: 'trigger', data: { label: 'New Student Enrolled' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', data: { actionType: 'update_contact', label: 'Tag as Student' }, position: { x: 0, y: 150 } },
      { id: '3', type: 'action', data: { actionType: 'send_notif', label: 'Send Course Login' }, position: { x: 0, y: 300 } },
      { id: '4', type: 'delay', data: { durationValue: 24, durationUnit: 'hours', label: 'Wait 1 Day' }, position: { x: 0, y: 450 } },
      { id: '5', type: 'action', data: { actionType: 'send_notif', label: 'Check-in Message' }, position: { x: 0, y: 600 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' }
    ]
  },
  {
    id: 'media-content-alert',
    title: 'Media Asset Follow-up',
    description: 'Perfect for content creators & agencies.',
    icon: PlayCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    nodes: [
      { id: '1', type: 'trigger', data: { label: 'Media Upload Complete' }, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', data: { actionType: 'send_notif', label: 'Notify Stakeholders' }, position: { x: 0, y: 150 } },
      { id: '3', type: 'condition', data: { field: 'lead_score', operator: 'greater_than', value: '50', label: 'Check if VIP Client' }, position: { x: 0, y: 320 } }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' }
    ]
  }
];

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nodes: any[], edges: any[]) => void;
}

export function TemplateLibrary({ isOpen, onClose, onSelect }: TemplateLibraryProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#050510]/95 border-white/5 backdrop-blur-2xl text-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Automation Blueprints</DialogTitle>
          </div>
          <DialogDescription className="text-white/40 font-medium">
            Launch professional-grade workflows instantly. All templates are fully customizable.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {AUTOMATION_BLUEPRINTS.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template.nodes, template.edges)}
              className="group flex flex-col text-left p-6 rounded-[28px] bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden relative"
            >
              <div className={cn("p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110", template.bgColor)}>
                <template.icon className={cn("w-6 h-6", template.color)} />
              </div>
              
              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-primary transition-colors">{template.title}</h4>
              <p className="text-[10px] text-white/30 leading-relaxed font-medium mb-4">{template.description}</p>
              
              <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-white/20" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Clock className="w-2.5 h-2.5 text-white/20" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white/20" />
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto">Use Blueprint</span>
              </div>
              
              {/* Subtle Glow Effect */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
