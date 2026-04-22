import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PublicPageProps {
  params: {
    workspaceSlug: string;
    pageSlug: string;
  };
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { workspaceSlug, pageSlug } = await params;

  // Cleanup slug (remove leading slash if present)
  const normalizedSlug = pageSlug?.startsWith('/') ? pageSlug : `/${pageSlug}`;

  // 1. Direct path lookup
  let { data: page } = await supabase
    .from('pages')
    .select('name, seo_data, workspace:workspaces!inner(slug), website_page:website_pages(path_name), funnel_step:funnel_steps(path_name)')
    .eq('workspace.slug', workspaceSlug)
    .or(`website_page.path_name.eq.${normalizedSlug},funnel_step.path_name.eq.${normalizedSlug}`)
    .maybeSingle();

  // 2. Subdomain fallback
  if (!page) {
    const { data: homePage } = await supabase
        .from('pages')
        .select('name, seo_data, workspace:workspaces!inner(slug), website_page:website_pages!inner(path_name, website:websites!inner(subdomain))')
        .eq('workspace.slug', workspaceSlug)
        .eq('website_page.website.subdomain', pageSlug)
        .eq('website_page.path_name', '/')
        .maybeSingle();
    page = homePage as any;
  }

  if (!page) return { title: 'Page Not Found' };


  const seo = (page.seo_data as any) || {};

  return {
    title: seo.title || page.name,
    description: seo.description,
    openGraph: {
      title: seo.og_title || seo.title || page.name,
      description: seo.og_description || seo.description,
      images: seo.og_image ? [{ url: seo.og_image }] : [],
    },
  };
}

import { cookies } from 'next/headers';
import { getDeterministicVariant } from '@/lib/builder/ab-testing';
import crypto from 'crypto';
import { VisitorTracker } from '@/components/builder/VisitorTracker';

export default async function PublicPage({ params }: PublicPageProps) {
  const supabase = await createClient();
  const { workspaceSlug, pageSlug } = await params;
  const normalizedSlug = pageSlug?.startsWith('/') ? pageSlug : `/${pageSlug}`;

  // 1. First Attempt: Direct path lookup (Check both Website Pages and Funnel Steps)
  let { data: page } = await supabase
    .from('pages')
    .select(`
        *, 
        workspace:workspaces!inner(id, slug),
        website_page:website_pages!left(path_name, website:websites!left(config)),
        funnel_step:funnel_steps!left(path_name),
        variants:page_variants(id, content, weight)
    `)
    .eq('workspace.slug', workspaceSlug)
    .or(`website_page.path_name.eq.${normalizedSlug},funnel_step.path_name.eq.${normalizedSlug}`)
    .eq('is_published', true)
    .maybeSingle();

  // 2. Second Attempt: If the slug matches a website's subdomain, serve its homepage
  if (!page) {
    const { data: homePage } = await supabase
        .from('pages')
        .select(`
            *,
            workspace:workspaces!inner(id, slug),
            website_page:website_pages!inner(
                id,
                path_name,
                website:websites!inner(subdomain, config)
            )
        `)
        .eq('workspace.slug', workspaceSlug)
        .eq('website_page.website.subdomain', pageSlug)
        .eq('website_page.path_name', '/')
        .eq('is_published', true)
        .maybeSingle();
    
    page = homePage as any;
  }


  if (!page) {
    return notFound();
  }


  // 2. Handle Visitor ID & A/B Testing
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('lm_visitor_id')?.value || crypto.randomUUID();

  let selectedContent = page.rendered_html;
  let selectedVariantId: string | null = null;

  if (page.variants && (page.variants as any[]).length > 0) {
    selectedVariantId = getDeterministicVariant(visitorId, page.variants as any[]) as string;
    const variant = (page.variants as any[]).find((v: any) => v.id === selectedVariantId);
    if (variant) {
        // Variant rendering logic goes here
    }
  }

  // 3. Log Analytics (Fire and forget)
  supabase.from('page_analytics').insert({
    workspace_id: page.workspace.id,
    page_id: page.id,
    variant_id: selectedVariantId,
    visitor_id: visitorId,
  }).then(({ error }) => { if (error) console.error('Analytics log error:', error); });

  const websiteConfig = page.website_page?.website?.config || {};
  const hasNav = websiteConfig.navLinks && websiteConfig.navLinks.length > 0;
  const hasFooter = websiteConfig.footerLinks && websiteConfig.footerLinks.length > 0;

  const navStyle = websiteConfig.navStyle || { bg: '#ffffff', text: '#374151', border: true, size: 'h-16' };
  const footerStyle = websiteConfig.footerStyle || { bg: '#f8fafc', text: '#9ca3af', border: true, layout: 'between' };

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <VisitorTracker />
        
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
                        {(page.website_page?.website as any)?.name || 'Leadsmind'}
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {websiteConfig.navLinks.map((link: any, i: number) => (
                                <a 
                                    key={i} 
                                    href={`/p/${workspaceSlug}/${link.url.replace(/^\//, '')}`} 
                                    className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: navStyle.text }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        {navStyle.ctaText && (
                            <a 
                                href={`/p/${workspaceSlug}/${(navStyle.ctaUrl || '/').replace(/^\//, '')}`}
                                className="px-5 py-2 text-sm font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
                                style={{ backgroundColor: navStyle.ctaBg || '#000', color: navStyle.ctaColor || '#fff' }}
                            >
                                {navStyle.ctaText}
                            </a>
                        )}
                    </div>
                </div>
            </nav>
        )}

        <div className="flex-1">
            <div dangerouslySetInnerHTML={{ __html: selectedContent }} />
        </div>

        {hasFooter && (
            <footer 
                className={`w-full mt-auto py-16 ${footerStyle.border ? 'border-t border-black/10' : ''}`}
                style={{ backgroundColor: footerStyle.bg }}
            >
                <div className={`max-w-7xl mx-auto px-4 flex flex-col gap-8 ${footerStyle.layout === 'center' ? 'items-center text-center' : 'md:flex-row items-start justify-between'}`}>
                    <div className="flex flex-col gap-3 max-w-sm">
                        <div className="font-black tracking-tighter text-2xl" style={{ color: footerStyle.text }}>
                            {(page.website_page?.website as any)?.name || 'Leadsmind'}
                        </div>
                        {footerStyle.tagline && (
                            <p className="text-sm opacity-80 leading-relaxed" style={{ color: footerStyle.text }}>
                                {footerStyle.tagline}
                            </p>
                        )}
                        <div className="text-sm font-medium mt-2 opacity-60" style={{ color: footerStyle.text }}>
                            © {new Date().getFullYear()} {(page.website_page?.website as any)?.name || 'Leadsmind'}. All rights reserved.
                        </div>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                        {websiteConfig.footerLinks.map((link: any, i: number) => (
                            <a 
                                key={i} 
                                href={`/p/${workspaceSlug}/${link.url.replace(/^\//, '')}`} 
                                className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
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
  );
}

