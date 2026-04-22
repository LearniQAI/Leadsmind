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
        published_at, 
        website_page:website_pages(path_name),
        funnel_step:funnel_steps(path_name)
    `)
    .eq('workspace_id', workspace.id)
    .eq('type', 'blog_post')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

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
                    return (
                        <Link key={post.id} href={`/p/${workspaceSlug}/${slug.replace(/^\//, '')}`} className="group">
                            <Card className="border-none shadow-none bg-transparent overflow-hidden">
                                {post.preview_image && (
                                    <div className="aspect-video relative overflow-hidden rounded-2xl mb-6">
                                        <img 
                                            src={post.preview_image} 
                                            alt={post.name} 
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <CardHeader className="p-0">
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 font-semibold">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.published_at || '').toLocaleDateString()}</span>
                                    </div>
                                    <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                                        {post.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="p-0 mt-4">
                                    <span className="text-primary font-bold text-sm flex items-center gap-2">
                                        Read Article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
