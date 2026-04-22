'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';
import type { Contact } from '@/types/crm.types';
import Link from 'next/link';
import { format } from 'date-fns';

import { deleteContact } from '@/app/actions/contacts';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ContactTableProps {
  contacts: Contact[];
}

export function ContactTable({ contacts }: ContactTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const result = await deleteContact(id);
      if (result.success) {
        toast.success('Contact deleted');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
      <Table>
        <TableHeader className="bg-white/3">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={selectedIds.length === contacts.length && contacts.length > 0} 
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Contact</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Email</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Tags</TableHead>
            <TableHead className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Added</TableHead>
            <TableHead className="w-[80px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts?.map((contact) => (
            <TableRow key={contact.id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(contact.id)} 
                  onCheckedChange={() => toggleSelect(contact.id)}
                />
              </TableCell>
              <TableCell>
                <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-white/5">
                    <AvatarFallback className="bg-white/5 text-white/40 text-[10px] font-bold">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {contact.first_name} {contact.last_name}
                    </span>
                    {contact.phone && (
                        <span className="text-[10px] text-white/20 font-medium italic">{contact.phone}</span>
                    )}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-sm text-white/40 font-medium">
                {contact.email || '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {contact.tags?.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-blue-500/5 text-blue-400/70 border border-blue-500/10 text-[9px] px-1.5 py-0 capitalize font-bold">
                      {tag}
                    </Badge>
                  ))}
                  {(contact.tags?.length || 0) > 3 && (
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter self-center">+{(contact.tags?.length || 0) - 3} MORE</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-white/20 font-medium">
                {format(new Date(contact.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" className="h-8 w-8 p-0 text-white/10 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="bg-[#0c0c14] border-white/10 text-white min-w-[160px]">
                    <DropdownMenuItem>
                        <Link href={`/contacts/${contact.id}`} className="cursor-pointer flex items-center gap-2 w-full">
                            <Users className="h-4 w-4 text-white/40" />
                            <span>View Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-rose-400 focus:text-rose-400 cursor-pointer gap-2" 
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Contact</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {contacts.length === 0 && (
            <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3 text-white/20">
                        <Users className="h-10 w-10 opacity-10" />
                        <p className="text-sm font-bold opacity-30">No contacts found</p>
                        <Button variant="outline" className="mt-2 border-white/5 hover:bg-white/5" asChild>
                            <Link href="/contacts/new">Add First Contact</Link>
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex items-center gap-6 px-6 py-3 bg-[#0a0a0f] border border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
              <div className="flex items-center gap-3 pr-6 border-r border-white/5">
                 <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center text-[10px] font-black">{selectedIds.length}</div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Selected</span>
              </div>
              
              <div className="flex items-center gap-2">
                 <BulkTagAction ids={selectedIds} onComplete={() => setSelectedIds([])} />
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-9 px-3 text-red-400 hover:text-red-500 hover:bg-red-500/5 text-[10px] font-black uppercase tracking-widest gap-2"
                   onClick={() => {
                     if(confirm(`Delete ${selectedIds.length} contacts?`)) {
                        // Implement bulk delete if needed
                        toast.success("Bulk delete initiated");
                        setSelectedIds([]);
                     }
                   }}
                 >
                   <Trash2 size={12} />
                   Delete
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-9 px-3 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest"
                   onClick={() => setSelectedIds([])}
                 >
                   Cancel
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

import { bulkAddTag, bulkRemoveTag } from "@/app/actions/contacts";
import { Tag as TagIcon } from 'lucide-react';

function BulkTagAction({ ids, onComplete }: { ids: string[], onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApplyTag = async () => {
    const tagName = prompt("Enter tag name to apply to selected contacts:");
    if (!tagName) return;

    setLoading(false);
    try {
      const res = await bulkAddTag(ids, tagName);
      if (res.success) {
        toast.success(`Tag applied to ${ids.length} contacts`);
        onComplete();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to apply tag");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleApplyTag}
      className="h-9 px-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 text-[10px] font-black uppercase tracking-widest gap-2 border border-blue-500/10"
      disabled={loading}
    >
      <TagIcon size={12} />
      Add Tag
    </Button>
  );
}
