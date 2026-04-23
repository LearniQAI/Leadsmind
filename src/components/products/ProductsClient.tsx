'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { deleteProduct } from '@/app/actions/finance';
import { toast } from 'sonner';

interface ProductsClientProps {
  initialProducts: any[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Products</h1>
          <p className="text-white/50 text-sm mt-1">Manage your storefront and digital assets.</p>
        </div>
        <div className="flex gap-4">
           <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2 rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#6c47ff]/20">
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
            className="pl-10 bg-[#0b0b10] border-white/5 text-white rounded-xl h-11"
          />
        </div>
        <Button variant="ghost" className="text-white/40"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#0b0b10] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest pl-8">Product Details</TableHead>
              <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Type</TableHead>
              <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Pricing</TableHead>
              <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Inventory</TableHead>
              <TableHead className="text-white/40 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                   <div className="flex flex-col items-center gap-2 text-white/10">
                      <Package className="h-12 w-12" />
                      <span className="font-bold uppercase tracking-tighter">No products found</span>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] group transition-all">
                  <TableCell className="pl-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                         {p.type === 'digital' ? <FileText className="h-6 w-6 text-[#6c47ff]" /> : <Box className="h-6 w-6 text-emerald-500" />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <div className="font-bold text-white text-base truncate">{p.name}</div>
                        <div className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">ID: {p.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="outline" className="capitalize border-white/10 text-white/40 bg-white/[0.01] px-3 py-0.5 rounded-lg text-[10px] font-black tracking-widest">
                       {p.type}
                     </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-base">{p.currency || '$'}{Number(p.price).toFixed(2)}</span>
                      {p.compare_at_price && (
                        <span className="text-[10px] text-white/20 line-through">WAS: ${p.compare_at_price}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-white/50 font-medium h-8 w-fit px-3 flex items-center bg-white/3 rounded-lg border border-white/5">
                      {p.stock_quantity === null || p.stock_quantity === undefined ? 'Unlimited' : p.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                     <Badge className={cn(
                       "border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                       p.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-white/20"
                     )}>
                       {p.is_active ? 'Published' : 'Draft'}
                     </Badge>
                  </TableCell>
                  <TableCell className="pr-8">
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all">
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
