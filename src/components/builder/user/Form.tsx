"use client";

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSettings } from './FormSettings';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'checkbox' | 'select' | 'radio' | 'date';
  label: string;
  placeholder: string;
  required: boolean;
  mapping?: 'email' | 'first_name' | 'last_name' | 'phone' | 'custom';
  options?: string[];
}

export interface FormProps {
  fields: FormField[];
  buttonText: string;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  gap: number;
  labelColor: string;
  inputBg: string;
  inputBorderColor: string;
  inputTextColor: string;
  buttonBg: string;
  buttonTextColor: string;
  // Post-submit actions
  onSuccess: 'message' | 'redirect';
  successMessage: string;
  redirectLink: any;
}


export const Form = ({ 
    fields, 
    buttonText, 
    backgroundColor, 
    borderRadius, 
    padding, 
    gap,
    labelColor,
    inputBg,
    inputBorderColor,
    inputTextColor,
    buttonBg,
    buttonTextColor,
    ...props 
}: FormProps & any) => {
  const { connectors: { connect, drag } } = useNode();
  
  return (
    <div
      ref={(ref) => {
        if (ref) {
            connect(ref);
            drag(ref);
        }
      }}
      className="transition-all outline-dashed outline-1 outline-transparent hover:outline-blue-500/50"
      style={{
          backgroundColor,
          borderRadius: `${borderRadius}px`,
          padding: `${padding}px`,
      }}
    >
      <form 
        className="flex flex-col" 
        style={{ gap: `${gap}px` }}
        onSubmit={(e) => e.preventDefault()}
    >
        {fields.map((field: FormField) => (
          <div key={field.id} className="space-y-1.5">
            {field.type === 'checkbox' ? (
                 <div className="flex items-center gap-2 py-1">
                    <input type="checkbox" id={field.id} required={field.required} className="w-4 h-4 rounded accent-primary bg-muted border-white/10" />
                    <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer" style={{ color: labelColor }}>{field.label}</Label>
                 </div>
            ) : field.type === 'radio' ? (
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tight" style={{ color: labelColor }}>{field.label}</Label>
                    <div className="flex flex-col gap-2">
                        {(field.options || ['Option 1']).map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input type="radio" name={field.id} id={`${field.id}-${i}`} className="w-4 h-4 accent-primary" />
                                <Label htmlFor={`${field.id}-${i}`} className="text-sm cursor-pointer" style={{ color: labelColor }}>{opt}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <Label className="text-xs font-bold uppercase tracking-tight" style={{ color: labelColor }}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                        <textarea 
                            className="flex min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                            placeholder={field.placeholder}
                            style={{ backgroundColor: inputBg, borderColor: inputBorderColor, color: inputTextColor }}
                        />
                    ) : field.type === 'select' ? (
                        <select 
                            className="flex h-10 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            style={{ backgroundColor: inputBg, borderColor: inputBorderColor, color: inputTextColor }}
                        >
                            {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <Input 
                            type={field.type} 
                            placeholder={field.placeholder} 
                            required={field.required}
                            className="rounded-lg h-10 transition-all border focus:ring-primary"
                            style={{ backgroundColor: inputBg, borderColor: inputBorderColor, color: inputTextColor }}
                        />
                    )}
                </>
            )}
          </div>
        ))}
        <Button 
            className="w-full rounded-lg h-12 font-bold shadow-lg hover:scale-[1.01] transition-all"
            style={{ backgroundColor: buttonBg, color: buttonTextColor }}
        >
          {buttonText || 'Submit'}
        </Button>
      </form>
    </div>
  );
};

Form.craft = {
  displayName: 'Contact Form',
  props: {
    fields: [
      { id: '1', type: 'text', label: 'Name', placeholder: 'Enter your name', required: true, mapping: 'first_name' },
      { id: '2', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true, mapping: 'email' },
    ],
    buttonText: 'Submit Information',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    gap: 16,
    labelColor: '#374151',
    inputBg: '#f9fafb',
    inputBorderColor: '#e5e7eb',
    inputTextColor: '#111827',
    buttonBg: '#6c47ff',
    buttonTextColor: '#ffffff',
    onSuccess: 'message',
    successMessage: 'Thank you! We have received your information.',
    redirectLink: { type: 'url', value: '' }
  },

  related: {
    settings: FormSettings,
  },
  rules: {
    canDrag: () => true,
  },
};
