'use client';

import React, { useState, useRef } from 'react';
import { 
  Award, 
  Image as ImageIcon, 
  Type, 
  Square, 
  User, 
  BookOpen, 
  QrCode, 
  Save,
  Download,
  Palette,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { saveCertificateTemplate } from '@/app/actions/lms';
import { Loader2 } from 'lucide-react';

export function CertificateDesigner() {
  const [design, setDesign] = useState({
    bgColor: '#ffffff',
    textColor: '#0a0a0a',
    accentColor: '#6c47ff',
    borderWidth: 20,
    borderRadius: 0,
    showLogo: true,
    showSignature: true,
    logoUrl: '',
    signatureUrl: '',
    title: 'CERTIFICATE OF ACHIEVEMENT'
  });

  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
       await saveCertificateTemplate({ ...design });
       toast.success('Institutional Template Synced to Blockchain');
    } catch (e) {
       toast.error('Sync Failed');
    } finally {
       setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-10 animate-in fade-in duration-700">
       {/* Settings Sidebar */}
       <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-[40px] bg-[#0b0b14] border border-white/5 space-y-8 shadow-2xl">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Palette className="h-5 w-5 text-[#6c47ff]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Visual Identity</span>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <Label>Background Color</Label>
                   <div className="flex gap-2">
                      <ColorBtn color="#ffffff" active={design.bgColor === '#ffffff'} onClick={() => setDesign({...design, bgColor: '#ffffff'})} />
                      <ColorBtn color="#f8fafc" active={design.bgColor === '#f8fafc'} onClick={() => setDesign({...design, bgColor: '#f8fafc'})} />
                      <ColorBtn color="#050508" active={design.bgColor === '#050508'} onClick={() => setDesign({...design, bgColor: '#050508'})} />
                      <Input 
                         value={design.bgColor} 
                         onChange={(e) => setDesign({...design, bgColor: e.target.value})}
                         className="h-8 w-16 bg-white/5 border-none p-1 text-[10px]"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label>Accent Token</Label>
                   <div className="flex gap-2">
                      <ColorBtn color="#6c47ff" active={design.accentColor === '#6c47ff'} onClick={() => setDesign({...design, accentColor: '#6c47ff'})} />
                      <ColorBtn color="#10b981" active={design.accentColor === '#10b981'} onClick={() => setDesign({...design, accentColor: '#10b981'})} />
                      <ColorBtn color="#f59e0b" active={design.accentColor === '#f59e0b'} onClick={() => setDesign({...design, accentColor: '#f59e0b'})} />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label>Border Weight</Label>
                   <Slider 
                      value={[design.borderWidth]} 
                      max={60} 
                      onValueChange={(val) => setDesign({...design, borderWidth: val[0]})}
                   />
                </div>
             </div>

             <div className="flex items-center gap-3 border-b border-white/5 pb-4 pt-4">
                <Layers className="h-5 w-5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Dynamic Assets</span>
             </div>

             <div className="space-y-3">
                <AssetToggle 
                   icon={ImageIcon} 
                   label="Institutional Logo" 
                   active={design.showLogo} 
                   onToggle={() => setDesign({...design, showLogo: !design.showLogo})} 
                />
                <AssetToggle 
                   icon={ImageIcon} 
                   label="Instructor Signature" 
                   active={design.showSignature} 
                   onToggle={() => setDesign({...design, showSignature: !design.showSignature})} 
                />
             </div>

             <Button 
                disabled={isSaving}
                onClick={handleSave}
                className="w-full h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black italic uppercase rounded-2xl gap-2 mt-4"
             >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Flash-Sync Template
             </Button>
          </div>
       </div>

       {/* Live Preview Canvas */}
       <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Eye className="h-4 w-4 text-emerald-500" />
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-Time Vector Rendering</span>
             </div>
             <Button variant="ghost" className="text-white/20 hover:text-white rounded-xl gap-2 font-bold italic uppercase text-[10px]">
                <Download className="h-3.5 w-3.5" />
                Test Generation (PDF)
             </Button>
          </div>

          <div 
             className="aspect-[1.414/1] w-full relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 rounded-sm"
             style={{ backgroundColor: design.bgColor }}
          >
             {/* Dynamic Border */}
             <div 
                className="absolute inset-0 pointer-events-none transition-all"
                style={{ 
                   border: `${design.borderWidth}px solid ${design.accentColor}`,
                   opacity: 0.1
                }}
             />
             <div 
                className="absolute inset-8 pointer-events-none"
                style={{ border: `1px solid ${design.accentColor}33` }}
             />

             {/* Certificate Content */}
             <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center">
                <div className="flex items-center gap-3 mb-10 opacity-30">
                   <div className="h-px w-12 bg-current" />
                   <Award className="h-8 w-8" style={{ color: design.accentColor }} />
                   <div className="h-px w-12 bg-current" />
                </div>

                <h1 className="text-[10px] font-black uppercase tracking-[0.6em] mb-4" style={{ color: design.accentColor }}>{design.title}</h1>
                <p className="text-[12px] italic font-medium opacity-40 mb-12" style={{ color: design.textColor }}>This document validates that</p>
                
                <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4" style={{ color: design.textColor }}>
                   {`{{student.fullName}}`}
                </h2>
                
                <div className="h-1 w-32 mx-auto mb-8 bg-linear-to-r from-transparent via-current to-transparent opacity-10" style={{ color: design.accentColor }} />
                
                <p className="text-sm font-medium opacity-50 mb-2" style={{ color: design.textColor }}>has successfully masterted the requirements of</p>
                <h3 className="text-2xl font-bold italic uppercase tracking-tight mb-12" style={{ color: design.textColor }}>
                   {`{{course.title}}`}
                </h3>

                <div className="grid grid-cols-3 w-full mt-auto pt-10 items-end">
                   <div className="text-left flex flex-col gap-1 items-start">
                      <div className="h-px w-24 bg-current opacity-20 mb-2" style={{ color: design.textColor }} />
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-20" style={{ color: design.textColor }}>Issuance Date</span>
                      <span className="text-[10px] font-bold italic" style={{ color: design.textColor }}>{`{{completedDate}}`}</span>
                   </div>

                   <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 bg-white rounded-lg p-2 border border-black/5 opacity-50 grayscale">
                         <QrCode className="h-full w-full" />
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-30" style={{ color: design.textColor }}>{`{{certificateId}}`}</span>
                   </div>

                   <div className="text-right flex flex-col gap-1 items-end">
                      <div className="h-px w-24 bg-current opacity-20 mb-2" style={{ color: design.textColor }} />
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-20" style={{ color: design.textColor }}>Instruction Head</span>
                      <span className="text-[10px] font-bold italic" style={{ color: design.textColor }}>{`{{instructor.name}}`}</span>
                   </div>
                </div>
             </div>

             {/* Watermark Logo */}
             {design.showLogo && (
               <div className="absolute top-12 right-12 h-20 w-20 flex items-center justify-center border border-black/5 rounded-full overflow-hidden grayscale opacity-10">
                  <Award className="h-10 w-10" />
               </div>
             )}
          </div>

          <div className="p-8 rounded-[32px] bg-[#0b0b14] border border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                   <ShieldCheck className="h-5 w-5 text-[#6c47ff]" />
                </div>
                <div>
                   <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Public Verification Active</h4>
                   <p className="text-[10px] text-white/40 italic">Certificates are cryptographically linked to your public verification portal.</p>
                </div>
             </div>
             <Button variant="outline" className="bg-white/5 border-white/10 text-white rounded-xl text-[10px] h-10 px-6 font-black italic uppercase">
                Preview Web Portal
                <ChevronRight className="h-4 w-4 ml-2" />
             </Button>
          </div>
       </div>
    </div>
  );
}

function Label({ children }: any) {
  return <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 block mb-2">{children}</span>;
}

function ColorBtn({ color, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-6 w-6 rounded-lg border-2 transition-all scale-100 hover:scale-110",
        active ? "border-[#6c47ff] ring-2 ring-[#6c47ff]/20" : "border-white/10"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

function AssetToggle({ icon: Icon, label, active, onToggle }: any) {
  return (
    <button 
       onClick={onToggle}
       className={cn(
         "w-full p-4 rounded-2xl flex items-center justify-between transition-all group border",
         active ? "bg-white/5 border-white/10" : "bg-transparent border-white/5 opacity-50"
       )}
    >
       <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4", active ? "text-emerald-400" : "text-white/20")} />
          <span className="text-[10px] font-bold text-white uppercase tracking-tight">{label}</span>
       </div>
       <div className={cn(
          "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
          active ? "bg-emerald-400 border-emerald-400" : "bg-transparent border-white/10"
       )}>
          {active && <Save className="h-2 w-2 text-white" />}
       </div>
    </button>
  );
}
