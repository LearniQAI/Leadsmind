import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password | LeadsMind',
  description: 'Set a new password for your LeadsMind account',
};

function ResetPasswordFallback() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
