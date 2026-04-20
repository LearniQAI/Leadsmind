'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  ArrowUpRight, 
  Settings2,
  Box,
  History,
  TrendingDown,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { addIncomingStock } from '@/app/actions/accountant';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    quantity_on_hand: number;
    min_stock_level: number;
    cost_price: number;
    costing_method: string;
}

export default function InventoryDashboard({ workspaceId, initialData }: { workspaceId: string, initialData: InventoryItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState(initialData);

  const [newLot, setNewLot] = useState({
    product_id: '',
    quantity: '',
    unit_cost: '',
    reference: ''
  });

  const filteredProducts = items.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIncomingStock = async () => {
    try {
      if (!newLot.product_id || !newLot.quantity) return;
      setIsSaving(true);
      const res = await addIncomingStock(workspaceId, {
        ...newLot,
        quantity: parseInt(newLot.quantity),
        unit_cost: parseFloat(newLot.unit_cost || '0')
      });
      
      // Local update
      setItems(items.map(p => p.id === newLot.product_id 
        ? { ...p, quantity_on_hand: p.quantity_on_hand + parseInt(newLot.quantity) } 
        : p
      ));
      
      toast.success("Incoming Stock Recorded Successfully");
      setNewLot({ product_id: '', quantity: '', unit_cost: '', reference: '' });
    } catch (e) {
      toast.error("Failed to record stock");
    } finally {
      setIsSaving(false);
    }
  };

  const totalValuation = items.reduce((acc, curr) => acc + (curr.quantity_on_hand * curr.cost_price), 0);
  const lowStockCount = items.filter(p => p.quantity_on_hand < (p.min_stock_level || 0)).length;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
               <Box className="text-primary" size={20} />
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Valuation</span>
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white tracking-tight leading-none">R{totalValuation.toLocaleString()}</h2>
               <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Across {items.length} SKUs</p>
            </div>
         </Card>

         <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
               <TrendingDown className="text-rose-500" size={20} />
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Low Stock Alerts</span>
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white tracking-tight leading-none">{lowStockCount}</h2>
               <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Requires Reordering</p>
            </div>
         </Card>

         <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
               <History className="text-sky-500" size={20} />
               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Stock Turnover</span>
            </div>
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white tracking-tight leading-none">--</h2>
               <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Annual Efficiency Rate</p>
            </div>
         </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Package className="text-primary" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">Stock Inventory</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Live Database Linked</p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <Input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search SKU or Name..." 
                    className="h-12 bg-white/5 border-white/10 rounded-2xl pl-12 w-full md:w-64 font-bold text-sm" 
                  />
               </div>
               
               <Dialog>
                 <DialogTrigger render={
                    <Button className="h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl gap-2 font-black uppercase tracking-widest text-[10px] px-6">
                        <Plus size={16} />
                        Incoming Stock
                    </Button>
                 } />
                 <DialogContent className="bg-[#0b0b15] border-white/10 text-white rounded-[40px] p-10 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Record Incoming Stock</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Select Product</label>
                            <select 
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 font-bold text-sm outline-none focus:border-primary/50"
                                value={newLot.product_id}
                                onChange={e => setNewLot({...newLot, product_id: e.target.value})}
                            >
                                <option value="" className="bg-[#0b0b15]">Select a product...</option>
                                {items.map(p => (
                                    <option key={p.id} value={p.id} className="bg-[#0b0b15]">{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Quantity</label>
                                <Input 
                                    type="number"
                                    placeholder="0"
                                    value={newLot.quantity}
                                    onChange={e => setNewLot({...newLot, quantity: e.target.value})}
                                    className="bg-white/5 border-white/10 rounded-xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Unit Cost (R)</label>
                                <Input 
                                    type="number"
                                    placeholder="0.00"
                                    value={newLot.unit_cost}
                                    onChange={e => setNewLot({...newLot, unit_cost: e.target.value})}
                                    className="bg-white/5 border-white/10 rounded-xl font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Reference / Invoice #</label>
                            <Input 
                                placeholder="SUP-001"
                                value={newLot.reference}
                                onChange={e => setNewLot({...newLot, reference: e.target.value})}
                                className="bg-white/5 border-white/10 rounded-xl font-bold"
                            />
                        </div>
                        <Button 
                            onClick={handleIncomingStock}
                            disabled={isSaving}
                            className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                        >
                            {isSaving ? <Loader2 className="animate-spin" /> : "Verify & Add to Stock"}
                        </Button>
                    </div>
                 </DialogContent>
               </Dialog>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-white/5">
                     <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Product Details</th>
                     <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Stock Level</th>
                     <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Est. Cost Price</th>
                     <th className="pb-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Valuation</th>
                     <th className="pb-6 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((p, i) => (
                     <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                        <td className="py-6">
                           <div className="space-y-1">
                              <p className="font-black text-white tracking-tight uppercase">{p.name}</p>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{p.sku || 'NO-SKU'}</span>
                                 <Badge variant="outline" className="text-[8px] h-4 rounded-full border-white/10 text-white/40 uppercase tracking-tighter">{p.costing_method?.toUpperCase() || 'FIFO'}</Badge>
                              </div>
                           </div>
                        </td>
                        <td className="py-6">
                           <div className="space-y-1">
                              <p className={cn("font-black tracking-tight", p.quantity_on_hand < (p.min_stock_level || 0) ? "text-rose-500" : "text-white")}>{p.quantity_on_hand} Units</p>
                              <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className={cn("h-full rounded-full transition-all", p.quantity_on_hand < (p.min_stock_level || 0) ? "bg-rose-500" : "bg-primary")} style={{ width: `${Math.min(100, (p.quantity_on_hand/(p.min_stock_level || 1))*50)}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="py-6 font-black text-white/60 tracking-tight">R{parseFloat(p.cost_price?.toString() || '0').toLocaleString()}</td>
                        <td className="py-6 font-black text-emerald-500 tracking-tight">R{(p.quantity_on_hand * parseFloat(p.cost_price?.toString() || '0')).toLocaleString()}</td>
                        <td className="py-6 text-right">
                           <Button variant="ghost" size="icon" className="text-white/20 hover:text-white rounded-full">
                              <Settings2 size={18} />
                           </Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredProducts.length === 0 && (
            <div className="py-20 text-center opacity-30">
                <Box size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No matching products found in database</p>
            </div>
         )}
      </Card>
    </div>
  );
}
