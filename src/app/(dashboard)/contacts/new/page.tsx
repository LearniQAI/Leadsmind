import { requireAuth } from '@/lib/auth';
import { ContactForm } from '@/components/crm/ContactForm';
import { getWorkspaceMembers } from '@/app/actions/workspace';

export default async function NewContactPage() {
  await requireAuth();
  const members = await getWorkspaceMembers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">New Contact</h1>
        <p className="text-sm text-white/40 font-medium">Add a new person to your workspace</p>
      </div>

      <div className="bg-[#0b0b10] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
        <ContactForm members={members} />
      </div>
    </div>
  );
}
