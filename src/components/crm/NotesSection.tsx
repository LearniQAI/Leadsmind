'use client';

import { useState } from 'react';
import { ContactNote } from '@/types/crm.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createNote, deleteNote } from '@/app/actions/crm';
import { format } from 'date-fns';
import { Trash2, MessageSquare, Plus } from 'lucide-react';

interface NotesSectionProps {
  contactId: string;
  notes: ContactNote[];
}

export function NotesSection({ contactId, notes }: NotesSectionProps) {
  const [content, setContent] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleAddNote() {
    if (!content.trim()) return;
    setIsPending(true);
    try {
      const result = await createNote({ contactId, content });
      if (result.success) {
        toast.success('Note added');
        setContent('');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to add note');
    } finally {
      setIsPending(false);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      const result = await deleteNote(id, contactId);
      if (result.success) {
        toast.success('Note deleted');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to delete note');
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Textarea 
          placeholder="Type your note here..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-[#0b0b10] border-white/5 text-white rounded-2xl min-h-[120px] focus:border-[#6c47ff]/50 transition-all p-4"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleAddNote} 
            disabled={isPending || !content.trim()}
            className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl px-6 font-bold gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-[#0b0b10] border border-white/5 rounded-2xl p-6 group relative">
             <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                   <div className="h-6 w-6 rounded-lg bg-blue-400/10 flex items-center justify-center">
                     <MessageSquare className="h-3 w-3 text-blue-400" />
                   </div>
                   <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                     {format(new Date(note.created_at), 'MMM d, yyyy · HH:mm')}
                   </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
             </div>
             <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-medium">
               {note.content}
             </p>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/10 border border-dashed border-white/5 rounded-3xl">
             <MessageSquare className="h-8 w-8 mb-2" />
             <p className="text-xs font-semibold">No notes yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
