import { requireAuth } from '@/lib/auth';
import { getContact } from '@/app/actions/contacts';
import { 
  getContactActivities, 
  getContactNotes, 
  getContactTasks 
} from '@/app/actions/crm';
import { getAutomationLogsForContact } from '@/app/actions/automation';
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
  FileText
} from 'lucide-react';
import { getContactDocuments } from '@/app/actions/media';
import { DocumentsSection } from '@/components/crm/DocumentsSection';
import { AutomationLogsSection } from '@/components/crm/AutomationLogsSection';
import { Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const [
    contactResult, 
    activitiesResult, 
    notesResult, 
    tasksResult,
    docsResult,
    automationLogsResult
  ] = await Promise.all([
    getContact(id),
    getContactActivities(id),
    getContactNotes(id),
    getContactTasks(id),
    getContactDocuments(id),
    getAutomationLogsForContact(id)
  ]);

  if (!contactResult.success) {
    notFound();
  }

  if (!contactResult.data) {
    notFound();
  }

  const activities = activitiesResult.success ? (activitiesResult.data ?? []) : [];
  const notes = notesResult.success ? (notesResult.data ?? []) : [];
  const tasks = tasksResult.success ? (tasksResult.data ?? []) : [];
  const documents = docsResult || [];

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
          <TabsTrigger value="documents" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="rounded-xl px-6 data-[state=active]:bg-white/5 data-[state=active]:text-[#6c47ff] gap-2 font-bold transition-all">
            <Zap className="h-4 w-4" />
            <span>Automation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <ActivityTimeline activities={activities} />
        </TabsContent>

        <TabsContent value="notes" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <NotesSection contactId={id} notes={notes} />
        </TabsContent>

        <TabsContent value="tasks" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <TasksSection contactId={id} tasks={tasks} />
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <DocumentsSection contactId={id} documents={documents} />
        </TabsContent>

        <TabsContent value="automation" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <AutomationLogsSection logs={automationLogsResult || []} />
        </TabsContent>
        
      </Tabs>
    </ContactDetailLayout>
  );
}
