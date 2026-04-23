import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default async function BlogListingPage({ params }: { params: { workspaceSlug: string } }) {
  const supabase = await createClient();
  const { workspaceSlug } = params;

  // 1. Get Workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('slug', workspaceSlug)
    .single();

  if (!workspace) return notFound();

  // 2. Get Blog Posts
  const { data: posts } = await supabase
    .from('pages')
    .select(`
        id, 
        name, 
        preview_image, 
        created_at,
        author,
        category,
        excerpt,
        read_time,
        seo_description,
        og_image_url,
        website_page:website_pages(path_name),
        funnel_step:funnel_steps(path_name)
    `)
    .eq('workspace_id', workspace.id)
    .eq('type', 'blog_post')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <header className="py-20 bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-6">
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5">Our Journal</Badge>
            <h1 className="text-5xl font-black tracking-tight text-gray-900">{workspace.name} Blog</h1>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl">Expert insights, company news, and actionable tips for your business growth.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        {!posts || posts.length === 0 ? (
            <div className="text-center py-20">
                <p className="text-gray-400 italic">No blog posts found.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {posts.map((post: any) => {
                    const slug = post.website_page?.[0]?.path_name || post.funnel_step?.[0]?.path_name || post.id;
                    const featuredImage = post.og_image_url || post.preview_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426';
                    
                    return (
                        <Link key={post.id} href={`/p/${workspaceSlug}/${slug.replace(/^\//, '')}`} className="group">
                            <Card className="border-none shadow-none bg-transparent overflow-hidden h-full flex flex-col">
                                <div className="aspect-[16/10] relative overflow-hidden rounded-[2.5rem] mb-8 bg-gray-100 shadow-sm border border-black/5">
                                    <img 
                                        src={featuredImage} 
                                        alt={post.name} 
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {post.category && (
                                        <div className="absolute top-6 left-6">
                                            <Badge className="bg-white/90 backdrop-blur-md text-black hover:bg-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                {post.category}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="p-0 flex-1">
                                    <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-4 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {new Date(post.created_at).toLocaleDateString()}</span>
                                        {post.read_time && <span className="opacity-50">• {post.read_time} min read</span>}
                                    </div>
                                    <CardTitle className="text-3xl font-bold group-hover:text-primary transition-colors leading-[1.1] mb-4">
                                        {post.name}
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">
                                        {post.excerpt || post.seo_description || 'Click to read the full article and discover more...'}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="p-0 mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-0.5 shadow-md">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-black text-gray-900">
                                                {post.author?.[0] || 'A'}
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{post.author || 'Editorial Team'}</span>
                                    </div>
                                    <span className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                        Read Story <ArrowRight className="w-4 h-4" />
                                    </span>
                                </CardFooter>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        )}
      </main>
    </div>
  );
}
