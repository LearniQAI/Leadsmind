import { fetchFormById } from '@/app/actions/forms';
import { FormBuilder } from '@/components/forms/builder/FormBuilder';
import { redirect } from 'next/navigation';

export default async function FormBuilderPage({
  params
}: {
  params: { id: string }
}) {
  const form = await fetchFormById(params.id);

  if (!form) {
    redirect('/forms');
  }

  return (
    <div className="h-[calc(100vh-140px)] -m-8 md:-m-12 bg-[#030303]">
      <FormBuilder initialForm={form} />
    </div>
  );
}
