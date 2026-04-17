"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ChevronRight } from 'lucide-react';

interface PublicFormRendererProps {
  formId: string;
  workspaceId: string;
  fields: any[];
  buttonText?: string;
  successMessage?: string;
  redirectUrl?: string;
}

export default function PublicFormRenderer({ 
  formId, 
  workspaceId, 
  fields, 
  buttonText = "Submit", 
  successMessage = "Success!",
  redirectUrl
}: PublicFormRendererProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Internal Lead Ingestion API
    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          workspaceId,
          formId,
          source_type: 'direct_link'
        })
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success(successMessage);
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Submission failed");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
         <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
         </div>
         <h2 className="text-xl font-bold text-white mb-2 italic uppercase tracking-tight">{successMessage}</h2>
         <p className="text-sm text-white/40 font-medium">Your information has been received securely.</p>
         {redirectUrl && (
           <p className="text-[10px] text-white/20 mt-8 animate-pulse italic uppercase tracking-widest">
             Redirecting in a moment...
           </p>
         )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field, idx) => (
        <div key={idx} className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pl-1">{field.label}</Label>
          <Input 
            name={field.name}
            type={field.type}
            required={field.required}
            className="h-12 bg-white/[0.03] border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm rounded-xl transition-all placeholder:text-white/10"
            placeholder={field.label}
          />
        </div>
      ))}

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/20 gap-2 mt-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>{buttonText}</span>
            <ChevronRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
