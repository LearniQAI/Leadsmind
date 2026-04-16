'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { createContact, updateContact } from '@/app/actions/contacts';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Contact } from '@/types/crm.types';

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
  ownerId: z.string().optional(),
  tags: z.string().optional(), // Will split by comma
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialData?: Contact;
  members: { id: string; name: string }[];
}

export function ContactForm({ initialData, members }: ContactFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: initialData?.first_name || '',
      lastName: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      source: initialData?.source || '',
      ownerId: initialData?.owner_id || '',
      tags: initialData?.tags?.join(', ') || '',
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setIsPending(true);
    const tagsArray = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    const payload = {
        ...values,
        tags: tagsArray,
        email: values.email || undefined
    };

    try {
      let result;
      if (initialData) {
        result = await updateContact(initialData.id, payload);
      } else {
        result = await createContact(payload);
      }

      if (result.success) {
        toast.success(initialData ? 'Contact updated' : 'Contact created');
        router.push('/contacts');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-white/60">First Name</Label>
          <Input 
            id="firstName" 
            {...form.register('firstName')} 
            placeholder="John"
            className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl"
          />
          {form.formState.errors.firstName && (
            <p className="text-xs text-red-400">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-white/60">Last Name</Label>
          <Input 
            id="lastName" 
            {...form.register('lastName')} 
            placeholder="Doe"
            className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl"
          />
          {form.formState.errors.lastName && (
            <p className="text-xs text-red-400">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/60">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            {...form.register('email')} 
            placeholder="john@example.com"
            className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/60">Phone Number</Label>
          <Input 
            id="phone" 
            {...form.register('phone')} 
            placeholder="+1 (555) 000-0000"
            className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="source" className="text-white/60">Source (Optional)</Label>
          <Controller
            name="source"
            control={form.control}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <SelectTrigger className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerId" className="text-white/60">Assigned Owner</Label>
          <Controller
            name="ownerId"
            control={form.control}
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <SelectTrigger className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags" className="text-white/60">Tags (comma separated)</Label>
        <Input 
          id="tags" 
          {...form.register('tags')} 
          placeholder="Lead, Retail, High Intensity"
          className="bg-[#0b0b10] border-white/5 text-white h-11 rounded-xl"
        />
        <p className="text-[10px] text-white/20">Press comma or enter to separate tags</p>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          className="text-white/40 hover:text-white hover:bg-white/5 h-12 px-6 rounded-xl font-bold"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-[#6c47ff]/20"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : initialData ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}
