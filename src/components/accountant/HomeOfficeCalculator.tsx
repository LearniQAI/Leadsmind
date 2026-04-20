'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Home, 
  Layers, 
  Zap, 
  HardHat,
  Monitor,
  CheckCircle2,
  Lock,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveHomeOfficeSetup } from '@/app/actions/accountant';
import { toast } from 'sonner';

export default function HomeOfficeCalculator({ workspaceId, initialData }: { workspaceId: string, initialData: any }) {
  const [totalArea, setTotalArea] = useState(initialData?.total_home_area?.toString() || '150');
  const [officeArea, setOfficeArea] = useState(initialData?.dedicated_office_area?.toString() || '15');
  const [isSaving, setIsSaving] = useState(false);
  
  const percentage = (parseFloat(officeArea) / parseFloat(totalArea)) * 100 || 0;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveHomeOfficeSetup(workspaceId, {
        total_home_area: parseFloat(totalArea),
        dedicated_office_area: parseFloat(officeArea),
        deduction_percentage: percentage
      });
      toast.success("Home Office Setup Persisted");
    } catch (e) {
      toast.error("Failed to save setup");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Card */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl space-y-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
                 <Home className="text-sky-500" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Home Office Setup</h3>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">SARS Section 11(a) / (e) Logic</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Total Home Area (sqm)</label>
                 <Input 
                    type="number"
                    value={totalArea}
                    onChange={(e) => setTotalArea(e.target.value)}
                    className="h-14 bg-white/[0.02] border-white/10 rounded-2xl font-black text-lg focus:ring-sky-500/20 focus:border-sky-500/50 transition-all" 
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Dedicated Office Area (sqm)</label>
                 <Input 
                    type="number"
                    value={officeArea}
                    onChange={(e) => setOfficeArea(e.target.value)}
                    className="h-14 bg-white/[0.02] border-white/10 rounded-2xl font-black text-lg focus:ring-sky-500/20 focus:border-sky-500/50 transition-all" 
                 />
              </div>
           </div>

           <div className="p-8 rounded-3xl bg-sky-500/10 border border-sky-500/20 text-center space-y-2 group transition-all hover:bg-sky-500/20">
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Apportionment Percentage</span>
              <h2 className="text-5xl font-black text-white tracking-tighter">{percentage.toFixed(2)}%</h2>
              <p className="text-white/40 text-xs font-bold italic">This percentage of all home expenses is now tax deductible.</p>
           </div>
        </Card>

        {/* Expenses Checklist */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl space-y-6">
           <h4 className="text-sm font-black text-white uppercase tracking-tight mb-4">Eligible Expenses</h4>
           
           <div className="grid grid-cols-1 gap-2">
              {[
                { name: 'Rent / Bond Interest', icon: Lock, active: true },
                { name: 'Electricity & Water', icon: Zap, active: true },
                { name: 'Rates & Taxes', icon: Layers, active: true },
                { name: 'Security / Monitoring', icon: ShieldCheck, active: true },
                { name: 'Repairs & Maintenance', icon: HardHat, active: true },
                { name: 'Fiber / Internet', icon: Monitor, active: false },
              ].map((item, i) => (
                <div key={i} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                    item.active ? "bg-white/[0.03] border-white/10 text-white" : "bg-transparent border-white/5 text-white/20"
                )}>
                   <div className="flex items-center gap-4">
                      <item.icon size={18} className={item.active ? "text-sky-500" : "text-white/10"} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                   </div>
                   {item.active && <CheckCircle2 size={16} className="text-sky-500" />}
                </div>
              ))}
           </div>

           <div className="pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-sky-500/20"
              >
                 {isSaving ? <Loader2 className="animate-spin" /> : "Apply Calculation to Books"}
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
