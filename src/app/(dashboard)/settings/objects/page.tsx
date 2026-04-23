import { requireAuth } from '@/lib/auth';
import { getCustomObjects } from '@/app/actions/objects';
import { Button } from '@/components/ui/button';
import { 
  Box, 
  Plus, 
  Settings2, 
  Layers,
  Database,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomObjectsPage() {
  await requireAuth();
  const result = await getCustomObjects();
  const objects = result.success ? result.data || [] : [];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Custom Objects</h1>
          <p className="text-sm text-white/40 font-medium">Extend your CRM by defining custom data structures.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-5 w-5" />
          <span>Define New Object</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objects.map((obj) => (
          <div key={obj.id} className="group bg-[#0b0b10] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6 hover:border-white/10 transition-all shadow-xl">
             <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                    <Box className="h-7 w-7" />
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white/10 hover:text-white hover:bg-white/5 rounded-xl">
                    <MoreVertical className="h-5 w-5" />
                </Button>
             </div>

             <div>
                <h3 className="text-xl font-bold text-white mb-1">{obj.name_plural}</h3>
                <p className="text-xs text-white/30 font-medium line-clamp-2">{obj.description || 'No description provided.'}</p>
             </div>

             <div className="flex items-center gap-4 py-4 border-y border-white/5">
                <div className="flex-1 text-center border-r border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Fields</p>
                    <p className="text-lg font-black text-white">{obj.fields?.length || 0}</p>
                </div>
                <div className="flex-1 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Records</p>
                    <p className="text-lg font-black text-white">0</p>
                </div>
             </div>

             <Button variant="ghost" className="w-full h-12 rounded-xl border border-white/5 bg-white/2 text-white/60 hover:text-white hover:bg-white/5 font-bold gap-2">
                <span>Manage Schema</span>
                <ArrowRight className="h-4 w-4" />
             </Button>
          </div>
        ))}

        {objects.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-24 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
                <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
                    <Layers className="h-10 w-10" />
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tight mb-2 opacity-30">No Custom Objects</h4>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-20 mb-8">Define your own tables for assets, events, or custom data.</p>
                <Button className="bg-white/5 hover:bg-white/10 text-white h-11 px-8 rounded-xl font-bold border border-white/10">
                    Get Started
                </Button>
            </div>
        )}
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="h-14 w-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Database className="h-7 w-7" />
        </div>
        <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-black uppercase italic tracking-tight text-blue-400">Data Modeling</h4>
            <p className="text-xs text-white/40 font-medium leading-relaxed max-w-xl">
                Custom objects allow you to track data that doesn't fit into standard Contacts or Deals. You can create relationships between these objects and existing CRM records.
            </p>
        </div>
      </div>
    </div>
  );
}
