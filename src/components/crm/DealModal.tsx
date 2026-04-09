'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { createDeal, updateDeal } from '@/app/actions/pipelines';
import { toast } from 'sonner';
import { Opportunity } from '@/types/crm.types';

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  status: z.enum(['open', 'won', 'lost']),
  contactId: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Opportunity;
  stageId?: string;
  contacts?: { id: string; name: string }[];
}

export function DealModal({ isOpen, onClose, initialData, stageId, contacts }: DealModalProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: initialData?.title || '',
      value: initialData?.value || 0,
      status: (initialData?.status as 'open' | 'won' | 'lost') || 'open',
      contactId: initialData?.contact_id || null,
    },
  });

  async function onSubmit(values: DealFormValues) {
    if (!stageId && !initialData) {
      toast.error('Missing stage information');
      return;
    }

    setIsPending(true);
    try {
      let result;
      if (initialData) {
        result = await updateDeal(initialData.id, values);
      } else if (stageId) {
        result = await createDeal({
          ...values,
          stageId,
        });
      }

      if (result?.success) {
        toast.success(initialData ? 'Deal updated' : 'Deal created');
        onClose();
        form.reset();
      } else {
        toast.error(result?.error || 'Operation failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0b0b10] border-white/5 text-white max-w-md rounded-3xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-extrabold text-white">
            {initialData ? 'Edit Deal' : 'New Deal'}
          </DialogTitle>
          <DialogDescription className="text-white/40 font-medium">
            {initialData ? 'Update deal details' : 'Add a new opportunity to this stage'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/60">Deal Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Enterprise License Plan"
              className="bg-white/3 border-white/5 text-white h-11 rounded-xl"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-white/60">Value ($)</Label>
              <Input
                id="value"
                type="number"
                {...form.register('value')}
                className="bg-white/3 border-white/5 text-white h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white/60">Status</Label>
              <Select 
                defaultValue={form.getValues('status')}
                onValueChange={(v: 'open' | 'won' | 'lost') => {
                  form.setValue('status', v);
                }}
              >
                <SelectTrigger className="bg-white/3 border-white/5 text-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-white/60">Linked Contact (Optional)</Label>
            <Select 
              onValueChange={(v: string | null) => form.setValue('contactId', v || undefined)}
            >
              <SelectTrigger className="bg-white/3 border-white/5 text-white h-11 rounded-xl">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                {contacts?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/40 hover:text-white hover:bg-white/5 h-11 px-6 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 px-8 rounded-xl font-bold shadow-lg shadow-[#6c47ff]/20"
            >
              {isPending ? 'Saving...' : initialData ? 'Update Deal' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
