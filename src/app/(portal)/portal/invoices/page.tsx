import { requireAuth, getCurrentWorkspaceId } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Receipt, Search, Download, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ClientInvoicesPage() {
  const user = await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const supabase = await createServerClient();

  const { data: profile } = await supabase
    .from('users')
    .select('contact_id')
    .eq('id', user.id)
    .single();

  const contactId = profile?.contact_id;

  if (!contactId) return <div className="text-white/40">Profile not found.</div>;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  const statusColor: Record<string, string> = {
    paid: 'border-green-500/20 text-green-400 bg-green-500/10',
    draft: 'border-white/10 text-white/40 bg-white/5',
    sent: 'border-[#6c47ff]/20 text-[#6c47ff] bg-[#6c47ff]/10',
    overdue: 'border-red-500/20 text-red-400 bg-red-500/10',
    open: 'border-orange-500/20 text-orange-400 bg-orange-500/10',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Billing History</h1>
          <p className="mt-1 text-white/40 text-sm">View and download your invoices.</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/5 rounded-[32px] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-white/[0.02]">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input 
              placeholder="Search invoices..." 
              className="bg-white/5 border-white/10 text-white pl-9 text-xs h-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5 h-9 font-bold text-[10px] uppercase tracking-widest">
              <Download className="h-3 w-3 mr-2" /> Download All
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/[0.01]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] py-4">Invoice #</TableHead>
              <TableHead className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Date</TableHead>
              <TableHead className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Amount</TableHead>
              <TableHead className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">Status</TableHead>
              <TableHead className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!invoices || invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-white/20 text-xs font-medium italic">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="text-white font-bold text-xs py-4">
                    INV-{inv.invoice_number || inv.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-white/40 text-xs font-medium">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-white font-black text-sm">
                    ${(inv.amount_due || inv.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColor[inv.status] || ''}`}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 group-hover:text-white group-hover:bg-white/10 rounded-lg">
                      <ExternalLink className="h-4 w-4" />
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
