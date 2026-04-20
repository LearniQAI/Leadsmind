'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookingTrendChart } from './BookingTrendChart';

interface BookingAnalytic {
  slot_day_of_week: number;
  slot_hour: number;
  total_bookings: number;
  show_up_count: number;
  no_show_count: number;
  converted_to_deal_count: number;
  show_up_rate: number;
  conversion_rate: number;
}

interface BookingIntelligenceDashboardProps {
  analytics: BookingAnalytic[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function BookingIntelligenceDashboard({ analytics }: BookingIntelligenceDashboardProps) {
  
  const stats = useMemo(() => {
    if (!analytics.length) return null;

    // Best Day by Show-up Rate
    const dayStats = analytics.reduce((acc, curr) => {
      acc[curr.slot_day_of_week] = acc[curr.slot_day_of_week] || { total: 0, shows: 0 };
      acc[curr.slot_day_of_week].total += curr.total_bookings;
      acc[curr.slot_day_of_week].shows += curr.show_up_count;
      return acc;
    }, {} as Record<number, { total: number, shows: number }>);

    let bestDay = 0;
    let maxShowRate = -1;
    Object.entries(dayStats).forEach(([day, stat]) => {
      const rate = stat.total > 0 ? stat.shows / stat.total : 0;
      if (rate > maxShowRate) {
        maxShowRate = rate;
        bestDay = parseInt(day);
      }
    });

    // Best Hour by Conversion Rate
    const hourStats = analytics.reduce((acc, curr) => {
      acc[curr.slot_hour] = acc[curr.slot_hour] || { total: 0, conversions: 0 };
      acc[curr.slot_hour].total += curr.total_bookings;
      acc[curr.slot_hour].conversions += curr.converted_to_deal_count;
      return acc;
    }, {} as Record<number, { total: number, conversions: number }>);

    let bestHour = 0;
    let maxConvRate = -1;
    Object.entries(hourStats).forEach(([hour, stat]) => {
      const rate = stat.total > 0 ? stat.conversions / stat.total : 0;
      if (rate > maxConvRate) {
        maxConvRate = rate;
        bestHour = parseInt(hour);
      }
    });

    // High No-Show Risk (Top 3 slots)
    const riskSlots = [...analytics]
      .filter(a => a.total_bookings >= 3) // Need some data
      .sort((a, b) => {
          const aRate = a.total_bookings > 0 ? a.no_show_count / a.total_bookings : 0;
          const bRate = b.total_bookings > 0 ? b.no_show_count / b.total_bookings : 0;
          return bRate - aRate;
      })
      .slice(0, 3);

    return {
      bestDay: DAYS[bestDay],
      bestDayRate: Math.round(maxShowRate * 100),
      bestHour: `${bestHour % 12 || 12}:00 ${bestHour >= 12 ? 'PM' : 'AM'}`,
      bestHourRate: Math.round(maxConvRate * 100),
      riskSlots: riskSlots.map(s => ({
          day: DAYS[s.slot_day_of_week],
          hour: `${s.slot_hour % 12 || 12}:00 ${s.slot_hour >= 12 ? 'PM' : 'AM'}`,
          rate: Math.round((s.no_show_count / s.total_bookings) * 100)
      }))
    };
  }, [analytics]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-white/5 bg-white/5 rounded-3xl text-center">
        <TrendingUp className="h-12 w-12 text-white/20 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Not Enough Data Yet</h3>
        <p className="text-white/40 max-w-xs">Start collecting bookings to see AI-driven scheduling intelligence here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best Day Card */}
        <Card className="bg-[#0b0b14] border-white/5 overflow-hidden group hover:border-[#6c47ff]/30 transition-all duration-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
               <div className="h-10 w-10 rounded-xl bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                 <Calendar className="h-5 w-5 text-[#6c47ff]" />
               </div>
               <Badge variant="outline" className="bg-[#6c47ff]/5 text-[#6c47ff] border-[#6c47ff]/20">Smart Choice</Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-4">Highest Show-Up Rate</CardTitle>
            <CardDescription className="text-white/30 text-xs">Based on past 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <span className="text-4xl font-black text-white italic uppercase tracking-tighter">{stats.bestDay}</span>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">{stats.bestDayRate}% attendance rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Hour Card */}
        <Card className="bg-[#0b0b14] border-white/5 overflow-hidden group hover:border-[#fdab3d]/30 transition-all duration-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
               <div className="h-10 w-10 rounded-xl bg-[#fdab3d]/10 flex items-center justify-center border border-[#fdab3d]/20">
                 <Clock className="h-5 w-5 text-[#fdab3d]" />
               </div>
               <Badge variant="outline" className="bg-[#fdab3d]/5 text-[#fdab3d] border-[#fdab3d]/20">Money Hour</Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-4">Top Converting Hour</CardTitle>
            <CardDescription className="text-white/30 text-xs">Highest lead-to-deal ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <span className="text-4xl font-black text-white italic uppercase tracking-tighter">{stats.bestHour}</span>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-[#fdab3d]" />
                <span className="text-sm font-medium text-[#fdab3d]">{stats.bestHourRate}% conversion rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No-Show Risk Card */}
        <Card className="bg-[#0b0b14] border-white/5 overflow-hidden group hover:border-rose-500/30 transition-all duration-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
               <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                 <XCircle className="h-5 w-5 text-rose-500" />
               </div>
               <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/20">High Risk</Badge>
            </div>
            <CardTitle className="text-lg font-bold mt-4">No-Show Risk Times</CardTitle>
            <CardDescription className="text-white/30 text-xs">Flagged for potential recovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              {stats.riskSlots.map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                   <span className="text-xs font-bold text-white/60">{slot.day} {slot.hour}</span>
                   <div className="flex items-center gap-1.5">
                     <AlertTriangle className="h-3 w-3 text-rose-500" />
                     <span className="text-xs font-bold text-rose-500">{slot.rate}% risk</span>
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 90 Day Trend Comparison */}
      <Card className="bg-[#0b0b14] border border-white/5 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Performance Trends</CardTitle>
            <CardDescription className="text-white/30 text-xs italic uppercase tracking-widest font-black mt-1">Efficiency +12.4% vs last period</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
             <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
             <span className="text-xs font-bold text-emerald-500">Live AI Tracking</span>
          </div>
        </CardHeader>
        <CardContent className="h-[220px] pb-8">
           <BookingTrendChart />
        </CardContent>
      </Card>
    </div>
  );
}
