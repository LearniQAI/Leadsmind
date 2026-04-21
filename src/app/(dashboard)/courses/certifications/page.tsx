import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Award, ShieldCheck, Download, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function CertificationsListPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return null;

  const supabase = await createClient();
  
  // Fetch all issued certificates in the workspace
  const { data: certs } = await supabase
    .from('lms_certificates')
    .select(`
       *,
       course:courses(title),
       contact:contacts(first_name, last_name, email)
    `)
    .eq('workspace_id', workspaceId)
    .order('issue_date', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className="h-5 w-5 rounded-md bg-[#fdab3d]/10 flex items-center justify-center border border-[#fdab3d]/20">
                <Award className="h-3.5 w-3.5 text-[#fdab3d]" />
             </div>
             <span className="text-[10px] font-black text-[#fdab3d] uppercase tracking-widest">Credentials & Mastery</span>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Certifications</h1>
           <p className="mt-2 text-white/50 italic">Track and verify educational credentials issued to your students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!certs || certs.length === 0) ? (
          <div className="col-span-full py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl">
            <Award className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 italic">No certifications issued yet. Students earn them by completing courses.</p>
            <Button variant="link" className="text-[#fdab3d]" asChild>
               <Link href="/courses">Manage Course Curriculum</Link>
            </Button>
          </div>
        ) : (
          certs.map((cert) => (
            <Card key={cert.id} className="relative bg-[#0b0b14] border-white/5 hover:border-[#fdab3d]/30 transition-all group overflow-hidden rounded-[32px]">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <ShieldCheck className="h-24 w-24 text-[#fdab3d]" />
              </div>
              
              <CardHeader className="pb-4 relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-[#fdab3d]/10 flex items-center justify-center border border-[#fdab3d]/20">
                       <Award className="h-6 w-6 text-[#fdab3d]" />
                    </div>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-widest">
                       {cert.verification_code}
                    </Badge>
                 </div>
                 <CardTitle className="text-xl font-bold text-white tracking-tight">{cert.course?.title}</CardTitle>
                 <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Issued to:</span>
                 <p className="text-sm font-bold text-[#fdab3d] italic truncate">
                    {cert.contact?.first_name} {cert.contact?.last_name}
                 </p>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                 <div className="flex items-center gap-3 py-4 border-y border-white/5">
                    <div className="flex flex-col">
                       <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Issue Date</span>
                       <span className="text-xs text-white/60 font-mono italic">
                          {new Date(cert.issue_date).toLocaleDateString()}
                       </span>
                    </div>
                 </div>
                 
                 <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-white gap-2 h-10 rounded-xl text-[10px] font-black uppercase italic" asChild>
                       <Link href={`/verify/${cert.verification_code}`} target="_blank">
                          <ExternalLink className="h-3 w-3" />
                          Verify
                       </Link>
                    </Button>
                    <Button className="flex-1 bg-[#fdab3d] hover:bg-[#e69a2d] text-black gap-2 h-10 rounded-xl text-[10px] font-black uppercase italic">
                       <Download className="h-3 w-3" />
                       Export
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
