import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Welcome to LeadsMind',
  description: 'Welcome to the world\'s best CRM and LMS all-in-one place platform.',
};

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>

      <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground">
        Welcome to LeadsMind!
      </h1>
      
      <p className="mb-8 text-base font-light leading-relaxed text-foreground/60">
        Thank you for your interest in LeadsMind and welcome to the world&apos;s best CRM and LMS all-in-one place platform.
      </p>

      <div className="w-full space-y-4">
        <Button 
          asChild 
          className="h-12 w-full rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6c47ff]/30 active:scale-95"
        >
          <Link href="/dashboard" className="flex items-center justify-center gap-2">
            Continue to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        
        <p className="text-[0.7rem] font-light text-foreground/40">
          Setting up your workspace... you&apos;ll be redirected shortly.
        </p>
      </div>
    </div>
  );
}
