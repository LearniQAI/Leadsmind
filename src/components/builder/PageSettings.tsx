"use client";

import React from 'react';
import { useBuilder } from './BuilderContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, Image, Globe, Sparkles } from 'lucide-react';
import { updatePageSettings } from '@/app/actions/builder';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

export const PageSettings = () => {
    const { pageId } = useParams();
    const [loading, setLoading] = React.useState(false);
    const [settings, setSettings] = React.useState({
        name: '',
        seo_title: '',
        seo_description: '',
        og_image_url: '',
    });

    React.useEffect(() => {
        async function loadPageDetails() {
            if (!pageId) return;
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase
                .from('pages')
                .select('name, seo_title, seo_description, og_image_url')
                .eq('id', pageId)
                .single();
            
            if (data) {
                setSettings({
                    name: data.name || '',
                    seo_title: data.seo_title || '',
                    seo_description: data.seo_description || '',
                    og_image_url: data.og_image_url || '',
                });
            }
        }
        loadPageDetails();
    }, [pageId]);

    const handleSave = async () => {
        if (!pageId) return;
        setLoading(true);
        const result = await updatePageSettings(pageId as string, settings);
        setLoading(false);
        if (result.success) {
            toast.success("Page settings updated!");
        } else {
            toast.error("Failed to update settings");
        }
    };

    return (
        <div className="h-full flex flex-col pt-2 bg-card select-none">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#6c47ff]" />
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Page SEO & Social</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Meta Tags
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Display Name</Label>
                            <Input 
                                value={settings.name}
                                onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
                                className="h-9 bg-white/5 border-white/5 text-sm"
                                placeholder="Internal page name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">SEO Title</Label>
                            <Input 
                                value={settings.seo_title}
                                onChange={(e) => setSettings(s => ({ ...s, seo_title: e.target.value }))}
                                className="h-9 bg-white/5 border-white/5 text-sm"
                                placeholder="Page title in search results"
                            />
                            <p className="text-[9px] text-muted-foreground italic">Keep it under 60 characters for best results.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">Meta Description</Label>
                            <Textarea 
                                value={settings.seo_description}
                                onChange={(e) => setSettings(s => ({ ...s, seo_description: e.target.value }))}
                                className="bg-white/5 border-white/5 text-sm min-h-[100px]"
                                placeholder="Briefly describe what this page is about..."
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Image className="w-3 h-3" /> Social Preview (OG)
                    </h3>
                    <div className="space-y-4">
                        <div className="aspect-[1200/630] w-full rounded-xl border border-white/10 bg-white/5 overflow-hidden relative group">
                            {settings.og_image_url ? (
                                <img src={settings.og_image_url} alt="OG Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
                                    <Image size={32} />
                                    <span className="text-[10px] font-bold">No Image Set</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-tight">OG Image URL</Label>
                            <div className="flex gap-2">
                                <Input 
                                    value={settings.og_image_url}
                                    onChange={(e) => setSettings(s => ({ ...s, og_image_url: e.target.value }))}
                                    className="h-9 bg-white/5 border-white/5 text-xs"
                                    placeholder="https://..."
                                />
                                <Button size="icon" variant="secondary" className="h-9 w-9 bg-[#6c47ff]/10 text-primary border border-[#6c47ff]/20">
                                    <Sparkles size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-[10px] text-primary font-medium leading-relaxed">
                        Tip: Good SEO helps your site rank higher on Google. Don't forget to add a high-quality OG image for social sharing!
                    </p>
                </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <Button 
                    disabled={loading}
                    onClick={handleSave}
                    className="w-full bg-[#6c47ff] hover:bg-[#6c47ff]/90 text-white font-bold h-10 shadow-lg shadow-[#6c47ff]/20"
                >
                    {loading ? "SAVING..." : "SAVE PAGE SETTINGS"}
                </Button>
            </div>
        </div>
    );
};
