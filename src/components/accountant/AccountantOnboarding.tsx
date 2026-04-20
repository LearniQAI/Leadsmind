'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Lightbulb, 
  ShieldCheck, 
  Landmark,
  Briefcase,
  PieChart,
  Target,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveAccountantOnboarding } from '@/app/actions/accountant';

type OnboardingData = {
  business_structure: string;
  tax_scope: string;
  industry: string;
  has_business_bank_account: boolean;
  sars_registered: boolean;
  vat_registered: boolean;
  tax_number: string;
  vat_number: string;
  fiscal_year_start: string;
};

type StepOption = {
  id: string;
  label: string;
  desc?: string;
};

type Step = {
  id: string;
  title: string;
  description: string;
  icon?: any;
  options?: StepOption[];
  confirmLabel?: string;
  denyLabel?: string;
};

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: "Meet your AI Accountant",
    description: "I'm here to ensure your business stays SARS-compliant while you focus on growth.",
    icon: Sparkles
  },
  {
    id: 'structure',
    title: "How is your business structured?",
    description: "This determines your tax obligations and the reports I'll generate for you.",
    options: [
      { id: 'sole_prop', label: 'Sole Proprietor', desc: 'Simple setup, you are the business' },
      { id: 'pty_ltd', label: 'Pty Ltd', desc: 'Separate legal entity, formal compliance' },
      { id: 'npo', label: 'NPO / Section 21', desc: 'Non-profit or Community Focused' },
      { id: 'trust', label: 'Trust', desc: 'Estate planning or specific investment' }
    ]
  },
  {
    id: 'industry',
    title: "Which industry do you operate in?",
    description: "I'll tailor your Chart of Accounts and expense categories to match your sector.",
    options: [
      { id: 'services', label: 'Professional Services', desc: 'Consulting, Agency, Freelance' },
      { id: 'retail', label: 'Retail & E-commerce', desc: 'Physical goods, Inventory' },
      { id: 'construction', label: 'Construction & Trades', desc: 'Contractors, Engineering' },
      { id: 'healthcare', label: 'Healthcare', desc: 'Clinics, Practitioners' },
      { id: 'law', label: 'Legal Services', desc: 'Trust accounts, Law firms' }
    ]
  },
  {
    id: 'bank_gate',
    title: "The Golden Rule: Separation",
    description: "Do you have a dedicated bank account for this business, separate from your personal accounts?",
    icon: Landmark,
    confirmLabel: "Yes, it's separate",
    denyLabel: "No, I mix them"
  },
  {
    id: 'sars_setup',
    title: "Compliance Setup",
    description: "Are you currently registered with SARS for Income Tax?",
    options: [
      { id: 'yes', label: 'Yes, I have a tax number' },
      { id: 'no', label: 'No, not registered yet' },
      { id: 'process', label: 'Registration in progress' }
    ]
  },
  {
    id: 'vat_setup',
    title: "VAT Registration",
    description: "In South Africa, VAT registration is mandatory if turnover exceeds R1 million/year.",
    options: [
      { id: 'vat_registered', label: 'I am VAT Registered' },
      { id: 'not_vat_registered', label: 'I am NOT VAT Registered' }
    ]
  },
  {
    id: 'scope',
    title: "What do you need me to cover?",
    description: "Pick the level of intelligence you need from your AI Accountant.",
    options: [
      { id: 'vat_only', label: 'VAT Intelligence Only', desc: 'I just need to submit VAT returns accurately' },
      { id: 'full_books', label: 'Full Financial Control', desc: 'Comprehensive books, Balance Sheet, and P&L' },
      { id: 'basic', label: 'Basic Tracking', desc: 'Just monitor my income and basic expenses' }
    ]
  },
  {
    id: 'final',
    title: "Ready to launch!",
    description: "I'm setting up your industry-specific Chart of Accounts and compliance triggers.",
    icon: Check
  }
];

export default function AccountantOnboarding({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({
    business_structure: '',
    industry: '',
    tax_scope: '',
    has_business_bank_account: false,
    sars_registered: false,
    vat_registered: false,
  });
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      await saveAccountantOnboarding(workspaceId, {
        ...data,
        is_completed: true
      });
      toast.success("Onboarding complete! Your AI Accountant is ready.");
      router.push("/accountant/dashboard");
    } catch (error) {
      toast.error("Failed to save your progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectOption = async (id: string, value: string) => {
    const newData = { ...data, [id]: value };
    setData(newData);
    
    // Auto-save progress
    try {
        setIsSubmitting(true);
        await saveAccountantOnboarding(workspaceId, newData);
        setTimeout(nextStep, 100); // Slight delay for smooth animation
    } catch (e) {
        console.warn("Failed to auto-save", e);
        nextStep(); // Move forward anyway to not block user
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="w-full max-w-2xl z-10 space-y-12">
        {/* Progress Bar */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Step {currentStepIndex + 1} of {STEPS.length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{Math.round(progress)}% Complete</span>
           </div>
           <Progress value={progress} className="h-1 bg-white/5 border-none overflow-hidden [&>div]:bg-primary shadow-[0_0_20px_rgba(108,71,255,0.3)] transition-all" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <div className="space-y-4 text-center md:text-left">
              {currentStep.icon && (
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
                   <currentStep.icon className="text-primary w-8 h-8" />
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                {currentStep.title}
              </h1>
              <p className="text-lg text-white/40 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Options UI */}
            {currentStep.options && (
              <div className="grid grid-cols-1 gap-4">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isSubmitting}
                    onClick={() => selectOption(currentStep.id, opt.id)}
                    className={cn(
                      "group p-6 rounded-3xl text-left transition-all duration-500 border border-white/5",
                      "bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
                      data[currentStep.id as keyof OnboardingData] === opt.id ? "bg-primary/10 border-primary shadow-xl shadow-primary/20" : "",
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{opt.label}</h3>
                        {opt.desc && <p className="text-sm text-white/30 font-medium">{opt.desc}</p>}
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500",
                        data[currentStep.id as keyof OnboardingData] === opt.id 
                          ? "bg-primary border-primary text-white scale-110" 
                          : "border-white/10 text-transparent"
                      )}>
                        {isSubmitting && data[currentStep.id as keyof OnboardingData] === opt.id 
                          ? <Loader2 size={16} className="animate-spin text-white" />
                          : <Check size={16} strokeWidth={4} />
                        }
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Gate UI */}
            {currentStep.id === 'bank_gate' && (
              <div className="flex flex-col gap-4">
                 <Button 
                    onClick={() => {
                        setData(prev => ({...prev, has_business_bank_account: true}));
                        nextStep();
                    }}
                    disabled={isSubmitting}
                    className="h-20 bg-primary hover:bg-primary/90 text-white rounded-3xl text-xl font-black tracking-widest uppercase shadow-2xl shadow-primary/40 group"
                 >
                    {currentStep.confirmLabel}
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 <Card className="bg-rose-500/10 border-rose-500/20 p-6 rounded-3xl">
                    <div className="flex items-center gap-4 text-rose-500">
                       <ShieldCheck className="shrink-0" />
                       <p className="text-sm font-bold leading-relaxed">{currentStep.denyLabel}: Careful! Mixing funds makes automated tax audits nearly impossible. I recommend opening a business account before proceeding.</p>
                    </div>
                 </Card>
              </div>
            )}

            {/* Welcome / Final UI */}
            {(currentStep.id === 'welcome' || currentStep.id === 'final') && (
              <Button 
                onClick={nextStep}
                disabled={isSubmitting}
                className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-3xl text-xl font-black tracking-widest uppercase shadow-2xl transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  currentStep.id === 'welcome' ? "Let's Get Started" : "Enter AI Dashboard"
                )}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-10 border-t border-white/5">
           <Button 
            variant="ghost" 
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="text-white/20 hover:text-white h-12 px-6 rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px]"
           >
              <ChevronLeft size={16} /> Back
           </Button>

           <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                 <ShieldCheck size={14} className="text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Secured with RLS</span>
              </div>
           </div>
        </div>
      </div>

      {/* Accountant Tip - Repositioned to avoid overlap */}
      <div className="mt-20 w-full max-w-2xl px-4 lg:px-0">
          <Card className="bg-white/[0.02] border-white/5 p-8 rounded-3xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center gap-6 group hover:bg-white/[0.04] transition-all duration-500">
             <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Lightbulb className="text-primary" />
             </div>
             <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Accountant Tip</h4>
                <p className="text-sm text-white/60 leading-relaxed font-bold italic">"Did you know? Sole proprietors can claim a portion of their home rent if used for business. I'll help you track this."</p>
             </div>
          </Card>
      </div>
    </div>
  );
}
