import { notFound } from 'next/navigation';
import { getPersonalizedBookingData } from '@/app/actions/calendar';
import { PersonalizedBookingHeader } from '@/components/calendar/PersonalizedBookingHeader';
import { OutcomeSelector } from '@/components/calendar/OutcomeSelector';
import { PopularSlotHighlighter } from '@/components/calendar/PopularSlotHighlighter';
import { CalendarDays, Sparkles, MapPin, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { GlassContainer, SectionLabel } from '@/components/calendar/BookingPrimitives';
import { cn } from '@/lib/utils';

interface BookingPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cid?: string }>;
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { slug } = await params;
  const { cid } = await searchParams;

  const res = await getPersonalizedBookingData(slug, cid);

  if (!res.success || !res.data) notFound();

  const { calendar, contact, lastAppointment, outcomes, popularSlots, preferredSlots } = res.data;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 selection:bg-[#6c47ff]/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,transparent_50%)] pointer-events-none opacity-40" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="w-full max-w-2xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 py-12 lg:py-20">
        
        <PersonalizedBookingHeader 
          contactName={contact?.first_name} 
          hostName={calendar.name} 
          lastSessionDate={lastAppointment?.start_time}
        />

        <div className="grid grid-cols-1 gap-12 mt-12">
            {/* Step 1: Outcomes */}
            <GlassContainer className="p-8">
               <OutcomeSelector outcomes={outcomes} onSelect={() => {}} />
            </GlassContainer>

            {/* Step 2: Availability */}
            <GlassContainer className="p-8">
               <SectionLabel 
                 label="Step 2: Availability" 
                 title="Select a time" 
                 badge={
                   <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-bold text-white/40 gap-1.5 py-1">
                      <MapPin className="h-3 w-3" />
                      Times in SAST — Change?
                   </Badge>
                 }
               />

               <div className="grid grid-cols-3 gap-4">
                  {[10, 11, 14, 15, 16, 17].map((hour) => {
                    const isPreferred = preferredSlots.some((s: any) => s.hour === hour);
                    return (
                      <button key={hour} className={cn(
                        "relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden group/slot",
                        isPreferred 
                          ? "bg-[#6c47ff]/10 border-[#6c47ff]/50 shadow-[0_0_20px_rgba(108,71,255,0.1)]" 
                          : "bg-white/[0.02] border-white/5 hover:border-white/20"
                      )}>
                         {isPreferred && (
                            <div className="absolute top-2 left-2 animate-bounce-subtle">
                               <Sparkles className="h-3 w-3 text-[#6c47ff] fill-[#6c47ff]" />
                            </div>
                         )}
                         <PopularSlotHighlighter dayOfWeek={new Date().getDay()} hour={hour} popularSlots={popularSlots} />
                         
                         <span className={cn(
                           "text-lg font-black tracking-tighter italic block",
                           isPreferred ? "text-white" : "text-white/40 group-hover/slot:text-white"
                         )}>
                           {hour}:00
                         </span>
                         <span className="text-[9px] font-black text-white/10 group-hover/slot:text-white/20 uppercase tracking-widest">
                           {hour >= 12 ? 'PM' : 'AM'}
                         </span>
                      </button>
                    )
                  })}
               </div>

               <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                     <Info className="h-4 w-4 text-[#6c47ff]" />
                  </div>
                  <p className="text-[11px] text-white/30 font-medium leading-relaxed">
                     {contact ? `Welcome back, ${contact.first_name}. We've highlighted your preferred afternoon slots above.` : 'Select your desired time to confirm the booking.'}
                  </p>
               </div>
            </GlassContainer>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
           <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Leadsmind Intelligence Sync Enabled</p>
           <div className="h-px w-20 bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </main>
    </div>
  );
}
