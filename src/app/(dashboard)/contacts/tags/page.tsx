import { getCurrentWorkspaceId, requireAdmin } from '@/lib/auth';
import { getWorkspaceTags } from '@/app/actions/tags';
import { redirect } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tag as TagIcon, Users, ArrowLeft, Plus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default async function TagsManagementPage() {
  await requireAdmin();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const tags = await getWorkspaceTags(workspaceId);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-4 mb-2">
             <Link href="/contacts">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5">
                 <ArrowLeft size={16} />
               </Button>
             </Link>
             <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">WorkSpace Tags</h1>
          </div>
          <p className="text-sm text-white/40 font-medium ml-12">Centralized management for your lead segmentation labels.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-blue-600/20 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          <span>Add New Tag</span>
        </Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest py-4 pl-6">Tag Name</TableHead>
              <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest text-center">Contacts</TableHead>
              <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest text-center">In Automations</TableHead>
              <TableHead className="w-[80px] text-right pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <TagIcon size={14} className="text-blue-500/60" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {tag.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-white/5 border-white/5 text-[10px] font-bold text-white/40 font-mono">
                    {tag.count}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                    <div className="flex justify-center">
                       <div className="h-1 w-1 rounded-full bg-emerald-500/40" />
                    </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/10 hover:text-white hover:bg-white/5">
                    <MoreHorizontal size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tags.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                   <div className="flex flex-col items-center gap-4 text-white/20">
                      <TagIcon size={40} className="opacity-20" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/40">No tags found in workspace</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold">Start tagging contacts to see them here.</p>
                      </div>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 border-l-4 border-l-blue-500/20">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Usage Tip</h4>
           <p className="text-xs text-white/30 leading-relaxed">Tags are the primary way to organize your business. Use them to trigger email campaigns and segment your audience for mass actions.</p>
        </div>
      </div>
    </div>
  );
}
