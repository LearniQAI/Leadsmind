'use client';

import React from 'react';

interface BrandingPreviewProps {
  primaryColor: string;
  platformName: string;
  logoUrl: string | null;
}

export function BrandingPreview({ primaryColor, platformName, logoUrl }: BrandingPreviewProps) {
  return (
    <div className="space-y-4">
      <Label className="text-xs font-bold text-white/50 uppercase tracking-widest">Live Preview</Label>
      <div className="rounded-2xl border border-white/5 bg-[#0b0b10] overflow-hidden shadow-2xl">
        {/* Mock Sidebar */}
        <div className="flex h-64">
          <div className="w-1/3 border-r border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <div 
                className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {logoUrl ? <img src={logoUrl} className="h-full w-full object-cover rounded-lg" alt="Logo" /> : platformName.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-[11px] font-bold text-white truncate">{platformName}</span>
            </div>
            <div className="p-2 space-y-1">
              {['Dashboard', 'Contacts', 'Pipelines'].map((item, i) => (
                <div 
                  key={item} 
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-medium ${i === 0 ? 'text-white bg-white/5' : 'text-white/30'}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Mock Content */}
          <div className="flex-1 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-white/5 rounded" />
              <div 
                className="h-7 w-20 rounded-lg"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-white/3 rounded-xl border border-white/5" />
              <div className="h-16 bg-white/3 rounded-xl border border-white/5" />
            </div>
            <div className="h-24 bg-white/3 rounded-xl border border-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Label } from '@/components/ui/label';
