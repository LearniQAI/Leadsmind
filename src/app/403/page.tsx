import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import { BackgroundEffects } from '@/components/marketing/BackgroundEffects';

export const metadata: Metadata = {
  title: 'Access Denied | LeadsMind',
  description: 'You do not have permission to access this page.',
};

export default function AccessDeniedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <BackgroundEffects />
      
      <div className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl md:p-12 animate-fade-up">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-destructive/30 to-transparent" />
        
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
          <ShieldAlert className="h-10 w-10 text-destructive animate-pulse" />
        </div>
        
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground">Access Denied</h1>
        
        <p className="mb-10 text-[1rem] font-light leading-relaxed text-foreground/40">
          You do not have the required permissions to view this page. If you believe this is an error, please contact your workspace administrator.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild className="h-12 rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] px-8 font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full border-white/10 bg-white/3 px-8 font-semibold text-foreground/60 transition-all hover:bg-white/5 hover:text-foreground" size="lg">
            <Link href="/" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 mt-12">
        <Link href="/" className="group flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity">
          <span className="text-xl font-extrabold tracking-tighter text-foreground">
            Leads<span className="text-[#fdab3d]">Mind</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
