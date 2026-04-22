import { createServerClient } from '@/lib/supabase/server';
import { CampaignWizard } from '@/components/campaigns/wizard/CampaignWizard';
import { redirect } from 'next/navigation';
import { fetchTemplates } from '@/app/actions/campaigns';

export default async function CampaignBuilderPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient();
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!campaign) {
    redirect('/campaigns');
  }

  const templates = await fetchTemplates();

  return (
    <div className="h-[calc(100vh-140px)] -m-8 md:-m-12 bg-[#030303]">
      <CampaignWizard initialCampaign={campaign} templates={templates} />
    </div>
  );
}
