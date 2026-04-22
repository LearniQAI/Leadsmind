import { fetchForms } from '@/app/actions/forms';
import { FormList } from '@/components/forms/FormList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function FormsPage() {
  const forms = await fetchForms();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Forms & Surveys</h1>
          <p className="text-white/50">Capture leads and collect feedback with custom forms.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/forms/new?type=survey">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Survey
            </Button>
          </Link>
          <Link href="/forms/new?type=form">
            <Button className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2">
              <Plus className="h-4 w-4" />
              New Form
            </Button>
          </Link>
        </div>
      </div>

      <FormList forms={forms} />
    </div>
  );
}
