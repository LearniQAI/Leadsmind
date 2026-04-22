"use client";

import React from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { Sidebar } from './Sidebar';
import { Viewport } from './Viewport';
import { PropertiesPanel } from './PropertiesPanel';
import { RenderNode } from './RenderNode';
import { Container } from './user/Container';
import { Section } from './user/Section';
import { Columns } from './user/Columns';
import { Spacer } from './user/Spacer';
import { Divider } from './user/Divider';
import { Heading } from './user/Heading';
import { Paragraph } from './user/Paragraph';
import { Image as ImageComponent } from './user/Image';
import { Video } from './user/Video';
import { Icon } from './user/Icon';
import { Text } from './user/Text';
import { Form } from './user/Form';
import { Countdown } from './user/Countdown';
import { PricingTable } from './user/PricingTable';
import { FAQ } from './user/FAQ';
import { UserButton } from './user/Button';
import { ProgressBar } from './user/ProgressBar';
import { UserTestimonial } from './user/Testimonial';
import { StarRating } from './user/StarRating';
import { LogoStrip } from './user/LogoStrip';
import { Hero } from './user/Hero';
import { Navbar } from './user/Navbar';
import { Footer } from './user/Footer';
import { BlogFeed } from './user/BlogFeed';
import { BuilderProvider } from './BuilderContext';
import { publishPage, updatePageContent, updateWebsiteSettings } from '@/app/actions/builder';

import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Send } from 'lucide-react';

const BuilderEditorContent = ({ type }: { type: 'website' | 'funnel' }) => {
  const { pageId } = useParams();
  const router = useRouter();

  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { query, actions } = useEditor();

  const handleSaveDraft = async () => {
    if (!pageId) return;
    setIsSaving(true);
    const content = query.serialize();
    const result = await updatePageContent(pageId as string, content);
    setIsSaving(false);
    
    if (result.success) {
      toast.success('Draft saved successfully');
    } else {
      toast.error('Failed to save draft');
    }
  };

  // Auto-save logic
  React.useEffect(() => {
    if (!pageId) return;
    
    const interval = setInterval(() => {
        handleSaveDraft();
    }, 60000); 

    return () => clearInterval(interval);
  }, [pageId, query]);

  const handlePublish = async () => {
    if (!pageId) return;
    setIsPublishing(true);
    const content = query.serialize();
    const result = await publishPage(pageId as string, content);
    setIsPublishing(false);
    
    if (result.success) {
      toast.success('Page published live!');
    } else {
      toast.error('Failed to publish');
    }
  };


  const hasLoaded = React.useRef(false);
  const [websiteData, setWebsiteData] = React.useState<any>(null);
  const [pages, setPages] = React.useState<any[]>([]);
  const updateTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleUpdateWebsite = (updates: any) => {
    if (!websiteData?.id) return;
    
    // Update local state immediately for snappy UI
    setWebsiteData((prev: any) => ({ ...prev, ...updates }));
    
    // Debounce the server save
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    
    updateTimerRef.current = setTimeout(async () => {
      try {
        const result = await updateWebsiteSettings(websiteData.id, updates);
        if (!result.success) toast.error('Failed to update site settings');
      } catch (err) {
        console.error('Settings update error:', err);
      }
    }, 500);
  };

  React.useEffect(() => {
    async function loadContent() {
      if (!pageId || hasLoaded.current) return;
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // Fetch Page Content with website details
      const { data } = await supabase
        .from('pages')
        .select('content, workspace:workspaces(slug), website_page:website_pages(website:websites(*))')
        .eq('id', pageId)
        .single();

      
      const rawWebsitePage = (data as any)?.website_page;
      const website = Array.isArray(rawWebsitePage) 
        ? rawWebsitePage[0]?.website 
        : rawWebsitePage?.website;

      const finalWebsite = Array.isArray(website) ? website[0] : website;
      
      if (finalWebsite) {
        // Attach workspace info for URL resolution
        const workspace = (data as any)?.workspace;
        const websiteWithWorkspace = { ...finalWebsite, workspaceSlug: workspace?.slug };
        setWebsiteData(websiteWithWorkspace);

        
        // Fetch sibling pages with their page record IDs
        const { data: siblingPages } = await supabase
            .from('website_pages')
            .select(`
                id, 
                name, 
                path_name,
                pages (id)
            `)
            .eq('website_id', finalWebsite.id);
        
        if (siblingPages) {
            setPages(siblingPages.map(p => ({
                id: (p.pages as any)?.[0]?.id || p.id,
                name: p.name,
                slug: p.path_name.replace('/', '') || 'home'
            })));
        }
      }

      if (data?.content) {
        actions.deserialize(data.content);
        hasLoaded.current = true;
      }
    }
    loadContent();
  }, [pageId, actions]);

  const websiteConfig = websiteData?.config || {};
  const hasNav = websiteConfig.navLinks && websiteConfig.navLinks.length > 0;
  const hasFooter = websiteConfig.footerLinks && websiteConfig.footerLinks.length > 0;
  const navStyle = websiteConfig.navStyle || { bg: '#ffffff', text: '#374151', border: true, size: 'h-16' };
  const footerStyle = websiteConfig.footerStyle || { bg: '#f8fafc', text: '#9ca3af', border: true, layout: 'between' };

  return (
    <BuilderProvider pages={pages} websiteId={websiteData?.id} websiteData={websiteData} onUpdateWebsite={handleUpdateWebsite}>
        <div className="h-screen w-full flex flex-col overflow-hidden">
            <header className="h-14 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black">L</div>
                    <span className="font-bold text-sm tracking-tight text-white">Leadsmind</span>
                </div>

                {/* Page Switcher */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mr-1">Editing:</span>
                    <select 
                        value={pageId as string}
                        onChange={(e) => router.push(`/editor/website/${websiteData?.id}/${e.target.value}`)}
                        className="bg-white/5 border-none rounded-md px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        {pages.map((p) => (
                            <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({p.slug})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="text-xs font-bold rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                    Save Draft
                </Button>
                <Button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    size="sm" 
                    className="text-xs font-bold rounded-lg bg-[#6c47ff] hover:bg-[#6c47ff]/90 px-6 shadow-lg shadow-primary/20"
                >
                    {isPublishing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Send className="w-3 h-3 mr-2" />}
                    Publish
                </Button>
            </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    type={type} 
                    website={websiteData} 
                    onUpdateWebsite={handleUpdateWebsite} 
                />
                <Viewport>
                    <div className="flex flex-col min-h-screen w-full font-sans bg-white pointer-events-none select-none">
                        {hasNav && (
                            <nav 
                                className={`w-full sticky top-0 z-50 transition-all ${navStyle.border ? 'border-b border-black/10' : ''} ${navStyle.glass ? 'backdrop-blur-md bg-opacity-70' : ''}`}
                                style={{ backgroundColor: navStyle.glass ? undefined : navStyle.bg }}
                            >
                                {navStyle.glass && (
                                    <div className="absolute inset-0 z-[-1] opacity-70" style={{ backgroundColor: navStyle.bg }} />
                                )}
                                <div className={`max-w-7xl mx-auto px-4 flex items-center justify-between ${navStyle.size}`}>
                                    <div className="font-black tracking-tighter text-xl" style={{ color: navStyle.text }}>
                                        {websiteData?.name || 'Leadsmind'}
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-6">
                                            {websiteConfig.navLinks.map((link: any, i: number) => (
                                                <a 
                                                    key={i} 
                                                    href="#" 
                                                    className="text-sm font-bold opacity-80"
                                                    style={{ color: navStyle.text }}
                                                >
                                                    {link.label}
                                                </a>
                                            ))}
                                        </div>
                                        {navStyle.ctaText && (
                                            <div 
                                                className="px-5 py-2 text-sm font-bold rounded-full"
                                                style={{ backgroundColor: navStyle.ctaBg || '#000', color: navStyle.ctaColor || '#fff' }}
                                            >
                                                {navStyle.ctaText}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </nav>
                        )}

                        <div className="flex-1 pointer-events-auto">
                            <Frame>
                                <Element id="ROOT" is={Container} canvas className="bg-white p-8 min-h-screen overflow-x-hidden" />
                            </Frame>
                        </div>

                        {hasFooter && (
                            <footer 
                                className={`w-full mt-auto py-16 ${footerStyle.border ? 'border-t border-black/10' : ''}`}
                                style={{ backgroundColor: footerStyle.bg }}
                            >
                                <div className={`max-w-7xl mx-auto px-4 flex flex-col gap-8 ${footerStyle.layout === 'center' ? 'items-center text-center' : 'md:flex-row items-start justify-between'}`}>
                                    <div className="flex flex-col gap-3 max-w-sm">
                                        <div className="font-black tracking-tighter text-2xl" style={{ color: footerStyle.text }}>
                                            {websiteData?.name || 'Leadsmind'}
                                        </div>
                                        {footerStyle.tagline && (
                                            <p className="text-sm opacity-80 leading-relaxed" style={{ color: footerStyle.text }}>
                                                {footerStyle.tagline}
                                            </p>
                                        )}
                                        <div className="text-sm font-medium mt-2 opacity-60" style={{ color: footerStyle.text }}>
                                            © {new Date().getFullYear()} {websiteData?.name || 'Leadsmind'}. All rights reserved.
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 flex-wrap">
                                        {websiteConfig.footerLinks.map((link: any, i: number) => (
                                            <a 
                                                key={i} 
                                                href="#" 
                                                className="text-sm font-bold opacity-80"
                                                style={{ color: footerStyle.text }}
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </footer>
                        )}
                    </div>
                </Viewport>
                <PropertiesPanel />
            </div>
        </div>
    </BuilderProvider>
  );
};

export const BuilderEditor = ({ type }: { type: 'website' | 'funnel' }) => {
  return (
    <Editor
      resolver={{
        Container,
        Section,
        Columns,
        Spacer,
        Divider,
        Heading,
        Paragraph,
        Image: ImageComponent,
        Video,
        Icon,
        Text,
        Form,
        Countdown,
        PricingTable,
        FAQ,
        Button: UserButton,
        UserButton,
        ProgressBar,
        Testimonial: UserTestimonial,
        UserTestimonial,
        StarRating,
        LogoStrip,
        Hero,
        Navbar,
        Footer,
        BlogFeed,
      }}
      enabled={true}
      onRender={({ render }) => <RenderNode render={render} />}
    >
      <BuilderEditorContent type={type} />
    </Editor>
  );
};


