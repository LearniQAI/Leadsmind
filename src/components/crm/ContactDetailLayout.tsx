'use client';

import { useState } from 'react';
import { Contact } from '@/types/crm.types';
import { addTag } from '@/app/actions/contacts';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Calendar, 
  User, 
  MoreVertical, 
  Zap, 
  Plus, 
  Loader2,
  XCircle,
  AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface ContactDetailLayoutProps {
  contact: Contact;
  children: React.ReactNode;
}

export function ContactDetailLayout({ contact, children }: ContactDetailLayoutProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const initials = `${contact.first_name?.[0] || '?'}${contact.last_name?.[0] || '?'}`;

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    setIsLoading(true);
    try {
      const res = await addTag(contact.id, newTag.trim());
      if (res.success) {
        toast.success(`Tag "${newTag}" added`);
        setNewTag('');
        setIsAddingTag(false);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Failed to add tag");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Sidebar Profile */}
      <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 space-y-6">
        {/* No-Show Risk Warning Banner */}
        {contact.no_show_count && contact.no_show_count >= 3 && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-[28px] p-6 text-center animate-pulse-subtle">
             <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-3">
               <XCircle className="h-5 w-5 text-rose-500" />
             </div>
                          <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest italic mb-1 flex items-center justify-center gap-2">
                High Risk Contact
                <InfoTooltip content="This contact has failed to attend 3 or more scheduled appointments. We recommend confirming their next appointment manually." />
             </h4>

             <p className="text-[11px] text-white/50 leading-relaxed">
               This contact has <strong>{contact.no_show_count}</strong> no-shows. Host discretion advised for future bookings.
             </p>
          </div>
        )}

        <Card className="bg-[#0b0b10] border-white/5 rounded-[32px] p-6 sm:p-8 lg:sticky lg:top-28 shadow-2xl overflow-hidden relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#6c47ff]/50 to-transparent" />
          
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-2 border-[#6c47ff]/20 mb-4 ring-4 ring-[#6c47ff]/5">
              <AvatarFallback className="bg-[#6c47ff]/20 text-[#6c47ff] text-2xl font-bold uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              {contact.first_name} {contact.last_name}
            </h2>
            <p className="text-sm text-white/40 font-medium mb-6">Contact Profile</p>
            
            <div className="flex gap-2 mb-6 sm:mb-8">
               <Button size="sm" className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl px-6 font-bold h-10 shadow-lg shadow-[#6c47ff]/20 transition-all hover:-translate-y-0.5" asChild>
                 <Link href={`/contacts/${contact.id}/edit`}>Edit Profile</Link>
               </Button>
               <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-white/60 rounded-xl px-3 h-10">
                 <MoreVertical className="h-4 w-4" />
               </Button>
            </div>

            {/* AI Lead Score */}
            <div className="w-full bg-linear-to-br from-[#6c47ff]/10 to-transparent border border-[#6c47ff]/20 rounded-2xl p-4 mb-6 sm:mb-8 transition-all hover:bg-[#6c47ff]/10 group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#6c47ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="h-3.5 w-3.5 text-[#6c47ff]" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em] flex items-center">
                    AI Hotness
                    <InfoTooltip content="A predictive score based on profile completeness, activity frequency, and engagement history." />
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xl font-black leading-none ${
                    (contact.lead_score || 0) > 75 ? 'text-green-400' : 
                    (contact.lead_score || 0) > 40 ? 'text-orange-400' : 'text-zinc-400'
                  }`}>
                    {contact.lead_score || 0}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] transition-all duration-1000 shadow-[0_0_8px_rgba(108,71,255,0.5)]" 
                  style={{ width: `${contact.lead_score || 0}%` }}
                />
              </div>
              {contact.lead_score_explanation && (
                <p className="text-[10px] text-white/40 leading-relaxed italic text-left border-l border-white/10 pl-3 py-1">
                  "{contact.lead_score_explanation}"
                </p>
              )}
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

            <div className="pt-6 border-t border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold flex items-center gap-2">
                   <Tag className="h-3 w-3" />
                   Tags
                 </span>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-5 w-5 rounded-md hover:bg-white/5 text-white/20 hover:text-[#6c47ff] transition-all"
                   onClick={() => setIsAddingTag(!isAddingTag)}
                 >
                   <Plus className={`h-3 w-3 transition-transform ${isAddingTag ? 'rotate-45 text-[#6c47ff]' : ''}`} />
                 </Button>
               </div>
               
               {isAddingTag && (
                 <form onSubmit={handleAddTag} className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <Input 
                        autoFocus
                        placeholder="Type and enter..."
                        className="h-9 bg-white/5 border-white/5 text-xs pr-8 rounded-xl ring-0 focus:border-[#6c47ff]/50 transition-all font-bold"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        disabled={isLoading}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-[#6c47ff]" />}
                      </div>
                    </div>
                 </form>
               )}

               <div className="flex flex-wrap gap-2">
                 {contact.tags?.map(tag => (
                   <Badge key={tag} className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/5 px-3 py-1 rounded-sm text-[10px] font-black tracking-wide transition-all hover:text-white uppercase">
                     {tag}
                   </Badge>
                 ))}
                 {(!contact.tags || contact.tags.length === 0) && !isAddingTag && <span className="text-xs text-white/20 italic">No tags applied</span>}
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
