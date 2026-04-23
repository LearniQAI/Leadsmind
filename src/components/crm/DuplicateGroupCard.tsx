'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { mergeDuplicateGroup } from '@/app/actions/deduplication';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, User } from 'lucide-react';

interface DuplicateGroupCardProps {
  group: any;
}

export function DuplicateGroupCard({ group }: DuplicateGroupCardProps) {
  const [primaryId, setPrimaryId] = useState(group.contact_ids[0]);
  const [isMerging, setIsMerging] = useState(false);

  async function handleMerge() {
    setIsMerging(true);
    try {
      const result = await mergeDuplicateGroup(group.id, primaryId);
      if (result.success) {
        toast.success('Contacts merged successfully');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to merge contacts');
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="bg-[#0b0b10] border border-white/5 rounded-[2rem] p-8 space-y-8 group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Potential Duplicate Group
            <span className="px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              Matched by {group.match_criteria}
            </span>
          </h3>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Select the primary record to keep</p>
        </div>
        <Button 
            onClick={handleMerge} 
            disabled={isMerging}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-blue-600/20"
        >
            {isMerging ? 'Merging...' : 'Merge All Into Selected'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {group.contactDetails?.map((contact: any) => (
          <div 
            key={contact.id}
            onClick={() => setPrimaryId(contact.id)}
            className={cn(
                "relative p-5 rounded-2xl border transition-all cursor-pointer",
                primaryId === contact.id 
                    ? "bg-blue-600/5 border-blue-500/30 ring-1 ring-blue-500/20" 
                    : "bg-white/2 border-white/5 hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-xl border border-white/10">
                    <AvatarFallback className="bg-white/5 text-white/40 text-xs font-bold">
                        {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{contact.first_name} {contact.last_name}</p>
                    <p className="text-xs text-white/30 truncate">{contact.email}</p>
                </div>
                {primaryId === contact.id && (
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-black" />
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-6">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Source</p>
                    <p className="text-[11px] font-bold text-white/60">{contact.source || 'Direct'}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Created</p>
                    <p className="text-[11px] font-bold text-white/60">{new Date(contact.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {primaryId === contact.id && (
                <div className="absolute -top-2 -right-2 px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Primary
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
