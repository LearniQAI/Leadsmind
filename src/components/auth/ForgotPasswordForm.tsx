'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/app/actions/auth';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsLoading(true);
    try {
      const result = await forgotPassword(values.email);
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Reset link sent!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#6c47ff]/10 text-[#6c47ff]">
          <Mail className="h-6 w-6" />
        </div>
        <CardHeader className="space-y-1 px-0 pb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Check email</CardTitle>
          <CardDescription className="text-sm font-light text-foreground/40">
            We&apos;ve sent a password reset link to your email address if it exists in our system.
          </CardDescription>
        </CardHeader>
        <Button asChild variant="outline" className="h-11 rounded-full border-white/10 bg-white/3 text-xs font-semibold text-foreground/60 transition-all hover:bg-white/5">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back to login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Forgot password?</CardTitle>
        <CardDescription className="text-sm font-light text-foreground/40">
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="h-12 w-full rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              'Send Reset Link →'
            )}
          </Button>
        </form>
      </CardContent>
      <div className="mt-8 text-center text-sm font-light text-foreground/40">
        <Link href="/login" className="inline-flex items-center text-[#6c47ff]/60 hover:text-[#6c47ff] hover:underline underline-offset-4">
          <ArrowLeft className="mr-2 h-3 w-3" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
