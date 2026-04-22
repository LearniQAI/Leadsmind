"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="space-y-6 max-w-md">
                <div className="relative inline-block">
                    <h1 className="text-9xl font-black text-white/5 select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#6c47ff] rotate-12 flex items-center justify-center shadow-2xl shadow-[#6c47ff]/40">
                             <Search className="w-8 h-8 text-white -rotate-12" />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Lost in Space?</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        The page you are looking for has either moved or never existed. Don't worry, even the best astronauts lose their way sometimes.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button 
                        onClick={() => router.back()}
                        variant="outline" 
                        className="border-white/10 hover:bg-white/5 px-8 font-bold h-12 uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" /> Go Back
                    </Button>
                    <Button 
                        onClick={() => router.push('/')}
                        className="bg-[#6c47ff] hover:bg-[#6c47ff]/90 px-8 font-bold h-12 uppercase tracking-widest text-[10px] shadow-lg shadow-[#6c47ff]/20"
                    >
                        <Home className="w-3 h-3 mr-2" /> Homepage
                    </Button>
                </div>
            </div>

            <div className="fixed bottom-8 left-0 w-full flex justify-center opacity-30">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-black text-[10px]">L</div>
                    <span className="text-[10px] font-bold tracking-tighter uppercase">Powered by Leadsmind</span>
                </div>
            </div>
        </div>
    );
}

import { Search } from 'lucide-react';
