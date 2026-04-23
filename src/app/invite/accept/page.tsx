import { createServerClient } from '@/lib/supabase/server';
import { InviteAcceptForm } from '@/components/auth/InviteAcceptForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { acceptInvitationAction } from '@/app/actions/team';
import { redirect } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InviteAcceptPage({ searchParams }: InvitePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Invalid Invitation</h1>
          <p className="text-muted-foreground">No invitation token was provided.</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const supabase = await createServerClient();

  // 1. Fetch invitation
  const { data: invite, error: inviteError } = await supabase
    .from('invitations')
    .select('*, workspaces(name)')
    .eq('token', token)
    .single();

  if (inviteError || !invite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Invitation Not Found</h1>
          <p className="text-muted-foreground">This invitation link is invalid or may have been cancelled.</p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Check expiry or already accepted
  if (invite.accepted_at) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Already Accepted</h1>
          <p className="text-muted-foreground">You have already accepted this invitation.</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Invitation Expired</h1>
          <p className="text-muted-foreground">
            This invitation expired on {new Date(invite.expires_at).toLocaleDateString()}.
            Ask the workspace admin to send a new one.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 3. Check auth state
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // If logged in as the invited user
    if (user.email === invite.email) {
      // Direct accept if already logged in as the correct user
      const result = await acceptInvitationAction({ token });
      if (result.success) {
        redirect('/dashboard');
      }
    } else {
      // Logged in as WRONG user
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
            <h1 className="text-2xl font-bold">Wrong Account</h1>
            <p className="text-muted-foreground">
              This invitation was sent to <strong>{invite.email}</strong>, but you are logged in as <strong>{user.email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Please logout from your current account and click the invitation link again.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Continue as {user.email?.split('@')[0] || 'User'}</Link>
            </Button>
          </div>
        </div>
      );
    }
  }

  // 4. Check if user profile already exists (but not logged in)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', invite.email)
    .single();

  if (existingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">
            You&apos;ve been invited to join <strong>{invite.workspaces?.name}</strong>.
            Since you already have an account, please log in to accept the invitation.
          </p>
          <Button asChild className="w-full">
            <Link href={`/login?next=/invite/accept?token=${token}`}>
              Log In to Join
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 5. New user -> Show mini signup form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">LeadsMind</h1>
          <p className="text-muted-foreground italic">Elevate your team productivity</p>
        </div>
        
        <InviteAcceptForm token={token} email={invite.email} />
        
        <p className="text-center text-sm text-muted-foreground">
          By joining, you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}
