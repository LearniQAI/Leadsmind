'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordValues } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth';

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setIsLoading(true);
    try {
      const result = await resetPassword(values.password);
      if (result.success) {
        toast.success('Password updated successfully!');
        router.push('/login');
      } else {
        toast.error(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#6c47ff]/10 text-[#6c47ff]">
        <KeyRound className="h-6 w-6" />
      </div>
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Set new password</CardTitle>
        <CardDescription className="text-sm font-light text-foreground/40">
          Ensure your new password is secure and easy to remember.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" title="At least 8 characters" className="text-[0.8rem] font-medium text-foreground/60">New Password</Label>
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
            <Label htmlFor="confirmPassword" title="Must match password" className="text-[0.8rem] font-medium text-foreground/60">Confirm New Password</Label>
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
          <Button type="submit" className="h-12 w-full rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password →'
            )}
          </Button>
        </form>
      </CardContent>
      <div className="mt-8 text-center text-sm font-light text-foreground/40">
        <Link href="/login" className="text-[#6c47ff]/60 hover:text-[#6c47ff] hover:underline underline-offset-4">
          Remember? Log in
        </Link>
      </div>
    </div>
  );
}
