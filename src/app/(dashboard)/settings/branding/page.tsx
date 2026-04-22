import { requireAuth, getCurrentWorkspace, requireAdmin } from '@/lib/auth';
import { fetchBranding } from '@/lib/branding';
import { BrandingForm } from '@/components/branding/BrandingForm';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight, Palette } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BrandingPage() {
  await requireAuth();
  await requireAdmin();
  
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  // Plan Gate temporarily removed per admin request
  // if (workspace.plan !== 'enterprise') { ... }

  const branding = await fetchBranding(workspace.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">White-label Branding</h1>
        <p className="mt-1 text-white/40 text-sm">Customize the look and feel of your workspace.</p>
      </div>
      
      <BrandingForm initialData={branding} workspaceId={workspace.id} />
    </div>
  );
}
