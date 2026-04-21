import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { getWaitlistEntries } from '@/app/actions/calendar';
import { WaitlistManager } from './WaitlistManager';
import { Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function WaitlistPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const supabase = await createServerClient();
  
  // Fetch group appointments that have waitlist enabled
  const { data: sessions } = await supabase
    .from('appointments')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('waitlist_enabled', true)
    .order('start_time', { ascending: false });

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/10 text-white/20">
          <Users className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">No Waitlist-Enabled Sessions</h2>
          <p className="text-white/40 max-w-md mx-auto italic">
            You haven't created any group sessions with waitlisting enabled yet.
          </p>
        </div>
        <Button asChild className="bg-[#6c47ff] hover:bg-[#5b3ce0] rounded-xl font-bold italic uppercase">
          <Link href="/calendar">Configure Calendars</Link>
        </Button>
      </div>
    );
  }

  // Use the most recent session as default
  const activeSession = sessions[0];
  const waitlistRes = await getWaitlistEntries(activeSession.id);
  const waitlist = waitlistRes.success ? waitlistRes.data : [];

  return (
    <div className="space-y-8 pb-20">
      <div>
         <div className="flex items-center gap-2 mb-1">
           <div className="h-5 w-5 rounded-md bg-[#fdab3d]/10 flex items-center justify-center border border-[#fdab3d]/20">
              <Users className="h-3 w-3 text-[#fdab3d]" />
           </div>
           <span className="text-[10px] font-black text-[#fdab3d] uppercase tracking-[0.2em]">Group Session Management</span>
         </div>
         <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">Waitlist <span className="text-white/20">&</span> Availability</h1>
         <p className="text-white/40 text-sm font-medium mt-1">Real-time attendee promotion for group sessions.</p>
      </div>

      <WaitlistManager 
        initialSession={activeSession} 
        initialWaitlist={waitlist} 
        allSessions={sessions}
      />
    </div>
  );
}
