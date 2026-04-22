"use client";

import React from 'react';
import { BuilderEditor } from '@/components/builder/BuilderEditor';

export default function EditorPage({ params }: { params: { type: string, id: string } }) {
  const type = params.type as 'website' | 'funnel';
  
  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <BuilderEditor type={type} />
    </div>
  );
}

