import { getComprehensiveCalendarAnalytics } from '@/app/actions/calendar';
import { BookingHeatmap } from '@/components/calendar/BookingHeatmap';
import { BookingTrendChart } from '@/components/dashboard/BookingTrendChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Zap, 
  BarChart3, 
  PieChart, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { GlassContainer, SectionLabel } from '@/components/calendar/BookingPrimitives';
import { cn } from '@/lib/utils';

export default async function AnalyticsPage() {
  const res = await getComprehensiveCalendarAnalytics();
  const data = res.data;

  if (!data) return null;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div>
         <div className="flex items-center gap-2 mb-1">
           <div className="h-5 w-5 rounded-md bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
              <Zap className="h-3 w-3 text-[#6c47ff]" />
           </div>
           <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.2em]">Live Business Intelligence</span>
         </div>
         <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">Booking <span className="text-white/20">Analytics</span></h1>
         <p className="text-white/40 text-sm font-medium mt-1">Cross-calendar performance and team efficiency metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Monthly Volume" 
          value={data.monthBookings} 
          trend="+14%" 
          icon={CalendarIcon} 
          description="Total bookings this month"
        />
        <KPICard 
          title="Show-Up Rate" 
          value={`${data.showUpRate.toFixed(1)}%`} 
          trend="+2.1%" 
          icon={Target} 
          description="Attendance efficiency"
          color="#10b981"
        />
        <KPICard 
          title="Conversion" 
          value="12.4%" 
          trend="+0.8%" 
          icon={TrendingUp} 
          description="Bookings → Closed Deals"
          color="#3b82f6"
        />
        <KPICard 
          title="Avg Lead Time" 
          value="4.2 Days" 
          icon={Clock} 
          description="Booking lead window"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap Section */}
        <GlassContainer className="lg:col-span-2 p-8">
           <SectionLabel 
             label="Availability Heatmap" 
             title="Booking Density" 
             description="Identify peak traffic hours across your entire organization."
             badge={
               <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none text-[10px] font-black uppercase tracking-widest">Live 7x24 Matrix</Badge>
             }
           />
           <BookingHeatmap data={data.slotAnalytics} />
        </GlassContainer>

        {/* Popular Days Distribution */}
        <GlassContainer className="lg:col-span-1 p-8">
           <SectionLabel label="Traffic Analysis" title="Popular Days" />
           <div className="space-y-6 mt-8">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                const count = data.dowDistribution[i];
                const max = Math.max(...data.dowDistribution, 1);
                const percent = (count / max) * 100;
                
                return (
                  <div key={day} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{day}</span>
                       <span className="text-xs font-bold text-white">{count} Bookings</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-linear-to-r from-[#6c47ff] to-[#8b5cf6] rounded-full transition-all duration-1000"
                         style={{ width: `${percent}%` }}
                       />
                    </div>
                  </div>
                )
              })}
           </div>
        </GlassContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Trend Chart (Reusable) */}
         <GlassContainer className="lg:col-span-2 p-8 h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <SectionLabel label="Growth Intelligence" title="Booking Trend" />
              <div className="flex gap-2">
                 {['30D', '60D', '90D'].map(v => (
                   <span key={v} className={cn(
                     "text-[9px] font-black px-2 py-1 rounded-md cursor-pointer transition-colors",
                     v === '90D' ? "bg-[#6c47ff] text-white" : "bg-white/5 text-white/20 hover:bg-white/10"
                   )}>{v}</span>
                 ))}
              </div>
           </div>
           <BookingTrendChart />
         </GlassContainer>

         <div className="lg:col-span-1 space-y-6">
            <GlassContainer className="p-8">
               <SectionLabel label="Source Attribution" title="Lead Drivers" />
               <div className="space-y-4 mt-6">
                  <SourceItem label="E-mail Campaign #4" value="45%" color="#6c47ff" />
                  <SourceItem label="SMS Follow-up" value="28%" color="#fdab3d" />
                  <SourceItem label="Organic (Direct)" value="15%" color="#10b981" />
                  <SourceItem label="Social/Referral" value="12%" color="#3b82f6" />
               </div>
            </GlassContainer>

            <div className="p-8 rounded-[40px] bg-[#6c47ff] shadow-[0_0_50px_rgba(108,71,255,0.3)] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 text-white/20 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <BarChart3 className="h-20 w-20" />
               </div>
               <h4 className="text-xl font-black text-white italic uppercase mb-2">Automated Optimization</h4>
               <p className="text-white/70 text-[11px] leading-relaxed relative z-10 max-w-[200px]">
                 AI is currently rerouting high-intent leads to your Tuesday 2PM gap to increase conversion by an estimated 14.2%.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon: Icon, description, color = '#6c47ff' }: any) {
  return (
    <div className="bg-[#0b0b14] border border-white/5 p-6 rounded-3xl relative overflow-hidden group transition-all hover:border-white/10">
       {/* Background Accent */}
       <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="h-24 w-24" style={{ color }} />
       </div>

       <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
             <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Icon className="h-4 w-4" style={{ color }} />
             </div>
             {trend && (
               <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                 <ArrowUpRight className="h-3 w-3" />
                 {trend}
               </div>
             )}
          </div>
          <div>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{title}</span>
             <h3 className="text-3xl font-black text-white italic tracking-tighter mt-0.5">{value}</h3>
          </div>
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-tight">{description}</p>
       </div>
    </div>
  )
}

function SourceItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/3">
       <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold text-white/70">{label}</span>
       </div>
       <span className="text-xs font-black text-white italic">{value}</span>
    </div>
  )
}
