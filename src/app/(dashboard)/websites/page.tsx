"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Globe, MoreVertical, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createWebsite } from '@/app/actions/builder';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('websites')
      .select('*, workspace:workspaces!inner(slug)')
      .order('created_at', { ascending: false });
    
    if (data) setWebsites(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    setCreating(true);
    const result = await createWebsite('New Website', `site-${Math.random().toString(36).substr(2, 5)}`);
    if (result.success) {
      router.push(`/editor/website/${result.websiteId}`);
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Websites</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your multi-page websites and online presence.</p>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="rounded-xl bg-[#6c47ff] hover:bg-[#6c47ff]/90">
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          New Website
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites.map((site) => (
          <Card key={site.id} className="overflow-hidden border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group font-sans">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Globe className="w-5 h-5" />
                    </div>
                </div>
                <CardTitle className="mt-4 text-white">{site.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                    {site.subdomain}.leadsmind.ai
                </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4 border-t border-white/5 flex gap-2">
                <Link href={`/editor/website/${site.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-xs font-bold rounded-lg border-white/5 hover:bg-white/5">
                        Edit Site
                    </Button>
                </Link>
                <Link href={`/p/${site.workspace?.slug}/${site.subdomain}`} target="_blank">
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
            <span className="font-semibold text-sm">Create Website</span>
        </button>
      </div>
    </div>
  );
}
