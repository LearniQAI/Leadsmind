import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export default async function WebsiteEditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Find the home page for this website
  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('website_page_id', (
        await supabase
            .from('website_pages')
            .select('id')
            .eq('website_id', id)
            .eq('path_name', '/')
            .single()
    ).data?.id)
    .single();

  if (!page) {
    // If no home page, try to find any page for this website
    const { data: anyPage } = await supabase
        .from('pages')
        .select('id')
        .eq('website_page.website_id', id)
        .maybeSingle();
    
    if (!anyPage) return notFound();
    redirect(`/editor/website/${id}/${anyPage.id}`);
  }

  redirect(`/editor/website/${id}/${page.id}`);
}
