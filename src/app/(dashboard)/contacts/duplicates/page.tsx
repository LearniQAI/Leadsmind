import { requireAuth } from '@/lib/auth';
import { getDuplicateGroups } from '@/app/actions/deduplication';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  RefreshCw, 
  ShieldCheck,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DuplicateGroupCard } from '@/components/crm/DuplicateGroupCard';

export const dynamic = 'force-dynamic';

export default async function DuplicatesPage() {
  await requireAuth();
  const result = await getDuplicateGroups();
  const groups = result.success ? result.data || [] : [];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Deduplication</h1>
          <p className="text-sm text-white/40 font-medium">Identify and merge duplicate contact records.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all">
          <RefreshCw className="h-4 w-4" />
          <span>Scan for Duplicates</span>
        </Button>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-6 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
        </div>
        <p className="text-xs text-white/40 font-medium">
            Merging contacts will combine their activities, notes, and tasks into a single primary record. This action cannot be undone.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <DuplicateGroupCard key={group.id} group={group} />
        ))}

        {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
                <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-green-500/40" />
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tight mb-2 text-white/30">Database is Clean</h4>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">No duplicate contacts detected in your workspace.</p>
            </div>
        )}
      </div>
    </div>
  );
}
