'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/lib/validations/auth.schema';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { WorkspacePicker } from '@/components/auth/WorkspacePicker';
import { Workspace } from '@/types/workspace.types';
import { setActiveWorkspace } from '@/app/actions/auth';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [workspaces, setWorkspaces] = useState<(Workspace & { role: string })[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const supabase = createClient();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    try {
      // Step 1: Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        toast.error('Incorrect email or password. Please try again.');
        return;
      }

      if (!authData.user) {
        toast.error('Login succeeded but no user session returned. Please try again.');
        return;
      }

      // Step 2: Fetch workspace memberships
      const { data: memberships, error: wsError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspaces (
            id, name, slug, logo_url, owner_id, plan, created_at
          )
        `)
        .eq('user_id', authData.user.id);

      if (wsError) {
        console.error('[LoginForm] Error fetching workspaces:', wsError);
        // Don't block — redirect to dashboard; it handles missing workspace
        toast.success('Logged in successfully!');
        router.push(next || '/dashboard');
        router.refresh();
        return;
      }

      interface RawWorkspace {
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        owner_id: string;
        plan: 'free' | 'pro' | 'enterprise';
        created_at: string;
      }

      const formattedWorkspaces = (memberships ?? [])
        .filter((m) => m.workspaces)
        .map((m) => {
          const ws = m.workspaces as unknown as RawWorkspace;
          return {
            id: ws.id,
            name: ws.name,
            slug: ws.slug,
            logoUrl: ws.logo_url,
            ownerId: ws.owner_id,
            plan: ws.plan,
            createdAt: ws.created_at,
            role: m.role,
          } as Workspace & { role: string };
        });

      if (formattedWorkspaces.length === 0) {
        // No workspace — go to dashboard; it will auto-create one
        console.warn('[LoginForm] No workspaces found — redirecting to dashboard to auto-create');
        toast.success('Logged in! Setting up your workspace...');
        router.push(next || '/dashboard');
        router.refresh();
        return;
      }

      if (formattedWorkspaces.length === 1) {
        await setActiveWorkspace(formattedWorkspaces[0].id);
        toast.success('Welcome back!');
        router.push(next || '/dashboard');
        router.refresh();
      } else {
        // Multiple workspaces — let user pick
        setWorkspaces(formattedWorkspaces);
        setShowPicker(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[LoginForm] Unexpected error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleWorkspaceSelect(workspace: Workspace) {
    await setActiveWorkspace(workspace.id);
    toast.success(`Switched to ${workspace.name}`);
    router.push(next || '/dashboard');
    router.refresh();
  }

  if (showPicker) {
    return (
      <div className="animate-fade-up">
        <WorkspacePicker workspaces={workspaces} onSelect={handleWorkspaceSelect} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <CardHeader className="space-y-1 px-0 pb-6 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-sm font-light text-foreground/40">
          Sign in to your dashboard to manage your sales.
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[0.8rem] font-medium text-foreground/60">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[0.7rem] font-medium text-[#6c47ff]/60 hover:text-[#6c47ff] underline-offset-4 hover:underline"
              >
                Forgot?
              </Link>
            </div>
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
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="rememberMe"
              checked={form.watch('rememberMe')}
              onCheckedChange={(checked: boolean) => form.setValue('rememberMe', checked === true)}
              disabled={isLoading}
              className="border-white/10 data-[state=checked]:bg-[#6c47ff] data-[state=checked]:border-[#6c47ff]"
            />
            <Label
              htmlFor="rememberMe"
              className="text-[0.8rem] font-medium leading-none text-foreground/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Keep me logged in
            </Label>
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] font-bold text-white shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In →'
            )}
          </Button>
        </form>
      </CardContent>
      <div className="mt-8 text-center text-sm font-light text-foreground/40">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-[#6c47ff] hover:underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
