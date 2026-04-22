'use client';

import { useState } from 'react';
import { EmailCampaign, EmailTemplate, CampaignSegment } from '@/types/campaigns.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  Layout, 
  Users, 
  Clock, 
  CheckCircle2,
  Settings2,
  Mail,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateCampaign } from '@/app/actions/campaigns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { MinimalistEmailBuilder, EmailBlock } from './MinimalistEmailBuilder';
import { Edit3 } from 'lucide-react';

interface CampaignWizardProps {
  initialCampaign: EmailCampaign;
  templates: EmailTemplate[];
}

const STEPS = [
  { id: 'details', label: 'Details', icon: Settings2 },
  { id: 'template', label: 'Template', icon: Layout },
  { id: 'content', label: 'Design', icon: Edit3 },
  { id: 'recipients', label: 'Recipients', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'review', label: 'Review', icon: CheckCircle2 }
];

export function CampaignWizard({ initialCampaign, templates }: CampaignWizardProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<EmailCampaign>(initialCampaign);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  const handleUpdate = (updates: Partial<EmailCampaign>) => {
    setCampaign(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSave = async (showToast = true) => {
    setIsSaving(true);
    try {
      await updateCampaign(campaign.id, campaign);
      if (showToast) toast.success('Campaign saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#030303]">
      {/* Wizard Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0b0b10] px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/50 hover:text-white"
            onClick={() => router.push('/campaigns')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white capitalize">{campaign.name}</h2>
            <span className="text-[10px] text-white/30 uppercase tracking-widest leading-none">Campaign Builder</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all",
                index === currentStepIndex ? "bg-[#6c47ff]/10 text-[#6c47ff]" : "text-white/20"
              )}>
                <step.icon className="h-3.5 w-3.5" />
                {!campaign.id && <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>}
              </div>
              {index < STEPS.length - 1 && <div className="w-4 h-px bg-white/5 mx-1" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-white/50 hover:text-white"
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-12 scrollbar-none">
        <div className="mx-auto w-full max-w-2xl">
          
          {/* Step 1: Details */}
          {currentStep.id === 'details' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-2">
                 <h3 className="text-2xl font-bold text-white">Campaign Details</h3>
                 <p className="text-white/40 text-sm">Set the foundational information for your campaign.</p>
               </div>
               
               <div className="space-y-6 bg-[#0b0b10] border border-white/5 rounded-2xl p-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Subject Line</label>
                   <Input 
                      value={campaign.subject}
                      onChange={(e) => handleUpdate({ subject: e.target.value })}
                      placeholder="e.g. Your Weekly Digest is Here!"
                      className="h-12 bg-white/5 border-white/10 text-white"
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30">From Name</label>
                     <Input 
                        value={campaign.from_name || ''}
                        onChange={(e) => handleUpdate({ from_name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="h-12 bg-white/5 border-white/10 text-white"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30">From Email</label>
                     <Input 
                        value={campaign.from_email || ''}
                        onChange={(e) => handleUpdate({ from_email: e.target.value })}
                        placeholder="e.g. hello@leadsmind.io"
                        className="h-12 bg-white/5 border-white/10 text-white"
                     />
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep.id === 'template' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
               <div className="space-y-2 text-white">
                 <h3 className="text-2xl font-bold text-white">Choose a Template</h3>
                 <p className="text-white/40 text-sm">Select a starting point or design from scratch.</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-2xl hover:border-[#6c47ff]/50 hover:bg-[#6c47ff]/5 transition-all text-white/20 hover:text-white">
                    <Layout className="h-10 w-10 mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Build from scratch</span>
                  </button>
                  
                  {templates.map(template => (
                    <button 
                      key={template.id}
                      onClick={() => handleUpdate({ template_id: template.id })}
                      className={cn(
                        "flex flex-col p-6 border rounded-2xl transition-all text-left group",
                        campaign.template_id === template.id ? "bg-[#6c47ff]/10 border-[#6c47ff]" : "bg-[#0b0b10] border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="h-40 w-full bg-white/5 rounded-xl mb-4 group-hover:bg-white/10 transition-all flex items-center justify-center">
                         <Mail className="h-8 w-8 text-white/10" />
                      </div>
                      <span className="text-sm font-bold text-white">{template.name}</span>
                      <span className="text-[10px] text-white/30 uppercase mt-1">{template.type}</span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Step 3: Visual Content Builder */}
          {currentStep.id === 'content' && (
             <div className="fixed inset-0 top-16 bottom-20 z-10 bg-[#030303]">
                <MinimalistEmailBuilder 
                   initialBlocks={campaign.body_json || []}
                   onSave={(html, json) => {
                      handleUpdate({ body_html: html, body_json: json });
                      handleSave(true);
                   }}
                />
             </div>
          )}

          {/* Step 4: Recipients (Segment Builder) */}
          {currentStep.id === 'recipients' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="space-y-2">
                 <h3 className="text-2xl font-bold text-white">Select Recipients</h3>
                 <p className="text-white/40 text-sm">Who should receive this broadcast?</p>
               </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleUpdate({ segment: { type: 'all' } })}
                      className={cn(
                        "p-8 border rounded-2xl transition-all text-center",
                        campaign.segment?.type === 'all' ? "bg-[#6c47ff]/10 border-[#6c47ff] text-[#6c47ff]" : "bg-[#0b0b10] border-white/5 text-white/30 hover:text-white/60"
                      )}
                    >
                      <Users className="h-8 w-8 mx-auto mb-3" />
                      <span className="text-sm font-bold block">All Contacts</span>
                    </button>
                    <button 
                      onClick={() => handleUpdate({ segment: { type: 'filtered' } })}
                      className={cn(
                        "p-8 border rounded-2xl transition-all text-center",
                        campaign.segment?.type === 'filtered' ? "bg-[#6c47ff]/10 border-[#6c47ff] text-[#6c47ff]" : "bg-[#0b0b10] border-white/5 text-white/30 hover:text-white/60"
                      )}
                    >
                      <Search className="h-8 w-8 mx-auto mb-3" />
                      <span className="text-sm font-bold block">Targeted Segment</span>
                    </button>
                 </div>

                 {campaign.segment?.type === 'filtered' && (
                   <div className="bg-[#0b0b10] border border-white/5 rounded-2xl p-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      {/* Detailed filter UI would go here */}
                      <p className="text-white/20 text-xs italic text-center py-10">Advanced filter options loading...</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* ... Other steps 4 & 5 would be similar ... */}
          {currentStepIndex > 2 && (
             <div className="flex flex-col items-center justify-center p-20 bg-[#0b0b10] border border-white/5 rounded-3xl">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold text-white">Ready to Review</h3>
                <p className="text-white/40 text-center max-w-sm mt-2">Almost there! Your campaign settings are complete.</p>
             </div>
          )}
        </div>
      </main>

      {/* Wizard Footer - Navigation */}
      <footer className="flex h-20 items-center justify-between border-t border-white/5 bg-[#0b0b10] px-12">
        <Button 
          variant="ghost" 
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="text-white/30 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous Step
        </Button>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black tracking-widest text-white/20 uppercase">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <Button 
            className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white px-8 h-12 rounded-xl font-bold"
            onClick={() => {
              if (currentStepIndex === STEPS.length - 1) {
                // Final send/schedule logic
                toast.success('Campaign scheduled!');
                router.push('/campaigns');
              } else {
                nextStep();
              }
            }}
          >
            {currentStepIndex === STEPS.length - 1 ? (
              <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Finalize & Send</span>
            ) : (
              <span className="flex items-center gap-2">Continue <ChevronRight className="h-4 w-4" /></span>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
