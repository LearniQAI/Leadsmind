import { Megaphone, Plus, Search, Filter, ArrowUpRight, TrendingUp, Target, MousePointer2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function AdsPage() {
  return (
    <div className="flex flex-col bg-[#030303] min-h-screen p-8 gap-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ad Manager</h1>
          <p className="text-white/40 text-sm mt-1">Multi-channel advertising dashboard and conversion tracking.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="border-white/5 bg-white/5 text-white/60 hover:bg-white/10 rounded-xl h-11 px-6 font-bold">
              Connect Account
           </Button>
           <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#6c47ff]/20">
              <Plus className="h-4 w-4 mr-2" /> Create Campaign
           </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Spend', val: '$0.00', icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Impressions', val: '0', icon: Target, color: 'text-amber-500' },
          { label: 'Clicks', val: '0', icon: MousePointer2, color: 'text-emerald-500' },
          { label: 'Conversions', val: '0', icon: ArrowUpRight, color: 'text-[#6c47ff]' },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#0b0b10] border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <InfoTooltip content={`Total ${stat.label.toLowerCase()} across all active ad networks.`} />
              </div>
              <div className="text-3xl font-bold text-white tracking-tighter">{stat.val}</div>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center px-6">
         <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-2xl">
            <Megaphone className="h-10 w-10 text-[#6c47ff]" />
         </div>
         <h2 className="text-xl font-bold text-white mb-2">No Ad Accounts Connected</h2>
         <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
            Connect your Facebook, Instagram, or Google Ads account to start tracking performance and managing campaigns from one place.
         </p>
         <div className="flex flex-wrap justify-center gap-3">
            {['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'TikTok Ads'].map(p => (
               <Button key={p} variant="outline" className="bg-white/5 border-white/5 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-white/10 transition-all">
                  Connect {p}
               </Button>
            ))}
         </div>
      </div>
    </div>
  );
}
