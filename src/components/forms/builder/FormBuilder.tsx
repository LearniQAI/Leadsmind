'use client';

import { useState, useEffect } from 'react';
import { Form, FormField, FormSettings } from '@/types/forms.types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Settings2, 
  Layout, 
  Eye, 
  Code2, 
  X,
  GripVertical,
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  List,
  Upload,
  Split,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { updateForm } from '@/app/actions/forms';
import { toast } from 'sonner';

interface FormBuilderProps {
  initialForm: Form;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: Layout },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'phone', label: 'Phone Number', icon: Phone },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date Picker', icon: Calendar },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio Group', icon: List },
  { type: 'file', label: 'File Upload', icon: Upload },
  { type: 'page_break', label: 'Page Break', icon: Split },
];

export function FormBuilder({ initialForm }: FormBuilderProps) {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeTab, setActiveTab] = useState<'add' | 'field' | 'settings'>('add');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedField = form.fields.find(f => f.id === selectedFieldId);

  const addField = (type: any) => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      type,
      label: `New ${type.replace('_', ' ')} field`,
      required: false,
      placeholder: '',
    };
    
    setForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setSelectedFieldId(newField.id);
    setActiveTab('field');
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const removeField = (id: string) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id)
    }));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(form.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setForm(prev => ({
      ...prev,
      fields: items
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateForm(form.id, {
        fields: form.fields,
        settings: form.settings,
        name: form.name,
        status: form.status
      });
      toast.success('Form saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0b0b10] px-6">
        <div className="flex items-center gap-4">
          <Link href="/forms">
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <input 
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-transparent text-sm font-bold text-white border-none outline-none focus:ring-0 w-48"
            />
            <span className="text-[10px] text-white/30 uppercase tracking-widest px-0">Form Builder</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white/50 hover:text-white gap-2">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button 
            className="bg-[#6c47ff] hover:bg-[#8b5cf6] text-white gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Configuration */}
        <aside className="w-[350px] border-r border-white/5 bg-[#0b0b10] flex flex-col">
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveTab('add')}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'add' ? "text-white border-[#6c47ff]" : "text-white/30 border-transparent hover:text-white/50"
              )}
            >
              Add Fields
            </button>
            <button 
              onClick={() => setActiveTab('field')}
              disabled={!selectedFieldId}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all disabled:opacity-30",
                activeTab === 'field' ? "text-white border-[#6c47ff]" : "text-white/30 border-transparent hover:text-white/50"
              )}
            >
              Field Settings
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'settings' ? "text-white border-[#6c47ff]" : "text-white/30 border-transparent hover:text-white/50"
              )}
            >
              Form Settings
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
            {activeTab === 'add' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {FIELD_TYPES.map((field) => (
                    <button
                      key={field.type}
                      onClick={() => addField(field.type)}
                      className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-white/50 transition-all hover:bg-white/[0.05] hover:border-white/20 hover:text-white group"
                    >
                      <field.icon className="h-5 w-5 group-hover:scale-110 transition-transform text-[#6c47ff]/60 group-hover:text-[#6c47ff]" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'field' && selectedField && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Field Label</label>
                    <Input 
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  
                  {['text', 'textarea', 'email', 'phone', 'number'].includes(selectedField.type) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Placeholder</label>
                      <Input 
                        value={selectedField.placeholder}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input 
                      type="checkbox"
                      id="required-toggle"
                      checked={selectedField.required}
                      onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                      className="h-4 w-4 accent-[#6c47ff]"
                    />
                    <label htmlFor="required-toggle" className="text-sm text-white font-medium">Required Field</label>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/5 gap-2"
                    onClick={() => removeField(selectedField.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Remove Field
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                 {/* Form level settings can be implemented here */}
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Success Message</label>
                     <Input 
                       value={form.settings.successMessage}
                       onChange={(e) => setForm(f => ({ ...f, settings: { ...f.settings, successMessage: e.target.value }}))}
                       className="bg-white/5 border-white/10"
                     />
                   </div>
                   
                   <div className="space-y-4 pt-4 border-t border-white/5">
                     <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#6c47ff]">Auto-Responder</label>
                       <input 
                         type="checkbox"
                         checked={form.settings.emailResponder?.enabled || false}
                         onChange={(e) => setForm(f => ({ 
                           ...f, 
                           settings: { 
                             ...f.settings, 
                             emailResponder: { 
                               subject: '',
                               body: '',
                               ...(f.settings.emailResponder || {}), 
                               enabled: e.target.checked 
                             } 
                           }
                         }))}
                         className="h-4 w-4 accent-[#6c47ff]"
                       />
                     </div>
 
                     {form.settings.emailResponder?.enabled && (
                       <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Subject</label>
                           <Input 
                             value={form.settings.emailResponder?.subject || ''}
                             onChange={(e) => setForm(f => ({ 
                               ...f, 
                               settings: { 
                                 ...f.settings, 
                                 emailResponder: { 
                                   enabled: false,
                                   body: '',
                                   ...(f.settings.emailResponder || {}), 
                                   subject: e.target.value 
                                 } 
                               }
                             }))}
                             placeholder="Thanks for reaching out!"
                             className="bg-white/5 border-white/10 text-xs"
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Body</label>
                           <textarea 
                             value={form.settings.emailResponder?.body || ''}
                             onChange={(e) => setForm(f => ({ 
                               ...f, 
                               settings: { 
                                 ...f.settings, 
                                 emailResponder: { 
                                   enabled: false,
                                   subject: '',
                                   ...(f.settings.emailResponder || {}), 
                                   body: e.target.value 
                                 } 
                               }
                             }))}
                             placeholder="Hi {first_name}, thanks for your interest..."
                             className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white outline-none focus:ring-1 focus:ring-[#6c47ff]"
                           />
                           <p className="text-[10px] text-white/20 italic">Use {'{first_name}'} to personalize.</p>
                         </div>
                       </div>
                     )}
                   </div>
                   
                   <div className="space-y-2 pt-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Form Status</label>

                     <div className="flex gap-2">
                        <Button 
                          variant={form.status === 'draft' ? 'default' : 'outline'}
                          className={cn("flex-1", form.status === 'draft' ? "bg-white/10 text-white" : "border-white/10")}
                          onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
                        >
                          Draft
                        </Button>
                        <Button 
                          variant={form.status === 'published' ? 'default' : 'outline'}
                          className={cn("flex-1", form.status === 'published' ? "bg-emerald-500 text-white" : "border-white/10")}
                          onClick={() => setForm(f => ({ ...f, status: 'published' }))}
                        >
                          Published
                        </Button>
                     </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center - Live Preview */}
        <main className="flex-1 bg-[#030303] flex flex-col p-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-xl">
             <div className="rounded-3xl border border-white/5 bg-[#0b0b10] p-10 shadow-2xl min-h-[500px]">
                <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">{form.name}</h2>
                
                <div className="space-y-8">
                  {form.fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-2xl">
                      <Plus className="h-10 w-10 text-white/10 mb-4" />
                      <p className="text-white/20 text-sm italic">Add fields from the sidebar to begin</p>
                    </div>
                  ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="form-fields">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-6"
                        >
                          {form.fields.map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  onClick={() => {
                                    setSelectedFieldId(field.id);
                                    setActiveTab('field');
                                  }}
                                  className={cn(
                                    "relative group transition-all rounded-xl p-4 -mx-4 cursor-pointer",
                                    selectedFieldId === field.id ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02]",
                                    snapshot.isDragging && "bg-white/10 border-[#6c47ff]/50 shadow-2xl z-50"
                                  )}
                                >
                                   <div className="flex justify-between mb-2">
                                     <label className="text-sm font-semibold text-white/70 block">
                                       {field.label}
                                       {field.required && <span className="text-red-400 ml-1">*</span>}
                                     </label>
                                     <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-md">
                                        <GripVertical className="h-4 w-4 text-white/20" />
                                     </div>
                                   </div>
                                   
                                   {field.type === 'textarea' ? (
                                     <div className="h-24 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white/30 text-sm">
                                       {field.placeholder || 'Long text entries...'}
                                     </div>
                                   ) : (
                                     <div className="h-11 w-full rounded-xl bg-white/5 border border-white/10 px-4 flex items-center text-white/30 text-sm">
                                       {field.placeholder || `Type your ${field.label.toLowerCase()}...`}
                                     </div>
                                   )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  )}

                  <div className="pt-8">
                    <Button className="w-full h-12 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                      {form.settings.buttonLabel || 'Submit Form'}
                    </Button>
                  </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
