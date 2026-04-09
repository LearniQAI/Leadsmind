import { SignupForm } from '@/components/auth/SignupForm';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign Up | LeadsMind',
  description: 'Create your LeadsMind account and set up your workspace.',
};

function SignupFallback() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#6c47ff]/60" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  );
}
