'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { saveInvoice } from '@/app/actions/finance';
import { toast } from 'sonner';
import { Plus, Receipt } from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface InvoiceModalProps {
  workspaceId: string;
  contacts: Contact[];
}

export function InvoiceModal({ workspaceId, contacts }: InvoiceModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [defaultDate, setDefaultDate] = useState('');

  useEffect(() => {
    // Set default date to 7 days from now (Client-only to avoid hydration mismatch)
    const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDefaultDate(date);
  }, [open]);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const invoiceData = {
      workspace_id: workspaceId,
      contact_id: formData.get('contactId') as string,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      status: 'draft',
      subtotal: amount,
      total_amount: amount,
      currency: 'USD',
      due_date: new Date(formData.get('dueDate') as string).toISOString(),
    };

    const items = [{
      description: 'Consultation / Service Fee',
      quantity: 1,
      unit_price: amount,
      total_amount: amount,
      position: 0
    }];

    try {
      await saveInvoice(invoiceData, items);
      toast.success('Invoice generated successfully');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2 rounded-xl h-9 text-xs font-bold">
          <Receipt className="h-4 w-4 text-[#6c47ff]" />
          Create Invoice
        </Button>
      } />
      <DialogContent className="bg-[#0b0b10] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Generate New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="contactId">Select Student / Client</Label>
            <Select name="contactId" required>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Search contacts..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                {contacts.length === 0 ? (
                  <div className="p-2 text-center text-xs text-white/30">No contacts found. Create one in the Contacts tab first.</div>
                ) : (
                  contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} ({contact.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Due (USD)</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                placeholder="150.00" 
                required 
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                name="dueDate" 
                type="date" 
                required 
                className="bg-white/5 border-white/10 invert dark:invert-0"
                defaultValue={defaultDate}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || contacts.length === 0}
              className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white"
            >
              {loading ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
