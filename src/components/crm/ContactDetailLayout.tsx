'use client';

import { Contact } from '@/types/crm.types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Tag, Calendar, User, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface ContactDetailLayoutProps {
  contact: Contact;
  children: React.ReactNode;
}

export function ContactDetailLayout({ contact, children }: ContactDetailLayoutProps) {
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Sidebar Profile */}
      <div className="w-full lg:w-[340px] flex-shrink-0 space-y-6">
        <Card className="bg-[#0b0b10] border-white/5 rounded-3xl p-8 sticky top-28 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-2 border-[#6c47ff]/20 mb-4 ring-4 ring-[#6c47ff]/5">
              <AvatarFallback className="bg-[#6c47ff]/20 text-[#6c47ff] text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              {contact.first_name} {contact.last_name}
            </h2>
            <p className="text-sm text-white/40 font-medium mb-6">Contact Profile</p>
            
            <div className="flex gap-2 mb-8">
               <Button size="sm" className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl px-6 font-bold" asChild>
                 <Link href={`/contacts/${contact.id}/edit`}>Edit</Link>
               </Button>
               <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-white/60 rounded-xl px-3">
                 <MoreVertical className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <div className="space-y-6 border-t border-white/5 pt-8">
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                 <Mail className="h-4 w-4 text-[#6c47ff] mt-0.5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Email</span>
                    <span className="text-sm text-white/80 font-medium truncate max-w-[200px]">{contact.email || 'Not provided'}</span>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <Phone className="h-4 w-4 text-[#6c47ff] mt-0.5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Phone</span>
                    <span className="text-sm text-white/80 font-medium">{contact.phone || 'Not provided'}</span>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <MapPin className="h-4 w-4 text-[#6c47ff] mt-0.5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Source</span>
                    <span className="text-sm text-white/80 font-medium capitalize">{contact.source || 'Unknown'}</span>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <User className="h-4 w-4 text-[#6c47ff] mt-0.5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Owner</span>
                    <span className="text-sm text-white/80 font-medium">Workspace Member</span>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <Calendar className="h-4 w-4 text-[#6c47ff] mt-0.5" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Added On</span>
                    <span className="text-sm text-white/80 font-medium">{format(new Date(contact.created_at), 'MMMM d, yyyy')}</span>
                 </div>
               </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
               <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold flex items-center gap-2">
                 <Tag className="h-3 w-3" />
                 Tags
               </span>
               <div className="flex flex-wrap gap-2">
                 {contact.tags.map(tag => (
                   <Badge key={tag} className="bg-white/5 hover:bg-white/10 text-white/60 border-none px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                     {tag}
                   </Badge>
                 ))}
                 {contact.tags.length === 0 && <span className="text-xs text-white/20 italic">No tags</span>}
               </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content (Tabs) */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
