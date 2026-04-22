'use client';

import { useState } from 'react';
import { Form, FormField } from '@/types/forms.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitForm } from '@/app/actions/forms';
import { toast } from 'sonner';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

interface PublicFormProps {
  form: Form;
}

export function PublicForm({ form }: PublicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitForm(form.id, formData, {
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });

      if (result.success) {
        setIsSuccess(true);
        if (result.settings.successAction === 'redirect' && result.settings.redirectUrl) {
          window.location.href = result.settings.redirectUrl;
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-500/5">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
          Submission Successful
        </h2>
        <p className="text-white/40 max-w-sm mx-auto">
          {form.settings.successMessage || 'Thank you for your response. We have received your data.'}
        </p>
        <div className="mt-10">
           <Button 
            variant="ghost" 
            className="text-[#6c47ff] hover:bg-[#6c47ff]/5"
            onClick={() => setIsSuccess(false)}
           >
             Submit another response
           </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="space-y-2 mb-12">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">
          {form.name}
        </h1>
        <div className="h-1 w-12 bg-[#6c47ff] rounded-full" />
      </div>

      <div className="space-y-8">
        {form.fields.map((field) => (
          <div key={field.id} className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/30 ml-1">
              {field.label}
              {field.required && <span className="text-red-400 ml-1 font-bold">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <Textarea 
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="bg-white/[0.03] border-white/5 text-white rounded-2xl min-h-[120px] focus:ring-[#6c47ff] focus:border-[#6c47ff] placeholder:text-white/10"
              />
            ) : field.type === 'dropdown' ? (
              <select 
                required={field.required}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full h-14 bg-white/[0.03] border border-white/5 text-white rounded-2xl px-4 focus:ring-[#6c47ff] focus:border-[#6c47ff] appearance-none cursor-pointer outline-none"
              >
                <option value="" disabled>{field.placeholder || 'Select an option'}</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <Input 
                type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="h-14 bg-white/[0.03] border-white/5 text-white rounded-2xl focus:ring-[#6c47ff] focus:border-[#6c47ff] placeholder:text-white/10"
              />
            )}
            
            {field.helpText && (
              <p className="text-[10px] text-white/20 italic ml-1">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-16 bg-[#6c47ff] hover:bg-[#8b5cf6] text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_4px_30px_rgba(108,71,255,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] group"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              {form.settings.buttonLabel || 'Submit Response'}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
