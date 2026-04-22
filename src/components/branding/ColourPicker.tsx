'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColourPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColourPicker({ value, onChange }: ColourPickerProps) {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Primary Brand Colour</Label>
      <div className="flex items-center gap-4">
        <div 
          className="h-10 w-10 rounded-lg border border-white/10 shrink-0" 
          style={{ backgroundColor: value }}
        />
        <Input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/5 border-white/10 text-white"
          placeholder="#6c47ff"
        />
        <Input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 p-1 bg-white/5 border-white/10 cursor-pointer"
        />
      </div>
    </div>
  );
}
