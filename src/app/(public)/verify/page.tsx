'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  Calendar, 
  User, 
  BookOpen, 
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { GlassContainer } from '@/components/calendar/BookingPrimitives';
import { createClient } from '@/lib/supabase/client';

export default function CertificateVerifier() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [certData, setCertData] = useState<any>(null);

  const handleVerify = async () => {
    if (!code) return;
    setStatus('loading');
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from('lms_certificates')
      .select(`
        *,
        contact:contacts(full_name),
        course:courses(title)
      `)
      .eq('verification_code', code.toUpperCase())
      .single();

    if (error || !data) {
       setStatus('invalid');
       setCertData(null);
    } else {
       setCertData(data);
       setStatus('valid');
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center py-20 px-6 selection:bg-[#6c47ff]/30">
       <div className="max-w-2xl w-full text-center space-y-12">
          <div className="space-y-4">
             <div className="h-16 w-16 rounded-2xl bg-[#6c47ff]/10 flex items-center justify-center mx-auto border border-[#6c47ff]/20">
                <ShieldCheck className="h-8 w-8 text-[#6c47ff]" />
             </div>
             <h1 className="text-4xl font-black italic uppercase tracking-tighter">Credential <span className="text-white/20">Verification</span></h1>
             <p className="text-white/40 text-sm italic font-medium">Verify the authenticity of Leadsmind CRM certifications and academic records.</p>
          </div>

          <div className="relative group">
             <div className="absolute -inset-1 bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] rounded-[28px] blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
             <div className="relative flex gap-2 p-2 bg-[#0b0b14] border border-white/5 rounded-[28px]">
                <Input 
                   value={code}
                   onChange={(e) => setCode(e.target.value)}
                   placeholder="Enter Verification Code (e.g. CERT-A1B2C3D4)"
                   className="bg-transparent border-none text-lg font-bold italic tracking-widest placeholder:text-white/10 focus-visible:ring-0 pl-6 h-14"
                />
                <Button 
                   onClick={handleVerify}
                   disabled={status === 'loading'}
                   className="bg-[#6c47ff] hover:bg-[#5b3ce0] h-14 px-8 rounded-2xl gap-2 font-black italic uppercase text-xs"
                >
                   {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                   Verify
                </Button>
             </div>
          </div>

          {status === 'valid' && certData && (
             <GlassContainer className="p-12 text-left animate-in zoom-in-95 duration-500" withGlow>
                <div className="flex items-start justify-between mb-10">
                   <div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black uppercase tracking-widest mb-2 px-3 py-1">Authenticity Confirmed</Badge>
                      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Valid Certificate</h2>
                   </div>
                   <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 p-1">
                      <div className="h-full w-full rounded-full bg-emerald-500 flex items-center justify-center text-white">
                         <CheckCircle2 className="h-8 w-8" />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <InfoCell icon={User} label="Student Name" value={certData.contact?.full_name} />
                   <InfoCell icon={BookOpen} label="Course Title" value={certData.course?.title} />
                   <InfoCell icon={Award} label="Verification ID" value={certData.verification_code} />
                   <InfoCell icon={Calendar} label="Issue Date" value={new Date(certData.issue_date).toLocaleDateString()} />
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/5">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] leading-relaxed italic">
                      This digital signature is cryptographically linked to the Leadsmind CRM Blockchain-Verified academic ledger. Forging this document is a violation of international academic standards.
                   </p>
                </div>
             </GlassContainer>
          )}

          {status === 'invalid' && (
             <div className="p-12 rounded-[40px] border border-rose-500/20 bg-rose-500/5 animate-in slide-in-from-top-4 duration-500">
                <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white uppercase italic">Record Not Found</h3>
                <p className="text-white/40 text-sm mt-1 italic">The verification code provided does not match any valid records in our security ledger.</p>
             </div>
          )}
       </div>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1">
       <div className="flex items-center gap-2 text-white/20">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
       </div>
       <p className="text-lg font-bold text-white italic tracking-tight">{value || 'N/A'}</p>
    </div>
  );
}
