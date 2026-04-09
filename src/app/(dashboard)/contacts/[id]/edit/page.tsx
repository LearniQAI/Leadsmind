import { requireAuth } from '@/lib/auth';
import { ContactForm } from '@/components/crm/ContactForm';
import { getContact } from '@/app/actions/contacts';
import { getWorkspaceMembers } from '@/app/actions/workspace';
import { notFound, redirect } from 'next/navigation';

export default async function EditContactPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAuth();
  const [contactResult, members] = await Promise.all([
    getContact(params.id),
    getWorkspaceMembers(),
  ]);

  if (!contactResult.success || !contactResult.data) {
    if (contactResult.error === 'Contact not found') {
        notFound();
    }
    redirect('/contacts');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Edit Contact</h1>
        <p className="text-sm text-white/40 font-medium">Update information for {contactResult.data.first_name} {contactResult.data.last_name}</p>
      </div>

      <div className="bg-[#0b0b10] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
        <ContactForm initialData={contactResult.data} members={members} />
      </div>
    </div>
  );
}
