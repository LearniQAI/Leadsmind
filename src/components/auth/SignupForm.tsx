'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupValues } from '@/lib/validations/auth.schema';
import { createClient } from '@/lib/supabase/client';
import { setupWorkspace, setActiveWorkspace } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignupValues) {
    setIsLoading(true);
    try {
      // Step 1: Sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
          emailRedirectTo: 'https://www.leadsmind.io/auth/callback?next=/welcome',
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          toast.error('An account with this email already exists. Try logging in.');
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error('Signup succeeded but no user was returned. Please try logging in.');
        return;
      }

      const userId = authData.user.id;
      const session = authData.session;

      // If no session is returned, it means email confirmation is required
      if (!session) {
        setIsVerificationSent(true);
        toast.success('Verification email sent! Please check your inbox.');
        return;
      }
      const nameParts = values.fullName.trim().split(' ');
      const firstName = nameParts[0] ?? values.email.split('@')[0];
      const lastName = nameParts.slice(1).join(' ');


      try {
        const result = await setupWorkspace({
          userId,
          email: values.email,
          firstName,
          lastName,
          workspaceName: `${values.fullName}'s Workspace`,
        });

        if (result.success && result.workspaceId) {
          await setActiveWorkspace(result.workspaceId);
        } else {
          console.warn('[SignupForm] setupWorkspace non-success:', result.error);
          // Don't block — dashboard handles missing workspace gracefully
        }
      } catch (setupErr) {
        console.warn('[SignupForm] setupWorkspace threw (non-blocking):', setupErr);
        // Still proceed — dashboard & auth.ts will auto-create workspace
      }

      toast.success('Account created! Welcome to LeadsMind.');
      router.push('/welcome');
      router.refresh();
    } catch (error) {
      console.error('[SignupForm] Unexpected error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerificationSent) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/5">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <CardHeader className="space-y-1 px-0 pb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white line-clamp-1">Check your email</CardTitle>
          <CardDescription className="text-sm font-light text-white/40">
            We've sent a verification link to <span className="font-bold text-white/60">{form.getValues('email')}</span>. 
            Click the link in the email to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/30 leading-relaxed text-left">
            <p className="mb-2 font-bold text-white/40 uppercase tracking-widest text-[9px]">Didn't receive the email?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Check your spam folder</li>
              <li>Wait a few minutes (it can take time)</li>
              <li>Ensure your email address is correct</li>
            </ul>
          </div>
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-full border-white/10 hover:bg-white/5 font-bold"
            onClick={() => setIsVerificationSent(false)}
          >
            ← Back to signup
          </Button>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Create account</CardTitle>
        <CardDescription className="text-sm font-light text-foreground/40">
          Get started with your Leadsmind account today.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[0.8rem] font-medium text-foreground/60">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Elon Musk"
              className="h-12 border-white/5 bg-white/3 px-4 transition-all focus:border-[#6c47ff]/50 focus:ring-0"
              {...form.register('fullName')}
              disabled={isLoading}
            />
            {form.formState.errors.fullName && (
              <p className="text-[0.7rem] font-medium text-destructive/80">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[0.8rem] font-medium text-foreground/60">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="elon@spacex.com"
              className="h-12 border-white/5 bg-white/3 px-4 transition-all focus:border-[#6c47ff]/50 focus:ring-0"
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-[0.7rem] font-medium text-destructive/80">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[0.8rem] font-medium text-foreground/60">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-12 border-white/5 bg-white/3 px-4 pr-12 transition-all focus:border-[#6c47ff]/50 focus:ring-0"
                {...form.register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-[0.7rem] font-medium text-destructive/80">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[0.8rem] font-medium text-foreground/60">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-12 border-white/5 bg-white/3 px-4 transition-all focus:border-[#6c47ff]/50 focus:ring-0"
              {...form.register('confirmPassword')}
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-[0.7rem] font-medium text-destructive/80">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <div className="pt-2">
            <p className="mb-6 text-[0.75rem] font-light leading-relaxed text-foreground/30">
              By joining, you agree to our{' '}
              <Link href="/terms" className="text-foreground/50 underline underline-offset-4 hover:text-[#6c47ff]">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-foreground/50 underline underline-offset-4 hover:text-[#6c47ff]">Privacy Policy</Link>.
            </p>
            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account →'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <div className="mt-8 text-center text-sm font-light text-foreground/40">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#6c47ff] hover:underline underline-offset-4">
          Log in
        </Link>
      </div>
    </div>
  );
}
