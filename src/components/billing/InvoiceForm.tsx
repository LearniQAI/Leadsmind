"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Send, UserPlus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRecentClients, createInvoice } from "@/app/actions/invoice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  tax: number;
  discount: number;
}

export function InvoiceForm({ workspaceId, initialData }: { workspaceId: string, initialData?: any }) {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, tax: 15, discount: 0 }
  ]);
  const [notes, setNotes] = useState("");
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
      await createInvoice(workspaceId, {
        contact_id: selectedClientId,
        items,
        subtotal,
        tax_total: taxTotal,
        total_amount: total,
        status,
        notes,
        currency: 'ZAR'
      });
      toast.success(`Invoice ${status === 'open' ? 'sent' : 'saved'} successfully!`);
      router.push("/invoice/invoices");
    } catch (error) {
      toast.error("Failed to save invoice");
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
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Client Recipient</h3>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="pb-4 w-1/2">Description</th>
                  <th className="pb-4 px-4 text-center">Qty</th>
                  <th className="pb-4 px-4 text-center">Rate</th>
                  <th className="pb-4 px-4 text-center">Tax %</th>
                  <th className="pb-4 pl-4 text-right">Amount</th>
                  <th className="pb-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-6">
                      <Input 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Service or product description..."
                        className="bg-transparent border-transparent focus:border-primary/30 h-10 px-0"
                      />
                    </td>
                    <td className="py-6 px-4">
                       <Input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-black/20 border-white/10 h-10 w-20 text-center mx-auto"
                      />
                    </td>
                    <td className="py-6 px-4">
                       <Input 
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="bg-black/20 border-white/10 h-10 w-28 text-center mx-auto"
                      />
                    </td>
                    <td className="py-6 px-4">
                       <Input 
                        type="number"
                        value={item.tax}
                        onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                        className="bg-black/20 border-white/10 h-10 w-20 text-center mx-auto"
                      />
                    </td>
                    <td className="py-6 pl-4 text-right">
                       <span className="text-sm font-bold text-white">
                         R{(item.rate * item.quantity).toLocaleString()}
                       </span>
                    </td>
                    <td className="py-6 text-right">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => removeItem(item.id)}
                         className="h-8 w-8 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <Trash2 size={14} />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={addItem}
            className="mt-6 w-full h-12 border border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 text-white/60 hover:text-white rounded-xl gap-2 font-bold uppercase text-[10px] tracking-widest transition-all"
          >
            <Plus size={16} /> Add Line Item
          </Button>
        </Card>

        {/* Notes */}
        <Card className="bg-[#0b0b15] border-white/5 p-8 rounded-3xl">
           <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 block">Internal Notes / Terms</label>
           <Textarea 
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Notes to be displayed on the invoice..."
             className="bg-black/40 border-white/10 rounded-2xl min-h-[120px] focus:border-primary/50"
           />
        </Card>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-b from-[#0b0b15] to-[#050510] border-white/5 p-8 rounded-[2.5rem] sticky top-8">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                 <Calculator size={18} />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Pricing Model</h3>
           </div>

           <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">Subtotal</span>
                <span className="text-sm font-bold text-white">R{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">VAT (15%)</span>
                <span className="text-sm font-bold text-emerald-400">R{taxTotal.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5 mx--2" />
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-black text-white uppercase tracking-tight">Total Amount</span>
                <span className="text-2xl font-black text-primary">R{total.toLocaleString()}</span>
              </div>
           </div>

           <div className="space-y-3">
              <Button 
                className="w-full h-14 !bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black uppercase tracking-[0.2em] rounded-2xl gap-3 shadow-xl shadow-[#6c47ff]/20 transition-all border-none"
                onClick={() => handleSave('open')}
                disabled={isSubmitting}
              >
                <Send size={18} strokeWidth={3} /> Send Invoice
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 text-white/60 hover:text-white hover:bg-white/5 border border-white/5 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all"
                onClick={() => handleSave('draft')}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
           </div>
           
           <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic">
              <p className="text-[10px] text-amber-500/60 leading-relaxed text-center">
                This invoice will be sent from <strong>billing@leadsmind.io</strong> using the Minimal template.
              </p>
           </div>
        </Card>
      </div>
    </div>
  );
}
