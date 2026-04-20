'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
   Plus,
   Trash2,
   PlusCircle,
   HelpCircle,
   CheckCircle2,
   ChevronRight,
   Settings,
   Brain,
   Layout,
   Type,
   FileText,
   Video,
   Library,
   Star,
   Loader2,
   Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { saveQuestions, saveQuiz } from '@/app/actions/lms';
import { cn } from '@/lib/utils';
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
   DialogTrigger
} from '@/components/ui/dialog';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue
} from '@/components/ui/select';
import { QuizSettingsPanel } from './QuizSettingsPanel';
import { AIQuizModal } from './AIQuizModal';

interface Question {
   id: string;
   type: string;
   question_text: string;
   points: number;
   options: string[];
   correct_answer: any;
   difficulty?: string;
   is_bank_question?: boolean;
}

interface QuizBuilderProps {
   quizId: string;
   initialQuestions: Question[];
}

export function QuizBuilder({ quizId, initialQuestions }: QuizBuilderProps) {
   const [showSettings, setShowSettings] = useState(false);
   const [showAIModal, setShowAIModal] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
   const [quizState, setQuizState] = useState<any>({
      passing_score: 80,
      max_retakes: 3,
      time_limit_minutes: 30
   });

   const updateQuizConfig = (key: string, val: any) => {
      setQuizState({ ...quizState, [key]: val });
   };

   const addQuestion = (type: string) => {
      const newQuestion: Question = {
         id: Math.random().toString(36).substr(2, 9),
         type,
         question_text: 'New Question',
         points: 1,
         options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] :
            type === 'scenario' ? ['Scenario details here...'] : [],
         correct_answer: type === 'true_false' ? 'true' : type === 'multiple_choice' ? 0 : ''
      };
      setQuestions([...questions, newQuestion]);
      toast.success(`${type.replace('_', ' ')} added to curriculum`);
   };

   const removeQuestion = (id: string) => {
      setQuestions(questions.filter(q => q.id !== id));
      toast.info('Item removed from architect');
   };

   const handleSave = async () => {
      setIsSaving(true);
      try {
         await saveQuestions(quizId, questions);
         toast.success('Assessment architecture synchronized');
      } catch (e) {
         toast.error('Failed to synchronize engine');
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="space-y-10 py-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#0b0b14] border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-[#6c47ff]/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-5 rounded-md bg-[#6c47ff]/10 flex items-center justify-center border border-[#6c47ff]/20">
                     <Brain className="h-3.5 w-3.5 text-[#6c47ff]" />
                  </div>
                  <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-[0.2em]">Adaptive Assessment Engine</span>
               </div>
               <h2 className="text-4xl font-black tracking-tighter text-white italic uppercase">Quiz <span className="text-white/20">Architect</span></h2>
               <p className="text-white/40 text-sm font-medium mt-1 italic">Build complex assessments with AI-driven intelligence.</p>
            </div>

            <div className="flex items-center gap-3 relative z-10">
               <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
                  <DialogTrigger
                     render={
                        <Button
                           className="bg-linear-to-r from-[#6c47ff] to-[#a855f7] text-white rounded-xl gap-2 font-black italic uppercase px-6 h-14 hover:scale-[1.02] shadow-[0_10px_30px_-5px_rgba(108,71,255,0.4)] transition-all"
                        >
                           <Sparkles className="h-4 w-4" />
                           Launch Intelligence
                        </Button>
                     }
                  />
                  <DialogContent className="max-w-3xl bg-[#050508] border-white/5 p-0 rounded-[40px] overflow-hidden">
                     <AIQuizModal onImport={(qs) => {
                        setQuestions([...questions, ...qs]);
                        setShowAIModal(false);
                        toast.success(`Successfully imported ${qs.length} AI-generated questions`);
                     }} />
                  </DialogContent>
               </Dialog>

               <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger
                     render={
                        <Button
                           variant="outline"
                           className="bg-white/5 border-white/10 text-white rounded-xl gap-2 font-bold px-6 h-14 hover:bg-white/10"
                        >
                           <Settings className="h-4 w-4" />
                           Configuration
                        </Button>
                     }
                  />
                  <DialogContent className="max-w-4xl bg-[#0b0b14] border-white/5 p-0 rounded-[40px] overflow-hidden">
                     <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Assessment <span className="text-white/20">Control Center</span></DialogTitle>
                     </DialogHeader>
                     <QuizSettingsPanel quiz={quizState} onUpdate={updateQuizConfig} />
                     <DialogFooter className="p-8 bg-white/[0.02] border-t border-white/5">
                        <Button
                           onClick={async () => {
                              setIsSaving(true);
                              await saveQuiz({ ...quizState, quizId });
                              setIsSaving(false);
                              setShowSettings(false);
                              toast.success('Core assessment logic updated');
                           }}
                           className="w-full h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black italic uppercase rounded-2xl"
                        >
                           {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Apply Intelligence Changes'}
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>

               <Button
                  disabled={isSaving}
                  onClick={handleSave}
                  className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-xl gap-2 font-black italic uppercase text-xs h-14 px-8 shadow-xl shadow-[#6c47ff]/20"
               >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                     <>
                        <PlusCircle className="h-4 w-4" />
                        Synchronize Engine
                     </>
                  )}
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
               <div className="p-8 rounded-[40px] bg-[#0b0b14] border border-white/5 space-y-6 shadow-xl">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block border-b border-white/5 pb-4">Standard Library</span>
                  <div className="grid grid-cols-1 gap-2">
                     <ToolItem icon={Type} label="Multiple Choice" onClick={() => addQuestion('multiple_choice')} />
                     <ToolItem icon={Type} label="Multiple Answers" onClick={() => addQuestion('multiple_answers')} />
                     <ToolItem icon={PlusCircle} label="True / False" onClick={() => addQuestion('true_false')} />
                     <ToolItem icon={FileText} label="Short Answer" onClick={() => addQuestion('short_answer')} />
                     <ToolItem icon={Layout} label="Essay Response" onClick={() => addQuestion('essay')} />
                  </div>

                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block border-b border-white/5 pb-4 pt-4">Advanced Types</span>
                  <div className="grid grid-cols-1 gap-2">
                     <ToolItem icon={Library} label="Matching Pairs" onClick={() => addQuestion('matching')} />
                     <ToolItem icon={Layout} label="Sequence Order" onClick={() => addQuestion('ordering')} />
                     <ToolItem icon={Video} label="Video Response" onClick={() => addQuestion('video_response')} />
                     <ToolItem icon={HelpCircle} label="Scenario Base" onClick={() => addQuestion('scenario')} />
                     <ToolItem icon={Star} label="Rating Scale" onClick={() => addQuestion('rating')} />
                  </div>
               </div>

               <div className="p-8 rounded-[40px] bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                     <HelpCircle className="h-48 w-48 text-white" />
                  </div>
                  <h4 className="text-xl font-black text-white italic uppercase mb-2">AI Generator</h4>
                  <p className="text-white/70 text-[11px] leading-relaxed relative z-10">
                     Generate 5 high-fidelity questions based on existing lesson context instantly.
                  </p>
                  <Button
                     onClick={() => setShowAIModal(true)}
                     className="w-full mt-6 bg-white text-[#6c47ff] font-black italic uppercase text-[10px] rounded-xl h-10 tracking-widest gap-2"
                  >
                     <Brain className="h-3.5 w-3.5" />
                     Launch AI
                  </Button>
               </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
               {questions.map((q, idx) => (
                  <Card key={q.id} className="bg-[#0b0b14] border-white/5 rounded-[32px] overflow-hidden group/card hover:border-[#6c47ff]/30 transition-all duration-500 shadow-xl">
                     <CardContent className="p-0">
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.01]">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-2xl bg-[#6c47ff] flex items-center justify-center text-white text-lg font-black italic">
                                 {idx + 1}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white/40">{q.type.replace('_', ' ')}</Badge>
                                    <Select
                                       defaultValue={q.difficulty || 'easy'}
                                       onValueChange={(val) => {
                                          const newQs = [...questions];
                                          newQs[idx].difficulty = val ?? undefined;
                                          setQuestions(newQs);
                                       }}
                                    >
                                       <SelectTrigger className="h-5 bg-white/5 border-white/10 text-[9px] font-bold uppercase py-0 px-2 rounded-md">
                                          <SelectValue />
                                       </SelectTrigger>
                                       <SelectContent className="bg-[#0b0b14] border-white/10">
                                          <SelectItem value="easy">Easy</SelectItem>
                                          <SelectItem value="intermediate">Intermediate</SelectItem>
                                          <SelectItem value="advanced">Advanced</SelectItem>
                                       </SelectContent>
                                    </Select>
                                    <button
                                       onClick={() => {
                                          const newQs = [...questions];
                                          newQs[idx].is_bank_question = !newQs[idx].is_bank_question;
                                          setQuestions(newQs);
                                       }}
                                       className={cn(
                                          "h-5 px-2 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all",
                                          q.is_bank_question ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-white/5 border-white/10 text-white/20"
                                       )}
                                    >
                                       {q.is_bank_question ? 'Bank Enabled' : 'Static Question'}
                                    </button>
                                 </div>
                                 <Input
                                    value={q.question_text}
                                    onChange={(e) => {
                                       const newQs = [...questions];
                                       newQs[idx].question_text = e.target.value;
                                       setQuestions(newQs);
                                    }}
                                    className="bg-transparent border-none p-0 text-xl font-black text-white italic tracking-tight focus-visible:ring-0 h-auto"
                                 />
                              </div>
                           </div>
                           <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="text-white/20 hover:text-rose-500 rounded-xl" onClick={() => removeQuestion(q.id)}>
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </div>

                        <div className="p-8 space-y-6">
                           {q.type === 'multiple_choice' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className={cn(
                                       "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500",
                                       q.correct_answer === oIdx ? "bg-[#6c47ff]/10 border-[#6c47ff]" : "bg-white/[0.02] border-white/5"
                                    )}>
                                       <button
                                          onClick={() => {
                                             const newQs = [...questions];
                                             newQs[idx].correct_answer = oIdx;
                                             setQuestions(newQs);
                                          }}
                                          className={cn(
                                             "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                             q.correct_answer === oIdx ? "border-[#6c47ff] bg-[#6c47ff]" : "border-white/10"
                                          )}
                                       >
                                          {q.correct_answer === oIdx && <CheckCircle2 className="h-4 w-4 text-white" />}
                                       </button>
                                       <Input
                                          value={opt}
                                          onChange={(e) => {
                                             const newQs = [...questions];
                                             newQs[idx].options[oIdx] = e.target.value;
                                             setQuestions(newQs);
                                          }}
                                          className="bg-transparent border-none text-sm font-medium text-white/70 p-0 focus-visible:ring-0"
                                       />
                                    </div>
                                 ))}
                                 <button
                                    onClick={() => {
                                       const newQs = [...questions];
                                       newQs[idx].options.push(`New Option ${q.options.length + 1}`);
                                       setQuestions(newQs);
                                    }}
                                    className="flex items-center justify-center p-4 rounded-2xl border border-dashed border-white/10 hover:border-[#6c47ff]/50 hover:bg-[#6c47ff]/5 transition-all text-[10px] font-black uppercase text-white/20 hover:text-[#6c47ff]"
                                 >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add New Choice
                                 </button>
                              </div>
                           )}

                           {q.type === 'true_false' && (
                              <div className="flex gap-4">
                                 {['true', 'false'].map((val) => (
                                    <button
                                       key={val}
                                       onClick={() => {
                                          const newQs = [...questions];
                                          newQs[idx].correct_answer = val;
                                          setQuestions(newQs);
                                       }}
                                       className={cn(
                                          "flex-1 p-6 rounded-3xl border transition-all duration-500 font-black italic uppercase text-xs tracking-widest",
                                          q.correct_answer === val ? "bg-[#6c47ff] border-[#6c47ff] text-white" : "bg-white/[0.02] border-white/5 text-white/20"
                                       )}
                                    >
                                       {val}
                                    </button>
                                 ))}
                              </div>
                           )}

                           {q.type === 'multiple_answers' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {q.options.map((opt, oIdx) => {
                                    const isCorrect = Array.isArray(q.correct_answer) && q.correct_answer.includes(oIdx);
                                    return (
                                       <div key={oIdx} className={cn(
                                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500",
                                          isCorrect ? "bg-[#6c47ff]/10 border-[#6c47ff]" : "bg-white/[0.02] border-white/5"
                                       )}>
                                          <button
                                             onClick={() => {
                                                const newQs = [...questions];
                                                let currentCorrect = Array.isArray(q.correct_answer) ? [...q.correct_answer] : [];
                                                if (currentCorrect.includes(oIdx)) {
                                                   currentCorrect = currentCorrect.filter(i => i !== oIdx);
                                                } else {
                                                   currentCorrect.push(oIdx);
                                                }
                                                newQs[idx].correct_answer = currentCorrect;
                                                setQuestions(newQs);
                                             }}
                                             className={cn(
                                                "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                isCorrect ? "border-[#6c47ff] bg-[#6c47ff]" : "border-white/10"
                                             )}
                                          >
                                             {isCorrect && <CheckCircle2 className="h-4 w-4 text-white" />}
                                          </button>
                                          <Input
                                             value={opt}
                                             onChange={(e) => {
                                                const newQs = [...questions];
                                                newQs[idx].options[oIdx] = e.target.value;
                                                setQuestions(newQs);
                                             }}
                                             className="bg-transparent border-none text-sm font-medium text-white/70 p-0 focus-visible:ring-0"
                                          />
                                       </div>
                                    );
                                 })}
                              </div>
                           )}

                           {q.type === 'short_answer' && (
                              <div className="space-y-4">
                                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Accepted Keywords (Comma Separated)</span>
                                 <Input
                                    placeholder="e.g. key focus, master, engine"
                                    value={q.correct_answer || ''}
                                    onChange={(e) => {
                                       const newQs = [...questions];
                                       newQs[idx].correct_answer = e.target.value;
                                       setQuestions(newQs);
                                    }}
                                    className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                                 />
                              </div>
                           )}

                           {q.type === 'scenario' && (
                              <div className="space-y-4">
                                 <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-widest">Case Background</span>
                                 <textarea
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-1 focus:ring-[#6c47ff] outline-none"
                                    value={q.options[0] || ''}
                                    onChange={(e) => {
                                       const newQs = [...questions];
                                       newQs[idx].options[0] = e.target.value;
                                       setQuestions(newQs);
                                    }}
                                 />
                              </div>
                           )}

                           {(q.type === 'essay' || q.type === 'video_response') && (
                              <div className="p-12 border border-dashed border-white/5 rounded-[32px] text-center bg-white/[0.01]">
                                 <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Manual Verification Required</span>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               ))}

               {questions.length === 0 && (
                  <div className="p-32 border border-dashed border-white/5 rounded-[60px] text-center bg-[#0b0b14]/50">
                     <Layout className="h-12 w-12 text-white/5 mx-auto mb-6" />
                     <p className="text-sm font-black text-white/20 uppercase tracking-[0.3em] italic">Architecture is empty. Select a tool to begin.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

function ToolItem({ icon: Icon, label, onClick }: any) {
   return (
      <button
         onClick={onClick}
         className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#6c47ff] hover:bg-[#6c47ff]/10 transition-all group"
      >
         <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-white/20 group-hover:text-[#6c47ff]" />
            <span className="text-[11px] font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-tight">{label}</span>
         </div>
         <ChevronRight className="h-3 w-3 text-white/10 group-hover:text-[#6c47ff] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
      </button>
   );
}
