import { LifeBuoy, Search, Filter, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, User, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTickets, getTicketStats } from '@/app/actions/support';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default async function SupportPage() {
  const [tickets, stats] = await Promise.all([
    getTickets(),
    getTicketStats()
  ]);

  const statusColors: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-500',
    in_progress: 'bg-amber-500/10 text-amber-500',
    waiting_client: 'bg-purple-500/10 text-purple-500',
    resolved: 'bg-emerald-500/10 text-emerald-500',
    closed: 'bg-white/5 text-white/40'
  };

  const priorityColors: Record<string, string> = {
    low: 'text-white/20',
    normal: 'text-white/40',
    high: 'text-amber-500',
    urgent: 'text-red-500'
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Support Helpdesk</h1>
          <p className="text-white/50 text-sm mt-1">Manage customer support tickets and knowledge base.</p>
        </div>
        <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2 rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#6c47ff]/20">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Tickets</p>
          <p className="text-2xl font-bold text-white">{stats.open}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Critical/Urgent</p>
          <p className="text-2xl font-bold text-red-500">{stats.high}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Resolution Rate</p>
          <p className="text-2xl font-bold text-emerald-400">92%</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search tickets..." 
            className="pl-10 bg-[#0b0b10] border-white/5 text-white"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40">Ticket</TableHead>
              <TableHead className="text-white/40">Customer</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="text-white/40">Priority</TableHead>
              <TableHead className="text-white/40">Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-white/20">
                  <div className="flex flex-col items-center gap-2">
                    <LifeBuoy className="h-8 w-8 text-white/5" />
                    <span>No support tickets found.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-white/5 hover:bg-white/[0.02] group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white leading-tight">{ticket.title}</span>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1">#TIC-{ticket.id.substring(0, 6).toUpperCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#6c47ff]">
                        {ticket.contact?.first_name?.[0] || 'U'}
                      </div>
                      <span className="text-xs text-white/70">{ticket.contact?.first_name} {ticket.contact?.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge className={cn(statusColors[ticket.status], "border-none px-3 uppercase text-[9px] font-black tracking-widest")}>
                       {ticket.status.replace('_', ' ')}
                     </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest", priorityColors[ticket.priority])}>
                      <AlertCircle className="h-3 w-3" />
                      {ticket.priority}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/30 text-[10px] font-medium uppercase">
                    {format(new Date(ticket.created_at), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
