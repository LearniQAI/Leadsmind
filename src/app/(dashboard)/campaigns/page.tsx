import { fetchCampaigns } from '@/app/actions/campaigns';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function CampaignsPage() {
  const campaigns = await fetchCampaigns();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campaigns</h1>
          <p className="text-white/50">Create and manage your email marketing broadcasts.</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  );
}
