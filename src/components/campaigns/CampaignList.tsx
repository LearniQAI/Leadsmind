'use client';

import { EmailCampaign, CampaignStats } from '@/types/campaigns.types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  BarChart2, 
  Copy, 
  Trash2, 
  Eye 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CampaignListProps {
  campaigns: (EmailCampaign & { campaign_stats: CampaignStats | null })[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0b0b10] p-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-6">
          <BarChart2 className="h-8 w-8 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white">No campaigns yet</h3>
        <p className="text-white/50 max-w-xs mt-2">
          Start your first email marketing campaign to engage with your contacts.
        </p>
        <Link href="/campaigns/new" className="mt-8">
          <Button variant="outline" className="border-white/10 hover:bg-white/5">
            Create Campaign
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Sent</Badge>;
      case 'sending':
        return <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-[#6c47ff]/20 animate-pulse">Sending</Badge>;
      case 'scheduled':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-white/10 text-white/50 border-white/10">Draft</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const calculateRate = (count: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="text-white/40">Campaign Name</TableHead>
            <TableHead className="text-white/40">Status</TableHead>
            <TableHead className="text-white/40">Recipients</TableHead>
            <TableHead className="text-white/40">Open Rate</TableHead>
            <TableHead className="text-white/40">Click Rate</TableHead>
            <TableHead className="text-white/40">Sent Date</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const stats = campaign.campaign_stats;
            const sentCount = stats?.sent || 0;
            const openRate = calculateRate(stats?.opened || 0, sentCount);
            const clickRate = calculateRate(stats?.clicked || 0, sentCount);

            return (
              <TableRow key={campaign.id} className="hover:bg-white/[0.02] border-white/5 group">
                <TableCell className="font-semibold text-white">
                  {campaign.name}
                  <div className="text-[11px] font-normal text-white/30 truncate max-w-[200px]">
                    {campaign.subject}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status)}
                </TableCell>
                <TableCell className="text-white/70">
                  {campaign.recipient_count.toLocaleString()}
                </TableCell>
                <TableCell className="text-white/70">
                  {openRate}
                </TableCell>
                <TableCell className="text-white/70">
                  {clickRate}
                </TableCell>
                <TableCell className="text-white/50 text-xs">
                  {campaign.sent_at ? format(new Date(campaign.sent_at), 'MMM d, yyyy HH:mm') : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-48 bg-[#1a1a24] border-white/10 text-white">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <BarChart2 className="h-4 w-4" /> Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Copy className="h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer text-red-400 focus:text-red-400">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
