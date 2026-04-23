import { getCurrentProfile, getCurrentWorkspace } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import ClientInvoiceLayout from './ClientInvoiceLayout';

export default async function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect('/login');

  const [profile, workspace] = await Promise.all([
    getCurrentProfile(authUser),
    getCurrentWorkspace(authUser),
  ]);

  const user = {
    id: authUser.id,
    email: authUser.email,
    firstName: profile?.firstName || authUser.user_metadata?.full_name?.split(' ')[0] || authUser.email?.split('@')[0] || 'User',
    avatarUrl: profile?.avatarUrl ?? null,
  };

  const workspaceData = workspace
    ? {
      id: workspace.id,
      name: workspace.name,
      logoUrl: workspace.logoUrl ?? null,
    }
    : null;

  return (
    <ClientInvoiceLayout user={user} workspace={workspaceData}>
      {children}
    </ClientInvoiceLayout>
  );
}
