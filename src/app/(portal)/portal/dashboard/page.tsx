import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Receipt, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  // Get the contact ID for this client user
  const { data: profile } = await supabase
    .from('users')
    .select('contact_id')
    .eq('id', user.id)
    .single();

  const contactId = profile?.contact_id;

  if (!contactId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-white">No Profile Found</h1>
        <p className="text-white/40 mt-2">We couldn't find a client profile associated with your account.</p>
      </div>
    );
  }

  // Fetch enrolled courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('contact_id', contactId)
    .order('enrolled_at', { ascending: false });

  // Fetch recent invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false })
    .limit(5);

  const statusColor: Record<string, string> = {
    paid: 'border-green-500/20 text-green-400 bg-green-500/10',
    draft: 'border-white/10 text-white/40 bg-white/5',
    sent: 'border-[#6c47ff]/20 text-[#6c47ff] bg-[#6c47ff]/10',
    overdue: 'border-red-500/20 text-red-400 bg-red-500/10',
    open: 'border-orange-500/20 text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white italic">Welcome back,</h1>
        <p className="mt-1 text-white/40 text-sm">Your learning and billing overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Enrolled Courses */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5" style={{ color: 'var(--primary, #6c47ff)' }} />
            Recent Courses
          </h2>
          {enrollments && enrollments.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {enrollments.map((enr: any) => (
                <Link key={enr.id} href={`/learn/${enr.course_id}`}>
                  <Card className="bg-white/3 border-white/5 hover:bg-white/5 transition-all group overflow-hidden rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {enr.course?.thumbnail_url ? (
                          <img src={enr.course.thumbnail_url} className="h-full w-full object-cover rounded-xl" alt="Course" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{enr.course?.title}</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium mt-1">
                          Enrolled {new Date(enr.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-white/10 group-hover:text-[#6c47ff] transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/3 border border-dashed border-white/10 rounded-[24px] py-12 text-center">
              <GraduationCap className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/30">You are not enrolled in any courses yet.</p>
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="h-5 w-5" style={{ color: 'var(--primary, #6c47ff)' }} />
            Recent Invoices
          </h2>
          {invoices && invoices.length > 0 ? (
            <Card className="bg-white/3 border-white/5 rounded-[24px] overflow-hidden">
              <div className="divide-y divide-white/5">
                {invoices.map((inv: any) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">${inv.amount_due || inv.total_amount}</p>
                        <p className="text-[10px] text-white/30 font-medium">{new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`capitalize text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor[inv.status] ?? ''}`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-black/20 text-center">
                <Link href="/portal/invoices" className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors" style={{ color: 'var(--primary, #6c47ff)' }}>
                  View All Invoices
                </Link>
              </div>
            </Card>
          ) : (
            <div className="bg-white/3 border border-dashed border-white/10 rounded-[24px] py-12 text-center">
              <Receipt className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-xs text-white/30">No invoice history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
