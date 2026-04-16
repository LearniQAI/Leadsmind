import { requireAuth, getCurrentWorkspace } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { ContactTable } from '@/components/crm/ContactTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Upload } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ImportContactsModal } from '@/components/crm/ImportContactsModal';

export const dynamic = 'force-dynamic';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const supabase = await createServerClient();
  const { q } = await searchParams;
  const query = q || '';

  let dbQuery = supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspace!.id)
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data: contacts, error } = await dbQuery;

  if (error) {
    console.error('Error fetching contacts:', error);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Contacts</h1>
          <p className="text-sm text-white/40 font-medium">Manage and organize your business relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportContactsModal />
          <Button className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white h-11 px-5 rounded-xl gap-2 font-bold shadow-lg shadow-[#6c47ff]/20" asChild>
            <Link href="/contacts/new">
              <Plus className="h-5 w-5" />
              <span>Add Contact</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/20" />
        </div>
        <form action="/contacts" method="GET">
           <Input 
             name="q"
             defaultValue={query}
             placeholder="Search by name, email, or phone..." 
             className="pl-11 h-12 bg-[#0b0b10] border-white/5 text-white placeholder:text-white/20 rounded-xl focus-visible:ring-[#6c47ff]/50 focus-visible:border-[#6c47ff]/50 transition-all"
           />
        </form>
      </div>

      <ContactTable contacts={contacts || []} />
    </div>
  );
}
