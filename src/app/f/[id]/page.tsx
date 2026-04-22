import { fetchFormById } from '@/app/actions/forms';
import { PublicForm } from '@/components/forms/PublicForm';
import { notFound } from 'next/navigation';

export default async function PublicFormPage({
  params
}: {
  params: { id: string }
}) {
  const form = await fetchFormById(params.id);

  if (!form || form.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0b0b10] border border-white/5 rounded-[40px] shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-500">
        <PublicForm form={form} />
        
        <div className="mt-12 text-center">
           <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
             Powered by <span className="text-white/30">LeadsMind</span>
           </p>
        </div>
      </div>
    </div>
  );
}
