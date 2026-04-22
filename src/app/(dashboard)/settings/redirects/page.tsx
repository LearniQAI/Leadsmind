"use client";

import React from 'react';
import { Plus, Trash2, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RedirectsPage() {
  const [redirects, setRedirects] = React.useState([
    { id: '1', source_path: '/old-offer', target_url: '/p/main/new-offer', status_code: 301, is_active: true },
    { id: '2', source_path: '/instagram', target_url: '/p/main/bio', status_code: 302, is_active: true },
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">URL Redirects</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage 301 and 302 mappings for your custom domains.</p>
        </div>
        <Button className="rounded-xl bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Redirect
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Redirects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {redirects.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Source</span>
                                <span className="font-mono text-sm">{r.source_path}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Target</span>
                                <span className="font-mono text-sm">{r.target_url}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-[10px] font-bold">{r.status_code}</Badge>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                
                {redirects.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground italic">
                        No redirects configured yet.
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex gap-4 items-start">
                <div className="p-2 bg-primary/20 rounded-lg text-primary shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm">Pro Tip: SEO Integrity</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Use **301 Redirects** for permanent moves to preserve your Google ranking. 
                        Use **302 Redirects** for temporary campaigns or seasonal shifts.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
