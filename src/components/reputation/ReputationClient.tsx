'use client';

import { useState } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  MoreHorizontal,
  Mail,
  Facebook,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { replyToReview } from '@/app/actions/reputation';

interface ReputationClientProps {
  initialReviews: any[];
}

export function ReputationClient({ initialReviews }: ReputationClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleReply = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;

    setIsSubmitting(reviewId);
    try {
      const result = await replyToReview(reviewId, text);
      if (result.success) {
        toast.success('Reply submitted successfully!');
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: 'responded', response_text: text } : r));
        setReplyText({ ...replyText, [reviewId]: '' });
      } else {
        toast.error(result.error || 'Failed to submit reply');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="flex flex-col bg-[#030303] overflow-hidden p-8 gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Reputation Management</h1>
          <p className="text-white/40 text-sm mt-1">Monitor and respond to your customer feedback across all channels.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="border-white/5 bg-white/5 text-white/60 hover:bg-white/10 rounded-xl h-11 px-6 font-bold">
              Connect Channels
           </Button>
           <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#6c47ff]/20">
              <Mail className="h-4 w-4 mr-2" /> Request Review
           </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Rating', val: averageRating, icon: Star, color: 'text-amber-500', trend: '+0.1' },
          { label: 'Total Reviews', val: reviews.length, icon: Users, color: 'text-blue-500', trend: '+12%' },
          { label: 'Response Rate', val: '84%', icon: MessageSquare, color: 'text-[#6c47ff]', trend: 'Optimal' },
          { label: 'Feedback Reach', val: '12.4k', icon: TrendingUp, color: 'text-emerald-500', trend: '+5%' },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#0b0b10] border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge className="bg-white/5 text-white/40 border-none text-[10px] font-black uppercase tracking-widest">{stat.trend}</Badge>
              </div>
              <div className="text-3xl font-bold text-white tracking-tighter">{stat.val}</div>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Reviews Feed */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                  <Input 
                    placeholder="Search reviews..." 
                    className="bg-white/5 border-white/5 text-xs w-64 pl-9 h-10 rounded-xl focus:border-[#6c47ff]/50 transition-all" 
                  />
               </div>
               <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white bg-white/5 rounded-xl">
                  <Filter className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                 <Star className="h-12 w-12 text-white/5 mb-4" />
                 <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">No reviews found</p>
              </div>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="bg-[#0b0b10] border-white/5 rounded-2xl group overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center font-black text-[#6c47ff]">
                          {review.author_name?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{review.author_name}</span>
                            <div className="flex items-center ml-2 bg-amber-500/10 px-2 py-0.5 rounded-full">
                               <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 mr-1" />
                               <span className="text-[10px] font-black text-amber-500">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                            {review.platform} • {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none",
                        review.status === 'responded' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {review.status || 'pending'}
                      </Badge>
                    </div>

                    <p className="text-sm text-white/70 mt-6 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      "{review.review_text}"
                    </p>

                    {review.response_text && (
                       <div className="mt-4 pl-6 border-l-2 border-[#6c47ff]/20">
                          <p className="text-[10px] font-black uppercase text-[#6c47ff] mb-1">Your response</p>
                          <p className="text-xs text-white/40 italic">"{review.response_text}"</p>
                       </div>
                    )}

                    {!review.response_text && (
                       <div className="mt-6 space-y-4">
                          <textarea 
                            value={replyText[review.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                            placeholder="Type your response..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#6c47ff]/50 transition-all min-h-[80px]"
                          />
                          <div className="flex justify-end gap-3">
                             <Button 
                               onClick={() => handleReply(review.id)}
                               disabled={isSubmitting === review.id || !replyText[review.id]}
                               className="bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-widest px-6 h-9 rounded-xl"
                             >
                                {isSubmitting === review.id ? 'Sending...' : 'Post Reply'}
                             </Button>
                          </div>
                       </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Recommendations */}
        <div className="col-span-4 space-y-8">
           <Card className="bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] border-none rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-8">
                 <TrendingUp className="h-8 w-8 text-white mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Automated Requests</h3>
                 <p className="text-white/60 text-xs leading-relaxed mb-6">
                    Connect your CRM to automatically request reviews after a successful appointment or purchase.
                 </p>
                 <Button className="w-full bg-white text-[#6c47ff] hover:bg-white/90 font-bold text-xs uppercase tracking-widest rounded-xl h-11">
                    Setup Workflow
                 </Button>
              </CardContent>
           </Card>

           <Card className="bg-[#0b0b10] border-white/5 rounded-3xl">
              <CardHeader>
                 <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-[#6c47ff]" /> Connected Channels
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    {[
                      { name: 'Google My Business', icon: Monitor, status: 'Connected', color: 'text-blue-500' },
                      { name: 'Facebook Page', icon: Facebook, status: 'Not Linked', color: 'text-white/20' },
                    ].map((channel, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                         <div className="flex items-center gap-3">
                            <channel.icon className={cn("h-4 w-4", channel.color)} />
                            <span className="text-xs font-bold text-white/80">{channel.name}</span>
                         </div>
                         <span className={cn("text-[9px] font-black uppercase tracking-widest", channel.status === 'Connected' ? "text-emerald-500" : "text-white/10")}>
                            {channel.status}
                         </span>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

// Helper (imported from lib/utils but re-declared just in case)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
