import { requireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Plus, 
  Search,
  Users,
  MessageCircle,
  TrendingUp,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentWorkspaceId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ForumsPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();
  
  const { data: forums } = await supabase
    .from('community_forums')
    .select('*')
    .eq('workspace_id', workspaceId!)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Community Forums</h1>
          <p className="text-sm text-white/40 font-medium">Connect, share, and grow with your peers.</p>
        </div>
        <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-[#6c47ff]/20 transition-all">
          <Plus className="h-5 w-5" />
          <span>Create Forum</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-8">
            <div className="bg-[#0b0b10] border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input 
                        placeholder="Search forums..." 
                        className="w-full bg-white/2 border border-white/5 rounded-xl h-10 pl-10 pr-4 text-xs text-white placeholder:text-white/10 focus:border-[#6c47ff]/50 transition-all"
                    />
                </div>
                <div className="space-y-1 pt-4">
                    <SidebarItem icon={TrendingUp} label="Trending" active />
                    <SidebarItem icon={MessageCircle} label="My Posts" />
                    <SidebarItem icon={Hash} label="Tags" />
                </div>
            </div>

            <div className="bg-[#6c47ff]/5 border border-[#6c47ff]/10 rounded-3xl p-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff]">Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-lg font-black text-white">0</p>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Active Users</p>
                    </div>
                    <div>
                        <p className="text-lg font-black text-white">0</p>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Total Posts</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Forum List */}
        <div className="md:col-span-3 space-y-4">
            {forums?.map((forum) => (
                <div key={forum.id} className="group bg-[#0b0b10] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-[#6c47ff]/20 transition-all">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-[#6c47ff] transition-colors">{forum.name}</h3>
                                <p className="text-xs text-white/30 font-medium line-clamp-1">{forum.description || 'No description available.'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-sm font-black text-white">0</p>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-white">0</p>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Members</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {(!forums || forums.length === 0) && (
                <div className="flex flex-col items-center justify-center py-24 text-white/10 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
                    <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 opacity-30" />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight mb-2 opacity-30">No active forums</h4>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-20">Be the first to start a conversation.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            active ? "bg-[#6c47ff]/10 text-[#6c47ff]" : "text-white/40 hover:bg-white/5 hover:text-white"
        )}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
    );
}
