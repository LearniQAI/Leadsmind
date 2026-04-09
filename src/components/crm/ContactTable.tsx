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

interface ContactTableProps {
  contacts: Contact[];
  onDelete: (id: string) => void;
}

export function ContactTable({ contacts, onDelete }: ContactTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
          {contacts.map((contact) => (
            <TableRow key={contact.id} className="border-white/5 hover:bg-white/4 transition-colors group">
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(contact.id)} 
                  onCheckedChange={() => toggleSelect(contact.id)}
                />
              </TableCell>
              <TableCell>
                <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarFallback className="bg-[#6c47ff]/20 text-[#6c47ff] text-xs font-bold">
                      {contact.first_name[0]}{contact.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-[#6c47ff] transition-colors">
                      {contact.first_name} {contact.last_name}
                    </span>
                    {contact.phone && (
                        <span className="text-[10px] text-white/30">{contact.phone}</span>
                    )}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-sm text-white/60 font-medium">
                {contact.email || '-'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-white/5 text-white/50 border-none text-[10px] px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags.length > 3 && (
                    <span className="text-[10px] text-white/20 font-medium">+{contact.tags.length - 3}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-white/40">
                {format(new Date(contact.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white shadow-2xl">
                    <DropdownMenuItem>
                        <Link href={`/contacts/${contact.id}/edit`} className="cursor-pointer flex items-center gap-2 w-full">
                            <Edit className="h-4 w-4 text-white/40" />
                            <span>Edit Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer gap-2" onClick={() => onDelete(contact.id)}>
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
                        <Users className="h-12 w-12" />
                        <p className="text-sm font-medium">No contacts found</p>
                        <Button variant="outline" className="mt-2 border-white/10 hover:bg-white/5">
                            <Link href="/contacts/new">Add First Contact</Link>
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
