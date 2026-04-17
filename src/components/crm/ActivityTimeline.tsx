'use client';

import { ContactActivity } from '@/types/crm.types';
import { format } from 'date-fns';
import { 
  MessageSquare, 
  CheckSquare, 
  Target, 
  Settings, 
  Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  activities: ContactActivity[];
}

const activityIcons = {
  note: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  task: { icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-400/10' },
  deal: { icon: Target, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  system: { icon: Settings, color: 'text-white/40', bg: 'bg-white/5' },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:left-[19px] before:w-px before:bg-white/5 before:my-4">
      {activities?.map((activity, index) => {
        const config = activityIcons[activity.type] || activityIcons.system;
        return (
          <div key={activity.id} className="relative pl-12">
            <div className={cn(
              "absolute left-0 h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-sm z-10",
              config.bg
            )}>
              <config.icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="flex flex-col gap-1 pt-1">
               <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 font-semibold">{activity.description}</span>
                  <div className="flex items-center gap-1.5 text-white/20">
                     <Clock className="h-3 w-3" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">
                       {format(new Date(activity.created_at), 'HH:mm')}
                     </span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
                    {format(new Date(activity.created_at), 'MMMM d, yyyy')}
                  </span>
               </div>
               {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 p-3 rounded-xl bg-white/3 border border-white/5 text-[11px] text-white/60 font-medium">
                     <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(activity.metadata, null, 2)}</pre>
                  </div>
               )}
            </div>
          </div>
        );
      })}
      {(!activities || activities.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Clock className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">No activity logged yet</p>
        </div>
      )}
    </div>
  );
}
