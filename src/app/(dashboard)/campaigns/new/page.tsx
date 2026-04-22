'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign } from '@/app/actions/campaigns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      const campaign = await createCampaign({
        name,
        subject: '',
        status: 'draft'
      });
      
      // Redirect to builder (Campaign builder implementation would be next)
      router.push(`/campaigns/${campaign.id}/builder`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create campaign');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-20">
      <div className="mb-8">
        <Link href="/campaigns">
          <Button variant="ghost" className="text-white/50 hover:text-white gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" /> Back to campaigns
          </Button>
        </Link>
        <h1 className="text-4xl font-black text-white mt-4 uppercase tracking-tighter">
          New Campaign
        </h1>
        <p className="text-white/40 mt-2">Give your email campaign a reference name.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Campaign Name</label>
          <Input 
            autoFocus
            placeholder="e.g., Weekly Newsletter - April"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 bg-white/5 border-white/10 text-lg rounded-2xl focus:ring-primary focus:border-primary"
          />
        </div>

        <Button 
          type="submit" 
          disabled={!name || isSubmitting}
          className="w-full h-14 bg-[#6c47ff] hover:bg-[#8b5cf6] text-white font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(108,71,255,0.3)]"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            'Continue to Setup'
          )}
        </Button>
      </form>
    </div>
  );
}
