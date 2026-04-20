'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Send, 
  Save, 
  Calculator, 
  UserPlus,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { getRecentClients, createQuote } from '@/app/actions/invoice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  tax: number;
  discount: number;
}

export function QuoteForm({ workspaceId, initialData }: { workspaceId: string, initialData?: any }) {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, tax: 15, discount: 0 }
  ]);
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRecentClients(workspaceId).then(setClients);
  }, [workspaceId]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0, tax: 15, discount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
    const taxTotal = items.reduce((sum, item) => sum + (item.rate * item.quantity * (item.tax / 100)), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.rate * item.quantity * (item.discount / 100)), 0);
    const total = subtotal + taxTotal - discountTotal;
    return { subtotal, taxTotal, total };
  };

  const { subtotal, taxTotal, total } = calculateTotals();

  const handleSave = async (status = 'draft') => {
    if (!selectedClientId) {
      toast.error("Please select a client first");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createQuote(workspaceId, {
        contact_id: selectedClientId,
        items,
        subtotal,
        tax_total: taxTotal,
        total_amount: total,
        status,
        notes,
        valid_until: validUntil || null,
        currency: 'ZAR'
      });
      toast.success(`Quote ${status === 'sent' ? 'sent' : 'saved'} successfully!`);
      router.push("/invoice/quotes");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <div className="xl:col-span-3 space-y-8">
        {/* Client Selection */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                   <UserPlus size={18} className="text-primary" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Quote Recipient</h3>
             </div>
          </div>
          
          <Select value={selectedClientId} onValueChange={(val) => setSelectedClientId(val)}>
            <SelectTrigger className="bg-black/40 border-white/10 h-14 rounded-xl text-white">
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} ({client.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Line Items */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Line Items</h3>
            <Button 
                onClick={addItem}
                variant="outline" 
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-10 px-4 text-xs font-bold gap-2"
            >
              <Plus size={14} /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 bg-white/[0.02] border border-white/5 rounded-2xl group transition-all hover:bg-white/[0.05]">
                <div className="col-span-12 md:col-span-5">
                  <Input 
                    placeholder="Description" 
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="bg-black/40 border-white/5 h-11 text-white"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input 
                    type="number" 
                    placeholder="Qty" 
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="bg-black/40 border-white/5 h-11 text-white"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input 
                    type="number" 
                    placeholder="Rate" 
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    className="bg-black/40 border-white/5 h-11 text-white"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                   <div className="h-11 flex items-center px-4 bg-primary/10 rounded-lg text-primary font-bold text-sm">
                      R{(item.quantity * item.rate).toLocaleString()}
                   </div>
                </div>
                <div className="col-span-12 md:col-span-1 flex justify-end">
                   <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-11 w-11 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                   >
                     <Trash2 size={18} />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Quote Notes & Terms</h3>
          <Textarea 
            placeholder="Tell your client about this estimate, special terms, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px] bg-black/40 border-white/5 rounded-2xl text-white p-6 placeholder:text-white/10"
          />
        </Card>
      </div>

      <div className="space-y-8">
        {/* Settings Card */}
        <Card className="bg-[#0b0b15] border-white/5 p-6 rounded-3xl">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Quote Settings</h3>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Valid Until</label>
                <div className="relative">
                   <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                   <Input 
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="pl-10 bg-black/40 border-white/5 h-11 text-white text-xs" 
                   />
                </div>
             </div>
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="bg-primary/5 border-primary/10 p-6 rounded-3xl">
           <div className="flex items-center gap-3 mb-6">
              <Calculator size={18} className="text-primary" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Summary</h3>
           </div>
           
           <div className="space-y-3 mb-8">
              <div className="flex justify-between text-xs">
                 <span className="text-white/40 font-bold uppercase">Subtotal</span>
                 <span className="text-white font-black">R{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                 <span className="text-white/40 font-bold uppercase">Tax (15%)</span>
                 <span className="text-white font-black">R{taxTotal.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total</span>
                 <span className="text-2xl font-black text-white tracking-tight">R{total.toLocaleString()}</span>
              </div>
           </div>

           <div className="space-y-3">
              <Button 
                className="w-full h-14 !bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black uppercase tracking-[0.2em] rounded-2xl gap-3 shadow-xl shadow-[#6c47ff]/20 transition-all border-none"
                onClick={() => handleSave('sent')}
                disabled={isSubmitting}
              >
                <Send size={18} strokeWidth={3} /> Send Quote
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleSave('draft')}
                disabled={isSubmitting}
                className="w-full h-12 text-white/40 hover:text-white hover:bg-white/5 rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2"
              >
                <Save size={14} /> Save Draft
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
}
