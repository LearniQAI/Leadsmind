import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createBooking } from '@/app/actions/calendar';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recoveryId = searchParams.get('rid');
  const slotStart = searchParams.get('start');
  const slotEnd = searchParams.get('end');

  if (!recoveryId || !slotStart || !slotEnd) {
    return NextResponse.json({ error: 'Invalid rebooking data' }, { status: 400 });
  }

  const supabase = await createServerClient();

  try {
    // 1. Fetch recovery record
    const { data: recovery, error: fetchErr } = await supabase
      .from('no_show_recoveries')
      .select('*, appointment:appointments(calendar_id, contact_id, title)')
      .eq('id', recoveryId)
      .single();

    if (fetchErr || !recovery) throw new Error('Recovery record not found');

    // 2. Create New Appointment
    const res = await createBooking({
      calendarId: recovery.appointment.calendar_id,
      contactId: recovery.appointment.contact_id,
      title: `[REBOOKED] ${recovery.appointment.title}`,
      startTime: slotStart,
      endTime: slotEnd
    });

    if (!res.success) throw new Error(res.error || 'Failed to rebook');

    // 3. Update Recovery Record
    await supabase
      .from('no_show_recoveries')
      .update({
        rebooked_at: new Date().toISOString(),
        rebooked_appointment_id: res.data.id
      })
      .eq('id', recoveryId);

    // Redirect to success page or return success
    return NextResponse.redirect(new URL('/calendar/rebooked', request.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
