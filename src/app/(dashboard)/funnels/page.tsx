"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Filter, MoreVertical, Layers, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createFunnel } from '@/app/actions/builder';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchFunnels();
  }, []);

  const fetchFunnels = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('funnels')
      .select('*, workspace:workspaces!inner(slug), steps:funnel_steps(path_name)')
      .order('created_at', { ascending: false });
    
    if (data) setFunnels(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    const result = await createFunnel('New Sales Funnel');
    if (result.success) {
      router.push(`/editor/funnel/${result.funnelId}`);
    } else {
      setCreating(false);
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-white font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Funnels</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create high-converting sales and lead generation funnels.</p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="rounded-xl bg-[#6c47ff] hover:bg-[#6c47ff]/90">
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          New Funnel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funnels.map((funnel) => (
          <Card key={funnel.id} className="overflow-hidden border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group font-sans">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Filter className="w-5 h-5" />
                </div>
              </div>
              <CardTitle className="mt-4 text-white uppercase tracking-tight">{funnel.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Layers className="w-3 h-3" /> {funnel.steps?.length || 0} Steps
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4 border-t border-white/5 flex gap-2">
              <Link href={`/editor/funnel/${funnel.id}`} className="flex-1">
                <Button variant="outline" className="w-full text-xs font-bold rounded-lg border-white/5 hover:bg-white/5">
                  Manage Steps
                </Button>
              </Link>
              <Link href={`/p/${funnel.workspace?.slug}/${funnel.steps?.[0]?.path_name?.replace(/^\//, '') || ''}`} target="_blank">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-lg">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="border-2 border-dashed border-white/5 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all group"
        >
          <div className="p-3 rounded-full bg-white/5 group-hover:bg-primary/10">
            {creating ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Plus className="w-6 h-6" />}
          </div>
          <span className="font-semibold text-sm">Create Funnel</span>
        </button>
      </div>
    </div>
  );
}
