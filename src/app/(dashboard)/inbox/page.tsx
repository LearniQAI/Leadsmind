'use client';

import { InboxIcon } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-center animate-in fade-in duration-500">
      <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
        <InboxIcon className="h-10 w-10 text-white/20" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Inbox</h3>
      <p className="text-sm font-medium text-white/30 max-w-sm leading-relaxed">
        Your unified inbox is coming soon.
      </p>
    </div>
  );
}
