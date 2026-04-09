import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Log In | LeadsMind',
  description: 'Log in to your LeadsMind account to manage your leads and team.',
};

function LoginFallback() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#6c47ff]/60" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
