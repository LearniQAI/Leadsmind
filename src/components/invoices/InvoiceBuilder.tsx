"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Contact, 
  InvoiceItem, 
  InvoiceSettings, 
  Invoice 
} from "@/types/crm.types";
import { 
  Plus, 
  Trash2, 
  Search, 
  User, 
  Calendar, 
  Hash, 
  Receipt,
  Tag,
  Settings,
  ChevronDown,
  Layout,
  Calculator,
  Save,
  Send,
  ArrowRight,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { saveInvoice } from "@/app/actions/finance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InvoiceBuilderProps {
  workspaceId: string;
  contacts: Contact[];
  products: any[];
  settings: InvoiceSettings;
  initialData?: Partial<Invoice>;
}

export function InvoiceBuilder({ workspaceId, contacts, products, settings, initialData }: InvoiceBuilderProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    contacts.find(c => c.id === initialData?.contact_id) || null
  );
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoice_number || `${settings.invoice_prefix}${settings.next_invoice_number}`
  );
  const [dueDate, setDueDate] = useState<string>(
    initialData?.due_date || format(new Date().setDate(new Date().getDate() + 14), 'yyyy-MM-dd')
  );
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    initialData?.items || [{ description: "", quantity: 1, unit_price: 0, tax_rate: 15, discount_amount: 0, position: 0 }]
  );
  const [notes, setNotes] = useState(initialData?.notes || settings.default_notes || "");
  const [terms, setTerms] = useState(initialData?.terms || settings.default_terms || "");
  const [shipping, setShipping] = useState(initialData?.shipping_amount || 0);

  // Calculations
  const subtotal = useMemo(() => 
    items.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0)
  , [items]);

  const taxTotal = useMemo(() => 
    items.reduce((acc, item) => acc + ((Number(item.quantity || 0) * Number(item.unit_price || 0)) * (Number(item.tax_rate || 0) / 100)), 0)
  , [items]);

  const discountTotal = useMemo(() => 
    items.reduce((acc, item) => acc + Number(item.discount_amount || 0), 0)
  , [items]);

  const totalAmount = subtotal + taxTotal + Number(shipping) - discountTotal;

  // Handlers
  const handleSave = async (status: 'draft' | 'open' = 'open') => {
    if (!selectedContact) {
      toast.error("Please select a recipient");
      return;
    }

    setIsSaving(true);
    try {
      const invoiceData = {
        workspace_id: workspaceId,
        contact_id: selectedContact.id,
        invoice_number: invoiceNumber,
        status,
        subtotal,
        tax_total: taxTotal,
        discount_total: discountTotal,
        shipping_amount: shipping,
        total_amount: totalAmount,
        currency: initialData?.currency || "USD",
        due_date: new Date(dueDate).toISOString(),
        notes,
        terms,
      };

      await saveInvoice(invoiceData, items);
      toast.success(status === 'open' ? "Invoice sent successfully" : "Draft saved");
      router.push('/invoices');
    } catch (err: any) {
      toast.error(err.message || "Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, tax_rate: 15, discount_amount: 0, position: items.length }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, patch: Partial<InvoiceItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...patch };
    setItems(newItems);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-24">
      {/* Main Editor */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-[#080812] border border-white/5 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] p-8 md:p-12 space-y-12">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between gap-8 pt-4">
             <div className="space-y-6">
                <div className="h-20 w-48 bg-white/5 rounded-3xl flex items-center justify-center border border-dashed border-white/10 group cursor-pointer hover:bg-white/[0.07] transition-all">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Company Logo" className="max-h-12" />
                  ) : (
                    <div className="text-center">
                       <Layout size={24} className="mx-auto text-white/20 group-hover:text-[#6c47ff] transition-all" />
                       <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mt-2">Upload Logo</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">From</p>
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-white leading-none">Your Business Name</p>
                      <p className="text-xs text-white/40">{settings.company_address || "Set address in settings"}</p>
                      <p className="text-xs text-white/40">{settings.company_email}</p>
                   </div>
                </div>
             </div>

             <div className="text-right space-y-6 min-w-[240px]">
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter opacity-10 leading-none">Invoice</h1>
                <div className="space-y-4">
                   <div className="flex items-center justify-end gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Invoice #</p>
                      <Input 
                        value={invoiceNumber} 
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-32 h-10 bg-white/5 border-white/10 text-white text-right font-black uppercase tracking-widest rounded-xl focus:ring-[#6c47ff]" 
                      />
                   </div>
                   <div className="flex items-center justify-end gap-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Due Date</p>
                      <Input 
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-40 h-10 bg-white/5 border-white/10 text-white text-right text-xs font-bold rounded-xl focus:ring-[#6c47ff]" 
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Recipient Selection */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">Bill To</p>
                {!selectedContact && <span className="text-[9px] font-bold text-rose-500 uppercase animate-pulse">Required</span>}
             </div>
             
             {selectedContact ? (
               <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-[#6c47ff]/10 flex items-center justify-center text-[#6c47ff] font-black text-lg border border-[#6c47ff]/20">
                        {selectedContact.first_name[0]}{selectedContact.last_name[0]}
                     </div>
                     <div>
                        <p className="text-base font-bold text-white">{selectedContact.first_name} {selectedContact.last_name}</p>
                        <p className="text-sm text-white/40">{selectedContact.email}</p>
                     </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedContact(null)}
                    className="text-[10px] font-bold text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 uppercase tracking-widest rounded-xl"
                  >
                    Change Recipient
                  </Button>
               </div>
             ) : (
               <Popover>
                 <PopoverTrigger asChild>
                    <button className="w-full h-16 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center gap-2 text-white/30 hover:border-[#6c47ff]/50 hover:bg-white/[0.07] transition-all">
                       <Search size={18} />
                       <span className="text-sm font-bold uppercase tracking-widest">Select CRM Contact</span>
                    </button>
                 </PopoverTrigger>
                 <PopoverContent className="w-96 bg-[#0b0b10] border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-3xl" align="start">
                    <div className="space-y-1">
                       {contacts.map(contact => (
                         <button 
                           key={contact.id}
                           onClick={() => setSelectedContact(contact)}
                           className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                         >
                           <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40 uppercase">
                              {contact.first_name[0]}{contact.last_name[0]}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-white tracking-tight">{contact.first_name} {contact.last_name}</p>
                              <p className="text-[10px] text-white/30">{contact.email}</p>
                           </div>
                         </button>
                       ))}
                    </div>
                 </PopoverContent>
               </Popover>
             )}
          </div>

          {/* Items Editor */}
          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">Line Items</p>
                <div className="flex gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">
                   <p className="w-24 text-center">Price</p>
                   <p className="w-16 text-center">Qty</p>
                   <p className="w-24 text-right">Total</p>
                   <div className="w-8"></div>
                </div>
             </div>

             <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="group relative flex items-start gap-4 bg-white/[0.03] hover:bg-white/[0.05] p-3 rounded-2xl transition-all border border-transparent hover:border-white/5">
                    <div className="flex-1 space-y-2">
                      <Input 
                        placeholder="Item description or service name..." 
                        value={item.description}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        className="bg-transparent border-none p-0 h-8 text-sm font-bold text-white placeholder:text-white/10 focus-visible:ring-0"
                      />
                      <div className="flex items-center gap-4 text-[10px] font-bold text-white/30">
                         <div className="flex items-center gap-1">
                            <Tag size={10} className="text-[#6c47ff]" />
                            <span>Tax: {item.tax_rate}%</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Package size={10} className="text-[#6c47ff]" />
                            <span>Product: N/A</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                        className="w-24 h-10 bg-white/5 border-white/5 text-center text-xs font-black rounded-xl" 
                      />
                      <Input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                        className="w-16 h-10 bg-white/5 border-white/5 text-center text-xs font-black rounded-xl" 
                      />
                      <div className="w-24 text-right">
                         <p className="text-sm font-black text-white tracking-tight">
                            ${(Number(item.quantity || 0) * Number(item.unit_price || 0)).toLocaleString()}
                         </p>
                      </div>
                      <button 
                        onClick={() => removeItem(index)}
                        className="h-10 w-10 flex items-center justify-center text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>

             <Button 
                onClick={addItem}
                variant="ghost" 
                className="w-full h-14 rounded-2xl border border-dashed border-white/5 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all font-bold gap-2"
              >
                <Plus size={18} />
                Add New Item
              </Button>
          </div>

          {/* Footer: Totals and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
             <div className="space-y-6">
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">Notes & Instructions</p>
                   <Textarea 
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="Notes shown to the client..."
                     className="min-h-[120px] bg-white/5 border-white/10 text-xs text-white/60 placeholder:text-white/10 rounded-2xl p-4 focus:ring-[#6c47ff]"
                   />
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c47ff]">Terms & Conditions</p>
                   <Textarea 
                     value={terms}
                     onChange={(e) => setTerms(e.target.value)}
                     placeholder="Legal terms, return policy, etc..."
                     className="min-h-[120px] bg-white/5 border-white/10 text-xs text-white/60 placeholder:text-white/10 rounded-2xl p-4 focus:ring-[#6c47ff]"
                   />
                </div>
             </div>

             <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Subtotal</p>
                      <p className="text-sm font-black text-white">${subtotal.toLocaleString()}</p>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Tax Total</p>
                      <p className="text-sm font-black text-white">${taxTotal.toLocaleString()}</p>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Shipping</p>
                        <Input 
                          type="number"
                          value={shipping}
                          onChange={(e) => setShipping(Number(e.target.value))}
                          className="w-20 h-8 bg-white/5 border-white/5 text-[10px] font-black text-center rounded-lg" 
                        />
                      </div>
                      <p className="text-sm font-black text-white">${shipping.toLocaleString()}</p>
                   </div>
                   {discountTotal > 0 && (
                     <div className="flex items-center justify-between text-rose-400">
                        <p className="text-xs font-bold uppercase tracking-widest">Discounts</p>
                        <p className="text-sm font-black">-${discountTotal.toLocaleString()}</p>
                     </div>
                   )}
                </div>

                <div className="pt-6 border-t border-white/5 mt-6">
                   <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-[#6c47ff] uppercase tracking-[0.2em]">Total Due</p>
                      <p className="text-4xl font-black text-white tracking-tighter">${totalAmount.toLocaleString()}</p>
                   </div>
                   <p className="text-right text-[10px] text-white/20 font-black uppercase tracking-widest mt-2">{settings.invoice_prefix} BALANCE IN {initialData?.currency || "USD"}</p>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Control Sidebar */}
      <div className="xl:col-span-4 space-y-6">
         <div className="bg-[#0b0b1a] border border-white/5 rounded-[40px] p-8 space-y-8 sticky top-24">
            <div className="space-y-3">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Publish Settings</h3>
               <p className="text-[11px] text-white/40 leading-relaxed">Once published, the invoice will be marked as 'Sent' and a notification will be triggered.</p>
            </div>

            <div className="space-y-4">
               <Button 
                onClick={() => handleSave('open')}
                disabled={isSaving || !selectedContact}
                className="w-full h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-2xl gap-3 font-black uppercase tracking-widest shadow-[0_16px_32px_-12px_rgba(108,71,255,0.5)] transition-all group"
               >
                  <Send size={18} className={cn("group-hover:translate-x-1 group-hover:-translate-y-1 transition-all", isSaving && "animate-pulse")} />
                  {isSaving ? "Processing..." : "Send to Client"}
               </Button>
               <Button 
                onClick={() => handleSave('draft')}
                disabled={isSaving || !selectedContact}
                variant="outline" 
                className="w-full h-14 border-white/10 bg-white/5 text-white rounded-2xl gap-3 font-black uppercase tracking-widest hover:bg-white/10 transition-all text-sm"
               >
                  <Save size={18} />
                  Save as Draft
               </Button>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-6">
               <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-all">
                        <Receipt size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Preview PDF</p>
                        <p className="text-[9px] text-white/30 uppercase">Compliance Layout</p>
                     </div>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:translate-x-1 transition-all" />
               </div>

               <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-all">
                        <Tag size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Tax Settings</p>
                        <p className="text-[9px] text-white/30 uppercase">SARS / VAT Enabled</p>
                     </div>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:translate-x-1 transition-all" />
               </div>

               <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10 group-hover:scale-110 transition-all">
                        <Settings size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Custom Fields</p>
                        <p className="text-[9px] text-white/30 uppercase">0/6 Enabled</p>
                     </div>
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:translate-x-1 transition-all" />
               </div>
            </div>

            <div className="pt-8 border-t border-white/10">
               <div className="bg-[#6c47ff]/10 border border-[#6c47ff]/20 rounded-2xl p-4 flex items-center gap-3">
                  <calculator className="text-[#6c47ff]" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-[#6c47ff] uppercase tracking-widest">Auto-Tax Calculation</p>
                    <p className="text-[9px] text-[#6c47ff]/60 uppercase">Applied to all line items</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
