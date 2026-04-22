import { requireAuth, getCurrentWorkspace } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { ContactTable } from '@/components/crm/ContactTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Tag as TagIcon, X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ImportContactsModal } from '@/components/crm/ImportContactsModal';
import { getWorkspaceTags } from '@/app/actions/contacts';

export const dynamic = 'force-dynamic';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  await requireAuth();
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect('/login');

  const supabase = await createServerClient();
  const { q, tag } = await searchParams;
  const query = q || '';

  let dbQuery = supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspace!.id)
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  if (tag) {
    dbQuery = dbQuery.contains('tags', [tag]);
  }

  const { data: contacts, error } = await dbQuery;
  const allTags = await getWorkspaceTags(workspace!.id);

  if (error) {
    console.error('Error fetching contacts:', error);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Contacts</h1>
          <p className="text-sm text-white/40 font-medium">Segment and manage your database relationships.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/contacts/tags">
            <Button variant="ghost" className="h-11 px-6 rounded-xl gap-2 font-bold text-white/40 hover:text-white hover:bg-white/5 border border-white/5 uppercase text-[10px] tracking-widest transition-all">
              <TagIcon size={16} />
              <span>Manage Tags</span>
            </Button>
          </Link>
          <ImportContactsModal />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
            <Link href="/contacts/new">
              <Plus className="h-5 w-5" />
              <span>Add Contact</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500/50">
            <Search className="h-4 w-4 text-white/10" />
          </div>
          <form action="/contacts" method="GET">
             <Input 
               name="q"
               defaultValue={query}
               placeholder="Search by name, email, or phone..." 
               className="pl-11 h-12 bg-[#08080f] border-white/5 text-white placeholder:text-white/10 rounded-xl focus:border-white/20 transition-all"
             />
             {tag && <input type="hidden" name="tag" value={tag} />}
          </form>
        </div>

        {/* Tag Selection Pills (Semi-Industrial) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
             <div className="h-6 w-px bg-white/5 mx-2 hidden md:block" />
             <Link href="/contacts">
               <Button 
                variant={!tag ? "default" : "ghost"}
                size="sm"
                className={`h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!tag ? 'bg-white/5 text-white hover:bg-white/10' : 'text-white/20 hover:text-white'}`}
               >
                 All
               </Button>
             </Link>
             {allTags.slice(0, 5).map(t => (
               <Link key={t.name} href={`/contacts?tag=${t.name}${query ? `&q=${query}` : ''}`}>
                 <Button 
                  variant={tag === t.name ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tag === t.name ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-white/20 hover:text-white hover:bg-white/5 border border-white/5'}`}
                 >
                   {t.name}
                 </Button>
               </Link>
             ))}
             {tag && (
               <Link href="/contacts">
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/5">
                   <X size={14} />
                 </Button>
               </Link>
             )}
          </div>
        )}
      </div>

      <ContactTable contacts={contacts || []} />
    </div>
  );
}
