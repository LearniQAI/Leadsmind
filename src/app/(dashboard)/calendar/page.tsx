import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { getBookingAnalytics, getPopularSlots, getCalendarOutcomes, getIntakeForm } from '@/app/actions/calendar';
import { BookingIntelligenceDashboard } from '@/components/dashboard/BookingIntelligenceDashboard';
import { AppointmentsList } from '@/components/calendar/AppointmentsList';
import { CalendarList } from '@/components/calendar/CalendarList';
import { OutcomeManager } from '@/components/calendar/OutcomeManager';
import { IntakeFormBuilder } from '@/components/calendar/IntakeFormBuilder';
import { CreditPackageEditor } from '@/components/calendar/CreditPackageEditor';
import { CalendarDays, Info, LayoutTemplate, Users, BarChart3, Rocket, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function CalendarPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  
  if (!workspaceId) return null;

  const supabase = await createServerClient();
  const [analyticsRes, appointmentsRes, calendarsRes] = await Promise.all([
    getBookingAnalytics(workspaceId),
    supabase
      .from('appointments')
      .select('*, contact:contacts(first_name, last_name, email)')
      .eq('workspace_id', workspaceId)
      .order('start_time', { ascending: false })
      .limit(10),
    supabase
      .from('booking_calendars')
      .select('*')
      .eq('workspace_id', workspaceId)
      .limit(5)
  ]);

  const analytics = analyticsRes.data || [];
  const appointments = appointmentsRes.data || [];
  const calendars = calendarsRes.data || [];

  // Fetch outcomes for the first calendar if exists
  const [outcomesRes, intakeRes] = await Promise.all([
    calendars.length > 0 ? getCalendarOutcomes(calendars[0].id) : Promise.resolve({ data: [] }),
    calendars.length > 0 ? getIntakeForm(calendars[0].id) : Promise.resolve({ data: null })
  ]);
  
  const outcomes = outcomesRes.data || [];
  const intakeForm = intakeRes.data;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="h-5 w-5 rounded-md bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                <CalendarDays className="h-3 w-3 text-[#6c47ff]" />
             </div>
             <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.2em]">Scheduling Engine</span>
           </div>
           <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">Calendar <span className="text-white/20">&</span> Booking</h1>
           <p className="text-white/40 text-sm font-medium mt-1">Manage your appointments and scheduling intelligence.</p>
        </div>

        <div className="flex items-center gap-3">
           <Badge variant="outline" className="bg-white/[0.02] border-white/5 text-white/40 gap-1.5 py-1.5 px-3">
              <Info className="h-3.5 w-3.5" />
              Intelligence Mode: Learning
           </Badge>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between gap-2 mb-6">
           <div className="flex items-center gap-2">
             <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Intelligence Routing Configuration</h2>
           </div>
           <div className="flex items-center gap-3">
             <Button variant="ghost" className="bg-white/5 hover:bg-white/10 text-white rounded-xl gap-2 text-xs font-bold border border-white/5" asChild>
                <Link href="/calendar/analytics">
                   <BarChart3 className="h-3.5 w-3.5 text-[#6c47ff]" />
                   Business Analytics
                </Link>
             </Button>
             <Button variant="ghost" className="bg-white/5 hover:bg-white/10 text-white rounded-xl gap-2 text-xs font-bold border border-white/5" asChild>
                <Link href="/calendar/waitlist">
                   <Users className="h-3.5 w-3.5 text-[#fdab3d]" />
                   Waitlist Manager
                </Link>
             </Button>
             <div className="h-px w-20 bg-linear-to-r from-white/10 to-transparent ml-4" />
           </div>
        </div>
        {calendars.length > 0 ? (
          <OutcomeManager calendarId={calendars[0].id} initialOutcomes={outcomes as any} />
        ) : (
          <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-white/[0.01]">
             <LayoutTemplate className="h-10 w-10 text-white/5 mx-auto mb-4" />
             <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Create a calendar to configure intelligent routing</p>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
           <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Recent Appointments</h2>
           <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent ml-4" />
        </div>
        <AppointmentsList initialAppointments={appointments} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
           <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Booking Intelligence</h2>
           <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent ml-4" />
        </div>
        <BookingIntelligenceDashboard analytics={analytics} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
           <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Booking Pages</h2>
           <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent ml-4" />
        </div>
        <CalendarList calendars={calendars} />
      </section>

      <section>
        {calendars.length > 0 && (
          <IntakeFormBuilder calendarId={calendars[0].id} initialFields={intakeForm?.fields || []} />
        )}
      </section>

      <section>
        {calendars.length > 0 && (
          <CreditPackageEditor calendarId={calendars[0].id} />
        )}
      </section>
    </div>
  );
}
