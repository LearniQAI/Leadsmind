'use client';

import React, { useState } from 'react';
import {
   Sparkles,
   FileText,
   Plus,
   CheckCircle2,
   Trash2,
   Edit3,
   Brain,
   Loader2,
   ChevronRight,
   Zap,
   BarChart4,
   Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { generateAIQuestions } from '@/app/actions/lms';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AIQuizModal({ onImport }: { onImport: (qs: any[]) => void }) {
   const [step, setStep] = useState<'source' | 'config' | 'generating' | 'review'>('source');
   const [sourceText, setSourceText] = useState('');
   const [numQuestions, setNumQuestions] = useState(5);
   const [difficultyMix, setDifficultyMix] = useState(50);
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

   const handleGenerate = async () => {
      setStep('generating');
      setIsGenerating(true);

      try {
         const res = await generateAIQuestions(sourceText, {
            count: numQuestions,
            difficulty: difficultyMix > 70 ? 'advanced' : difficultyMix < 30 ? 'easy' : 'balanced'
         });

         setGeneratedQuestions(res);
         setStep('review');
      } catch (error) {
         toast.error('AI Processing Failure');
         setStep('config');
      } finally {
         setIsGenerating(false);
      }
   };

   return (
      <div className="p-8 space-y-8 min-h-[600px] flex flex-col">
         {/* Steps Progress */}
         <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <StepBadge active={step === 'source'} completed={!!sourceText && step !== 'source'} num={1} />
            <div className="h-px flex-1 bg-white/5" />
            <StepBadge active={step === 'config'} completed={step === 'review'} num={2} />
            <div className="h-px flex-1 bg-white/5" />
            <StepBadge active={step === 'review'} completed={false} num={3} />
         </div>

         {step === 'source' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-1">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Knowledge <span className="text-white/20">Source</span></h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Feed the AI with lesson content or raw notes</p>
               </div>
               <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste lesson transcript, PDF content, or specific educational material here..."
                  className="h-64 bg-white/[0.02] border-white/5 rounded-[32px] p-8 text-sm leading-relaxed scrollbar-none focus:ring-[#6c47ff]/50"
               />
               <Button
                  disabled={!sourceText}
                  onClick={() => setStep('config')}
                  className="w-full h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] rounded-2xl font-black italic uppercase gap-2"
               >
                  Initialize Extraction
                  <ChevronRight className="h-4 w-4" />
               </Button>
            </div>
         )}

         {step === 'config' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <Label icon={Layers}>Extraction Volume</Label>
                        <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none font-black italic">{numQuestions} Questions</Badge>
                     </div>
                     <Slider value={[numQuestions]} min={5} max={30} onValueChange={(val) => setNumQuestions(val[0])} />
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <Label icon={BarChart4}>Difficulty Intensity</Label>
                        <Badge className="bg-amber-500/10 text-amber-500 border-none font-black italic">
                           {difficultyMix > 70 ? 'Advanced Mastery' : difficultyMix < 30 ? 'Fundamental' : 'Synthesized'}
                        </Badge>
                     </div>
                     <Slider value={[difficultyMix]} min={0} max={100} onValueChange={(val) => setDifficultyMix(val[0])} />
                  </div>
               </div>

               <Button
                  onClick={handleGenerate}
                  className="w-full h-20 bg-linear-to-r from-[#6c47ff] to-[#a855f7] rounded-[32px] font-black italic uppercase text-lg shadow-[0_20px_50px_-10px_rgba(108,71,255,0.4)] hover:scale-[1.02] transition-all gap-3"
               >
                  <Sparkles className="h-6 w-6 animate-pulse" />
                  Forge Assessment with AI
               </Button>
            </div>
         )}

         {step === 'generating' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-700">
               <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-[#6c47ff]/10 border-t-[#6c47ff] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Brain className="h-10 w-10 text-[#6c47ff] animate-bounce" />
                  </div>
               </div>
               <div className="text-center">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Synthesizing <span className="text-white/20">Questions</span></h4>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-2 animate-pulse">Running semantic decomposition of knowledge source...</p>
               </div>
            </div>
         )}

         {step === 'review' && (
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden animate-in fade-in duration-700">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Review <span className="text-white/20">Extraction</span></h3>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Done</span>
               </div>

               <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 pr-2">
                  {generatedQuestions.map((q, idx) => (
                     <div key={idx} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 group hover:border-[#6c47ff]/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <Badge className="bg-[#6c47ff]/10 text-[#6c47ff] border-none text-[8px] font-black uppercase tracking-widest px-2">{q.type || 'multiple_choice'}</Badge>
                           <button className="text-white/10 hover:text-rose-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-4 italic leading-relaxed">{q.question_text}</h4>
                        <div className="grid grid-cols-2 gap-2 opacity-50 text-[10px] font-medium">
                           {q.options?.map((opt: any, oIdx: number) => (
                              <div key={oIdx} className={cn(
                                 "p-2 rounded-lg border border-white/5",
                                 oIdx === q.correct_answer && "bg-[#6c47ff]/20 border-[#6c47ff]/50 text-[#6c47ff]"
                              )}>
                                 {opt}
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-white/5 flex gap-4">
                  <Button
                     variant="outline"
                     onClick={() => setStep('config')}
                     className="h-14 font-black italic uppercase rounded-2xl bg-white/5 border-white/10 text-white/40"
                  >
                     Regenerate
                  </Button>
                  <Button
                     onClick={() => onImport(generatedQuestions)}
                     className="flex-1 h-14 bg-[#6c47ff] hover:bg-[#5b3ce0] font-black italic uppercase rounded-2xl gap-2 shadow-2xl"
                  >
                     Commit to Quiz Library
                     <Zap className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}

function StepBadge({ active, completed, num }: any) {
   return (
      <div className={cn(
         "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500",
         active ? "bg-[#6c47ff] text-white shadow-[0_10px_20px_-5px_rgba(108,71,255,0.5)] scale-110" :
            completed ? "bg-emerald-500 text-white" : "bg-white/5 text-white/20"
      )}>
         {completed ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-black italic text-sm">{num}</span>}
      </div>
   );
}

function Label({ icon: Icon, children }: any) {
   return (
      <div className="flex items-center gap-2">
         <Icon className="h-4 w-4 text-[#6c47ff]" />
         <span className="text-[10px] font-black uppercase tracking-widest text-white">{children}</span>
      </div>
   );
}
