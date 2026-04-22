'use client';

import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  ArrowUpRight,
  Tag,
  Box,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function ProductsPage() {
  const products = [
    { id: '1', name: 'Digital Strategy Course', type: 'digital', price: 199.00, status: 'active', stock: 'Unlimited' },
    { id: '2', name: 'Premium CRM Template', type: 'digital', price: 49.00, status: 'active', stock: 'Unlimited' },
    { id: '3', name: '1-on-1 Coaching Session', type: 'service', price: 150.00, status: 'active', stock: 'N/A' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Products</h1>
          <p className="text-white/50 text-sm mt-1">Manage your storefront and digital assets.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search products..." 
            className="pl-10 bg-[#0b0b10] border-white/5 text-white"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40">Product</TableHead>
              <TableHead className="text-white/40">Type</TableHead>
              <TableHead className="text-white/40">Price</TableHead>
              <TableHead className="text-white/40">Stock</TableHead>
              <TableHead className="text-white/40">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center">
                       {p.type === 'digital' ? <FileText className="h-5 w-5 text-[#6c47ff]" /> : <Box className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest">#{p.id.padStart(4, '0')}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge variant="outline" className="capitalize border-white/10 text-white/50">
                     {p.type}
                   </Badge>
                </TableCell>
                <TableCell className="text-white font-bold">
                  ${p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-white/50">
                  {p.stock}
                </TableCell>
                <TableCell>
                   <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
