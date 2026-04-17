import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PublicFormRenderer from '@/components/marketing/PublicFormRenderer';

interface PublicFormPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PublicFormPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: form } = await supabase.from('forms').select('name, description').eq('id', id).single();
  
  return {
    title: form?.name || 'Lead Capture',
    description: form?.description || 'Submit the form to get started.',
  };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch form details
  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !form) notFound();

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,transparent_50%)] pointer-events-none opacity-40" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="w-full max-w-lg z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-3 mb-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 mb-2">
             <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Leadsmind Secure Form</span>
           </div>
           <h1 className="text-3xl font-black tracking-tight text-white italic uppercase">{form.name}</h1>
           {form.description && (
             <p className="text-sm text-white/40 font-medium max-w-sm mx-auto leading-relaxed">{form.description}</p>
           )}
        </div>

        <div className="bg-[#0c0c14] border border-white/5 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
          {/* Subtle Border Glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          
          <PublicFormRenderer 
            formId={form.id} 
            workspaceId={form.workspace_id} 
            fields={form.fields} 
            buttonText={form.button_text}
            successMessage={form.success_message}
            redirectUrl={form.redirect_url}
          />

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
             <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Powered by Leadsmind Intelligence</p>
          </div>
        </div>

        <div className="mt-12 flex justify-center items-center gap-8 opacity-20 hover:opacity-40 transition-opacity grayscale">
           {/* Placeholder for Trust Icons */}
           <div className="h-5 w-20 bg-white/20 rounded-md" />
           <div className="h-5 w-20 bg-white/20 rounded-md" />
           <div className="h-5 w-20 bg-white/20 rounded-md" />
        </div>
      </main>
    </div>
  );
}
