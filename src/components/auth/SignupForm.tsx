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
import { Loader2 } from 'lucide-react';

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
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
      // 1. Sign up user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('An account with this email already exists');
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // 2. Create records in our application tables
      // For Phase 1, we do this in a multi-step process. 
      // In a real production app, you might use a Supabase Function or a Trigger to handle this atomically.
      
      const userId = authData.user.id;
      const [firstName, ...lastNameParts] = values.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const result = await setupWorkspace({
        userId,
        email: values.email,
        firstName,
        lastName,
        workspaceName: `${values.fullName}'s Workspace`,
      });

      if (result.success) {
        await setActiveWorkspace(result.workspaceId!);
        toast.success('Account created successfully!');
        router.push('/welcome');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to set up workspace');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong during signup');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Create account</CardTitle>
        <CardDescription className="text-sm font-light text-foreground/40">
          Start your free trial today. No credit card required.
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
            <Label htmlFor="password" title="At least 8 characters" className="text-[0.8rem] font-medium text-foreground/60">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 border-white/5 bg-white/3 px-4 transition-all focus:border-[#6c47ff]/50 focus:ring-0"
              {...form.register('password')}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-[0.7rem] font-medium text-destructive/80">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" title="Must match password" className="text-[0.8rem] font-medium text-foreground/60">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
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
              <Link href="/terms" className="text-foreground/50 underline underline-offset-4 hover:text-[#6c47ff]">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-foreground/50 underline underline-offset-4 hover:text-[#6c47ff]">
                Privacy Policy
              </Link>.
            </p>
            <Button type="submit" className="h-12 w-full rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5" disabled={isLoading}>
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
