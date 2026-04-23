"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Globe, MoreVertical, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createWebsite, duplicateWebsite, deleteWebsite, updateWebsiteSettings, getTemplates } from '@/app/actions/builder';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BUILDER_TEMPLATES } from '@/lib/builder/templates';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function WebsitesPage() {
    const [websites, setWebsites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSiteName, setNewSiteName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // Rename & Delete State
    const [renameSite, setRenameSite] = useState<any>(null);
    const [deleteSite, setDeleteSite] = useState<any>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [dbTemplates, setDbTemplates] = useState<any[]>([]);
    const [templateError, setTemplateError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchWebsites();
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setTemplateError(null);
        try {
            const templates = await getTemplates('website');
            setDbTemplates(templates);
            if (templates.length === 0) {
                // Optional: handle empty DB state
            }
        } catch (err: any) {
            console.error('Error fetching templates:', err);
            setTemplateError(err.message || 'Failed to load templates');
        }
    };

    const fetchWebsites = async () => {
        const { data, error } = await supabase
            .from('websites')
            .select('*, workspace:workspaces!inner(slug), website_pages(id, pages(id))')
            .order('created_at', { ascending: false });

        if (data) setWebsites(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newSiteName) {
            toast.error('Please enter a website name');
            return;
        }
        setCreating(true);
        const subdomain = newSiteName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        const result = await createWebsite(newSiteName, subdomain, selectedTemplate || undefined);

        if (result.success) {
            toast.success('Website created successfully');
            router.push(`/editor/website/${result.websiteId}/${result.pageId}`);
        } else {
            setCreating(false);
            toast.error(result.error);
        }
    };

    const handleDuplicate = async (id: string) => {
        toast.promise(duplicateWebsite(id), {
            loading: 'Duplicating website...',
            success: (res) => {
                if (res.success) {
                    fetchWebsites();
                    return 'Website duplicated';
                }
                throw new Error(res.error);
            },
            error: (err) => err.message
        });
    };

    const handleRename = async () => {
        if (!renameSite || !renameSite.name) return;
        setIsRenaming(true);
        const result = await updateWebsiteSettings(renameSite.id, { name: renameSite.name });
        if (result.success) {
            toast.success('Website renamed');
            fetchWebsites();
            setRenameSite(null);
        } else {
            toast.error('Failed to rename');
        }
        setIsRenaming(false);
    };

    const handleConfirmDelete = async () => {
        if (!deleteSite) return;

        toast.promise(deleteWebsite(deleteSite.id), {
            loading: 'Deleting...',
            success: (res) => {
                if (res.success) {
                    fetchWebsites();
                    setDeleteSite(null);
                    return 'Website deleted';
                }
                throw new Error(res.error);
            },
            error: (err) => err.message
        });
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
                <Button onClick={() => setIsModalOpen(true)} className="rounded-xl bg-[#6c47ff] hover:bg-[#6c47ff]/90">
                    <Plus className="mr-2 h-4 w-4" />
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
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        site.is_published ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    )}>
                                        {site.is_published ? 'published' : 'draft'}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        } />
                                        <DropdownMenuContent align="end" className="w-48 bg-[#0b0b10] border-white/10 text-white">
                                            <DropdownMenuItem onClick={() => {
                                                const pageId = site.website_pages?.[0]?.pages?.[0]?.id;
                                                router.push(`/editor/website/${site.id}/${pageId}`);
                                            }}>
                                                Edit Builder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setRenameSite({ id: site.id, name: site.name })}>
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDuplicate(site.id)}>
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                const pageId = site.website_pages?.[0]?.pages?.[0]?.id;
                                                router.push(`/editor/website/${site.id}/${pageId}?tab=settings`);
                                            }}>
                                                Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/5" />
                                            <DropdownMenuItem onClick={() => setDeleteSite(site)} className="text-destructive focus:text-destructive">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardTitle className="mt-4 text-white text-lg">{site.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-white/40 text-xs">
                                {site.subdomain}.leadsmind.ai
                            </CardDescription>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-white/20 font-medium uppercase tracking-tighter">
                                <span>Updated {formatDistanceToNow(new Date(site.updated_at || site.created_at))} ago</span>
                            </div>
                        </CardHeader>
                        <CardFooter className="pt-4 border-t border-white/5 flex gap-2">
                            <Link href={`/editor/website/${site.id}/${site.website_pages?.[0]?.pages?.[0]?.id}`} className="flex-1">
                                <Button variant="outline" className="w-full text-xs font-bold rounded-lg border-white/5 hover:bg-white/5 text-white/60">
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
                    onClick={() => setIsModalOpen(true)}
                    className="border-2 border-dashed border-white/5 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all group"
                >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-primary/10">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-sm">Create Website</span>
                </button>
            </div>

            {/* New Website Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-[#0b0b10] border-white/10 text-white overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl font-bold">Create New Website</DialogTitle>
                        <DialogDescription className="text-white/40">
                            Start with a blank canvas or choose from our premium templates.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Website Name</Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Website"
                                value={newSiteName}
                                onChange={(e) => setNewSiteName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Choose a Starting Point</Label>
                            
                            {templateError ? (
                                <div className="p-8 rounded-xl border-2 border-dashed border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Template loading failed</h4>
                                        <p className="text-xs text-white/40 mt-1">{templateError}</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={fetchTemplates}
                                        className="border-red-500/20 hover:bg-red-500/10 text-red-500 font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        Retry Connection
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div
                                        onClick={() => setSelectedTemplate(null)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-4 transition-all flex flex-col items-center justify-center gap-2 aspect-video",
                                            selectedTemplate === null ? "border-[#6c47ff] bg-[#6c47ff]/10" : "border-white/5 bg-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-xs text-white">Blank Page</span>
                                    </div>

                                    {dbTemplates.filter(t => t.category === 'website' || t.category === 'both').map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={cn(
                                                "cursor-pointer rounded-xl border-2 transition-all flex flex-col justify-end aspect-video group relative overflow-hidden",
                                                selectedTemplate === t.id ? "border-[#6c47ff]" : "border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            {(t.thumbnail_url || t.preview_image) && (
                                                <img 
                                                    src={t.thumbnail_url || t.preview_image} 
                                                    alt={t.name}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                                            <div className="relative z-20 p-4">
                                                <span className="font-bold text-xs block text-white">{t.name}</span>
                                                <span className="text-[10px] text-white/60 line-clamp-1">{t.description}</span>
                                            </div>
                                            {selectedTemplate === t.id && (
                                                <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-[#6c47ff] border-2 border-white flex items-center justify-center shadow-xl">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 border-t border-white/5 bg-white/[0.02]">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={creating || !newSiteName}
                            className="bg-[#6c47ff] hover:bg-[#6c47ff]/90 px-8 shadow-lg shadow-[#6c47ff]/20"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Create Website
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Modal */}
            <Dialog open={!!renameSite} onOpenChange={(open) => !open && setRenameSite(null)}>
                <DialogContent className="sm:max-w-[425px] bg-[#0b0b10] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Rename Website</DialogTitle>
                        <DialogDescription className="text-white/40">
                            Enter a new name for your website.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rename-name">Name</Label>
                            <Input
                                id="rename-name"
                                value={renameSite?.name || ''}
                                onChange={(e) => setRenameSite({ ...renameSite, name: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRenameSite(null)} className="text-white/40 hover:text-white">
                            Cancel
                        </Button>
                        <Button onClick={handleRename} disabled={isRenaming} className="bg-[#6c47ff] hover:bg-[#6c47ff]/90">
                            {isRenaming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteSite} onOpenChange={(open) => !open && setDeleteSite(null)}>
                <DialogContent className="sm:max-w-[425px] bg-[#0b0b10] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Delete Website
                        </DialogTitle>
                        <DialogDescription className="text-white/40 pt-2">
                            Are you sure you want to delete <span className="text-white font-bold">"{deleteSite?.name}"</span>?
                            This action is permanent and will remove all pages, settings, and analytics associated with this website.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setDeleteSite(null)} className="text-white/40 hover:text-white">
                            Keep Website
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
