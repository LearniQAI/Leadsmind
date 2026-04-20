'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Settings2, 
  Type, 
  AlignLeft, 
  ListOrdered, 
  CheckSquare, 
  Star, 
  Paperclip,
  Save,
  Rocket
} from 'lucide-react';
import { GlassContainer, SectionLabel } from './BookingPrimitives';
import { toast } from 'sonner';
import { saveIntakeForm } from '@/app/actions/calendar';

interface Field {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'rating' | 'file';
  label: string;
  required: boolean;
}

interface IntakeFormBuilderProps {
  calendarId: string;
  initialFields: Field[];
}

export function IntakeFormBuilder({ calendarId, initialFields }: IntakeFormBuilderProps) {
  const [fields, setFields] = useState<Field[]>(initialFields || []);
  const [isSaving, setIsSaving] = useState(false);

  const addField = (type: Field['type']) => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `New ${type} question`,
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
     setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveIntakeForm(calendarId, fields);
    setIsSaving(false);
    if (res.success) {
      toast.success('Intake form configuration saved');
    } else {
      toast.error('Failed to save configuration');
    }
  };

  return (
    <div className="space-y-8 mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none text-[10px] font-black uppercase tracking-widest mb-2">Automated Preparation</Badge>
           <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight">Intake Form Builder</h2>
           <p className="text-white/40 text-sm italic">Structured questions that build your pre-meeting brief.</p>
        </div>
        <Button 
          id="save-intake-form-btn"
          disabled={isSaving}
          onClick={handleSave}
          className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl gap-2 font-black italic uppercase text-xs h-12 px-8 shadow-xl shadow-[#6c47ff]/20"
        >
          {isSaving ? <span className="animate-pulse">Syncing...</span> : (
            <>
              <Save className="h-4 w-4" />
              Sync Form Structure
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Toolbox */}
        <div className="lg:col-span-1 space-y-4">
           <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-4">Question Types</span>
              <div className="grid grid-cols-2 gap-2">
                 <TypeButton icon={Type} label="Text" onClick={() => addField('text')} />
                 <TypeButton icon={AlignLeft} label="Long Text" onClick={() => addField('textarea')} />
                 <TypeButton icon={ListOrdered} label="Dropdown" onClick={() => addField('dropdown')} />
                 <TypeButton icon={CheckSquare} label="Multiple" onClick={() => addField('checkbox')} />
                 <TypeButton icon={Star} label="Rating" onClick={() => addField('rating')} />
                 <TypeButton icon={Paperclip} label="File" onClick={() => addField('file')} />
              </div>
           </div>
           
           <div className="p-6 rounded-[32px] bg-[#6c47ff]/5 border border-[#6c47ff]/10">
              <Rocket className="h-6 w-6 text-[#6c47ff] mb-2" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Briefing Intelligence</h4>
              <p className="text-[10px] text-white/40 leading-relaxed italic">
                Answers will be automatically formatted into a bulleted brief and sent to your host 2 hours before the call.
              </p>
           </div>
        </div>

        {/* Main Canvas */}
        <div className="lg:col-span-3 space-y-4">
           {fields.map((field, index) => (
             <GlassContainer key={field.id} className="p-6 animate-in slide-in-from-right-4 duration-300" withGlow={false}>
                <div className="flex items-center gap-4">
                   <div className="cursor-grab active:cursor-grabbing text-white/10 hover:text-white/40 transition-colors">
                      <GripVertical className="h-5 w-5" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-[10px] font-black text-[#6c47ff] uppercase">Q#{index + 1}</span>
                         <Badge variant="outline" className="text-[9px] font-bold bg-white/5 border-white/10 text-white/40 uppercase">{field.type}</Badge>
                      </div>
                      <Input 
                         value={field.label}
                         onChange={(e) => {
                            const newFields = [...fields];
                            newFields[index].label = e.target.value;
                            setFields(newFields);
                         }}
                         className="bg-transparent border-none text-lg font-bold text-white focus-visible:ring-0 p-0 h-auto"
                         placeholder="Type your question here..."
                      />
                   </div>
                   <div className="flex items-center gap-2">
                      <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-white/10 hover:text-rose-500 rounded-xl"
                         onClick={() => removeField(field.id)}
                      >
                         <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/10 hover:text-[#6c47ff] rounded-xl">
                         <Settings2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
             </GlassContainer>
           ))}

           {fields.length === 0 && (
             <div className="p-20 border border-dashed border-white/5 rounded-[40px] text-center bg-white/[0.01]">
                <AlignLeft className="h-10 w-10 text-white/5 mx-auto mb-4" />
                <p className="text-sm font-bold text-white/20 uppercase tracking-widest italic">No questions added yet. Use the toolbox to get started.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function TypeButton({ icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#6c47ff]/50 hover:bg-[#6c47ff]/10 transition-all group"
    >
      <Icon className="h-4 w-4 text-white/30 group-hover:text-[#6c47ff] mb-1" />
      <span className="text-[9px] font-bold text-white/20 group-hover:text-white uppercase tracking-tighter">{label}</span>
    </button>
  );
}
