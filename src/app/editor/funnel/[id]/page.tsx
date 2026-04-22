import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export default async function FunnelEditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;

  // Find the first step for this funnel
  const { data: step } = await supabase
    .from('funnel_steps')
    .select('id')
    .eq('funnel_id', id)
    .order('order', { ascending: true })
    .limit(1)
    .single();

  if (!step) return notFound();

  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('funnel_step_id', step.id)
    .single();

  if (!page) return notFound();

  redirect(`/editor/funnel/${id}/${page.id}`);
}
