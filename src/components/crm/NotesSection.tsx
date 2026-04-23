'use client';

import { useState } from 'react';
import { ContactNote } from '@/types/crm.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createNote, deleteNote, toggleNotePin } from '@/app/actions/contacts';
import { format } from 'date-fns';
import { 
  Trash2, 
  MessageSquare, 
  Plus, 
  Pin, 
  PinOff,
  Clock,
  MoreVertical,
  StickyNote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotesSectionProps {
  contactId: string;
  notes: any[]; // Using any to support is_pinned which might not be in base type yet
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

  async function handleTogglePin(id: string, currentPinned: boolean) {
    try {
      const result = await toggleNotePin(id, contactId, currentPinned);
      if (result.success) {
        toast.success(currentPinned ? 'Note unpinned' : 'Note pinned');
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to update note');
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

  const pinnedNotes = notes.filter(n => n.is_pinned);
  const otherNotes = notes.filter(n => !n.is_pinned);

  return (
    <div className="space-y-8">
      <div className="bg-[#0b0b10] border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-2xl">
        <Textarea 
          placeholder="Start typing a note..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-white/3 border-white/5 text-white rounded-2xl min-h-[140px] focus:border-blue-500/30 transition-all p-5 font-medium placeholder:text-white/10"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleAddNote} 
            disabled={isPending || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12 font-bold gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span>Add Note</span>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {pinnedNotes.length > 0 && (
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                    <Pin className="h-3 w-3 text-blue-400 fill-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Pinned Notes</span>
                </div>
                {pinnedNotes.map((note) => (
                    <NoteCard 
                        key={note.id} 
                        note={note} 
                        onDelete={handleDeleteNote} 
                        onTogglePin={handleTogglePin} 
                    />
                ))}
            </div>
        )}

        <div className="space-y-3">
          {otherNotes.length > 0 && pinnedNotes.length > 0 && (
             <div className="flex items-center gap-2 px-2 pt-4">
                <StickyNote className="h-3 w-3 text-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Recent Activity</span>
            </div>
          )}
          {otherNotes.map((note) => (
            <NoteCard 
                key={note.id} 
                note={note} 
                onDelete={handleDeleteNote} 
                onTogglePin={handleTogglePin} 
            />
          ))}
        </div>

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-white/5 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
             <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10" />
             </div>
             <h4 className="text-xl font-black uppercase italic tracking-tight mb-2 opacity-30">No conversations recorded</h4>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-20">Start by adding your first internal note.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onDelete, onTogglePin }: { note: any, onDelete: (id: string) => void, onTogglePin: (id: string, pinned: boolean) => void }) {
    return (
        <div className={cn(
            "group bg-[#0b0b10] border rounded-2xl p-6 transition-all hover:bg-white/3",
            note.is_pinned ? "border-blue-500/20 bg-blue-500/2" : "border-white/5"
        )}>
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={cn(
                       "h-8 w-8 rounded-xl flex items-center justify-center border",
                       note.is_pinned ? "bg-blue-600/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-white/20 border-white/5"
                   )}>
                     <MessageSquare className="h-4 w-4" />
                   </div>
                   <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/60">Admin User</span>
                        <div className="flex items-center gap-1.5 text-white/20">
                            <Clock className="h-2.5 w-2.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                                {format(new Date(note.created_at), 'MMM d, yyyy · HH:mm')}
                            </span>
                        </div>
                   </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                            "h-9 w-9 rounded-xl transition-all",
                            note.is_pinned ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" : "text-white/20 hover:text-white hover:bg-white/5"
                        )}
                        onClick={() => onTogglePin(note.id, note.is_pinned)}
                    >
                        {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-white/10 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                        onClick={() => onDelete(note.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
             </div>
             <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed font-medium">
               {note.content}
             </p>
        </div>
    );
}
