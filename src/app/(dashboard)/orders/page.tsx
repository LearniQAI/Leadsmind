import { ShoppingBag, Search, Filter, MoreHorizontal, ArrowUpRight, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentWorkspaceId } from '@/lib/auth';
import { getOrders, getOrdersStats } from '@/app/actions/finance';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) redirect('/login');

  const [orders, stats] = await Promise.all([
    getOrders(workspaceId),
    getOrdersStats(workspaceId)
  ]);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500',
    paid: 'bg-emerald-500/10 text-emerald-500',
    fulfilled: 'bg-blue-500/10 text-blue-500',
    refunded: 'bg-red-500/10 text-red-500',
    cancelled: 'bg-white/5 text-white/40'
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Orders</h1>
          <p className="text-white/50 text-sm mt-1">Track and manage your customer purchases.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Sales</p>
          <p className="text-2xl font-bold text-white">${stats.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Orders</p>
          <p className="text-2xl font-bold text-white">{stats.count}</p>
        </div>
        <div className="p-6 rounded-2xl bg-[#0b0b10] border border-white/5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Pending Fulfillment</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10 bg-[#0b0b10] border-white/5 text-white"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40">Order ID</TableHead>
              <TableHead className="text-white/40">Customer</TableHead>
              <TableHead className="text-white/40">Date</TableHead>
              <TableHead className="text-white/40">Total</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-white/20">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.02] group">
                  <TableCell>
                    <div className="font-bold text-white">#{order.id.substring(0, 8).toUpperCase()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{order.contact?.first_name} {order.contact?.last_name}</span>
                      <span className="text-[10px] text-white/30">{order.contact?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/50 text-xs">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-white font-bold">
                    ${Number(order.total).toFixed(2)}
                  </TableCell>
                  <TableCell>
                     <Badge className={`${statusColors[order.status] || 'bg-white/5 text-white/40'} border-none px-3 uppercase text-[9px] font-black tracking-widest`}>
                       {order.status}
                     </Badge>
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
