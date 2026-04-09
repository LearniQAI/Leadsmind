import { requireAuth } from '@/lib/auth';
import { getContact } from '@/app/actions/contacts';
import { 
  getContactActivities, 
  getContactNotes, 
  getContactTasks 
} from '@/app/actions/crm';
import { ContactDetailLayout } from '@/components/crm/ContactDetailLayout';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { NotesSection } from '@/components/crm/NotesSection';
import { TasksSection } from '@/components/crm/TasksSection';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History, 
  MessageSquare, 
  CheckSquare, 
  LayoutDashboard 
} from 'lucide-react';

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAuth();
  const [
    contactResult, 
    activitiesResult, 
    notesResult, 
    tasksResult
  ] = await Promise.all([
    getContact(params.id),
    getContactActivities(params.id),
    getContactNotes(params.id),
    getContactTasks(params.id),
  ]);

  if (!contactResult.success || !contactResult.data) {
    notFound();
  }

  return (
    <ContactDetailLayout contact={contactResult.data}>
      <Tabs defaultValue="activity" className="space-y-8">
        <TabsList className="bg-[#0b0b10] border border-white/5 p-1 rounded-2xl h-14">
          <TabsTrigger value="activity" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <History className="h-4 w-4" />
            <span>Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <MessageSquare className="h-4 w-4" />
            <span>Notes</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <CheckSquare className="h-4 w-4" />
            <span>Tasks</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ActivityTimeline activities={activitiesResult.data || []} />
        </TabsContent>

        <TabsContent value="notes" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <NotesSection contactId={params.id} notes={notesResult.data || []} />
        </TabsContent>

        <TabsContent value="tasks" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TasksSection contactId={params.id} tasks={tasksResult.data || []} />
        </TabsContent>
        
      </Tabs>
    </ContactDetailLayout>
  );
}
