'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  Trophy,
  Rocket,
  ShieldCheck,
  RotateCcw,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { GlassContainer } from '@/components/calendar/BookingPrimitives';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { submitQuizAttempt } from '@/app/actions/lms';
import { toast } from 'sonner';

interface Question {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
}

interface QuizPlayerProps {
  quiz: any;
  contactId: string;
  workspaceId: string;
}

export function QuizPlayer({ quiz, contactId, workspaceId }: QuizPlayerProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'intro' | 'taking' | 'result'>('intro');
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(quiz.time_limit_minutes * 60);
  const [qTimeLeft, setQTimeLeft] = useState<number>(quiz.time_limit_per_question || 0);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  // 1. Initial Logic (Randomization & Cooldown)
  useEffect(() => {
     if (quiz.questions) {
        let qs = [...quiz.questions];
        if (quiz.randomize_questions) qs = qs.sort(() => Math.random() - 0.5);
        if (quiz.randomize_answers) {
           qs = qs.map(q => ({
              ...q,
              options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : []
           }));
        }
        setShuffledQuestions(qs);
     }
  }, [quiz]);

  // 2. Global Timer
  useEffect(() => {
    let timer: any;
    if (status === 'taking' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev: number) => prev - 1), 1000);
    } else if (timeLeft === 0 && status === 'taking' && quiz.time_limit_minutes > 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  // 3. Per-Question Timer
  useEffect(() => {
      let qTimer: any;
      if (status === 'taking' && quiz.time_limit_per_question > 0) {
         if (qTimeLeft > 0) {
            qTimer = setInterval(() => setQTimeLeft((prev: number) => prev - 1), 1000);
         } else {
            // Auto-advance
            if (currentStep < shuffledQuestions.length - 1) {
                setCurrentStep((prev: number) => prev + 1);
                setQTimeLeft(quiz.time_limit_per_question);
            } else {
                handleSubmit();
            }
         }
      }
      return () => clearInterval(qTimer);
  }, [status, qTimeLeft, currentStep]);

  const handleAnswer = (val: any) => {
    setAnswers({ ...answers, [shuffledQuestions[currentStep].id]: val });
  };

  const currentQuestion = shuffledQuestions[currentStep];
  const progress = ((currentStep + 1) / shuffledQuestions.length) * 100;

  const handleSubmit = async () => {
    const res = await submitQuizAttempt({
      quizId: quiz.id,
      contactId,
      workspaceId,
      answers
    });
    setResult(res);
    setStatus('result');
  };

  if (status === 'intro') {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 animate-in fade-in zoom-in duration-700">
         <GlassContainer className="p-12 text-center relative overflow-hidden" withGlow>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-32 bg-linear-to-r from-transparent via-[#6c47ff] to-transparent opacity-50" />
            <div className="h-20 w-20 rounded-[32px] bg-[#6c47ff] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-[#6c47ff]/40">
               <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">{quiz.title}</h1>
            <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto italic">{quiz.description || 'Complete this assessment to validate your learning and unlock your certification.'}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-12">
               <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <span className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Questions</span>
                  <span className="text-2xl font-black text-white italic">{shuffledQuestions.length}</span>
               </div>
               <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <span className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Pass Mark</span>
                  <span className="text-2xl font-black text-[#6c47ff] italic">{quiz.passing_score}%</span>
               </div>
               <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <span className="block text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Time Limit</span>
                  <span className="text-2xl font-black text-white italic">{quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes}m` : '∞'}</span>
               </div>
            </div>

            <Button 
               onClick={() => setStatus('taking')}
               className="w-full h-16 bg-[#6c47ff] hover:bg-[#5b3ce0] text-white font-black italic uppercase text-lg rounded-[24px] shadow-2xl shadow-[#6c47ff]/20 gap-4"
            >
               Initiate Assessment
               <ChevronRight className="h-6 w-6" />
            </Button>
         </GlassContainer>
      </div>
    );
  }

  if (status === 'result') {
    const isPassed = result.status === 'passed';
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 animate-in slide-in-from-bottom-10 duration-700">
         <GlassContainer className="p-12 text-center" withGlow={isPassed}>
            <div className={cn(
              "h-24 w-24 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl",
              isPassed ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
            )}>
               {isPassed ? <Trophy className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>
            
            <Badge className={cn(
              "mb-4 border-none text-[10px] font-black uppercase tracking-widest px-4 py-1",
              isPassed ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              {isPassed ? 'ASSESSMENT PASSED' : 'BENCHMARK NOT MET'}
            </Badge>
            
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-2">{result.score}%</h2>
            <p className="text-white/40 text-lg mb-10 italic">
               {isPassed ? "Outstanding! You've successfully masterted this unit's concepts." : "Not quite there yet. Review the course material and try again."}
            </p>

             <div className="flex flex-col gap-4">
                {isPassed ? (
                   <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black italic uppercase rounded-2xl gap-2 shadow-xl shadow-emerald-500/20">
                      <Rocket className="h-5 w-5" />
                      Continue Education
                   </Button>
                ) : (
                   <>
                      <Button 
                         asChild
                         className="w-full h-16 bg-white text-black font-black italic uppercase rounded-2xl gap-3 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all"
                      >
                         <Link href={`/book/instructor?email=${contactId}&subject=Remediation-${quiz.id}`}>
                            <Users className="h-5 w-5" />
                            Book 1-on-1 Coaching
                         </Link>
                      </Button>
                      <Button 
                        onClick={() => { setStatus('intro'); setCurrentStep(0); setAnswers({}); }}
                        className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black italic uppercase rounded-2xl gap-2"
                      >
                         <RotateCcw className="h-5 w-5" />
                         Reset Attempt
                      </Button>
                   </>
                )}
             </div>
         </GlassContainer>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
       <div className="mb-12 flex items-center justify-between">
          <div className="flex-1 mr-8">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-[#6c47ff] uppercase tracking-widest italic">Progress: {Math.round(progress)}%</span>
                {quiz.time_limit_minutes > 0 && (
                   <div className="flex items-center gap-2 text-white/40">
                      <Timer className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                   </div>
                )}
             </div>
             <Progress value={progress} className="h-1 bg-white/5" indicatorClassName="bg-[#6c47ff]" />
          </div>
          <Button variant="ghost" className="text-white/20 hover:text-white rounded-xl h-10 px-4">
             <XCircle className="h-4 w-4 mr-2" />
             Exit
          </Button>
       </div>

       <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500" key={currentStep}>
          <div className="space-y-4">
             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-white/40">Question {currentStep + 1} / {shuffledQuestions.length}</Badge>
             <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-tight">{currentQuestion.question_text}</h3>
             {currentQuestion.type === 'scenario' && (
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-white/60 text-sm leading-relaxed italic animate-in fade-in slide-in-from-top-2 duration-700">
                   {currentQuestion.options?.[0]}
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 gap-4">
             {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((opt: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={cn(
                    "group flex items-center justify-between p-8 rounded-[32px] border transition-all duration-500 text-left",
                    answers[currentQuestion.id] === idx 
                      ? "bg-[#6c47ff] border-[#6c47ff] shadow-2xl shadow-[#6c47ff]/20" 
                      : "bg-[#0b0b14] border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                  )}
                >
                   <span className={cn(
                     "text-xl font-bold tracking-tight",
                     answers[currentQuestion.id] === idx ? "text-white" : "text-white/60 group-hover:text-white"
                   )}>{opt}</span>
                   <div className={cn(
                      "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                      answers[currentQuestion.id] === idx ? "bg-white border-white" : "border-white/10 group-hover:border-white/20"
                   )}>
                      {answers[currentQuestion.id] === idx && <CheckCircle2 className="h-5 w-5 text-[#6c47ff]" />}
                   </div>
                </button>
             ))}

             {currentQuestion.type === 'multiple_answers' && currentQuestion.options?.map((opt: string, idx: number) => {
                const isSelected = Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(idx);
                return (
                  <button 
                    key={idx}
                    onClick={() => {
                       let currentSelected = Array.isArray(answers[currentQuestion.id]) ? [...answers[currentQuestion.id]] : [];
                       if (isSelected) {
                          currentSelected = currentSelected.filter(i => i !== idx);
                       } else {
                          currentSelected.push(idx);
                       }
                       handleAnswer(currentSelected);
                    }}
                    className={cn(
                      "group flex items-center justify-between p-8 rounded-[32px] border transition-all duration-500 text-left",
                      isSelected 
                        ? "bg-[#6c47ff] border-[#6c47ff] shadow-2xl shadow-[#6c47ff]/20" 
                        : "bg-[#0b0b14] border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
                    )}
                  >
                     <span className={cn(
                       "text-xl font-bold tracking-tight",
                       isSelected ? "text-white" : "text-white/60 group-hover:text-white"
                     )}>{opt}</span>
                     <div className={cn(
                        "h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all",
                        isSelected ? "bg-white border-white" : "border-white/10 group-hover:border-white/20"
                     )}>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-[#6c47ff]" />}
                     </div>
                  </button>
                );
             })}

             {currentQuestion.type === 'short_answer' && (
                <div className="space-y-4">
                   <div className="relative group">
                      <div className="absolute -inset-1 bg-linear-to-r from-[#6c47ff] to-transparent rounded-[32px] blur-sm opacity-10 group-focus-within:opacity-30 transition-opacity" />
                      <Input 
                         autoFocus
                         placeholder="Type your answer here..."
                         className="relative h-20 bg-[#0b0b14] border-white/10 rounded-[32px] px-8 text-2xl font-bold text-white placeholder:text-white/10 focus-visible:ring-[#6c47ff]"
                         value={answers[currentQuestion.id] || ''}
                         onChange={(e) => handleAnswer(e.target.value)}
                      />
                   </div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic ml-4">The system will auto-grade based on required keywords.</p>
                </div>
             )}

             {currentQuestion.type === 'true_false' && (
                <div className="flex gap-4">
                   {['true', 'false'].map((val) => (
                      <button 
                        key={val}
                        onClick={() => handleAnswer(val)}
                        className={cn(
                          "flex-1 p-12 rounded-[40px] border transition-all duration-500 font-black italic uppercase h-64 flex flex-col items-center justify-center gap-4",
                          answers[currentQuestion.id] === val 
                            ? "bg-[#6c47ff] border-[#6c47ff] text-white shadow-2xl shadow-[#6c47ff]/20" 
                            : "bg-[#0b0b14] border-white/5 text-white/20 hover:text-white/40"
                        )}
                      >
                         <div className={cn(
                           "h-16 w-16 rounded-full border-4 flex items-center justify-center mb-4 transition-all",
                           answers[currentQuestion.id] === val ? "bg-white border-white" : "border-white/5"
                         )}>
                            {answers[currentQuestion.id] === val && <CheckCircle2 className="h-8 w-8 text-[#6c47ff]" />}
                         </div>
                         <span className="text-2xl tracking-[0.2em]">{val}</span>
                      </button>
                   ))}
                </div>
             )}
          </div>

          <div className="pt-10 flex items-center justify-between">
             <Button 
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev: number) => prev - 1)}
                variant="ghost" 
                className="text-white/40 hover:text-white rounded-2xl h-14 px-8 font-black uppercase italic"
             >
                <ChevronLeft className="h-5 w-5 mr-4" />
                Previous Question
             </Button>
             
             {currentStep < shuffledQuestions.length - 1 ? (
                <Button 
                  disabled={answers[currentQuestion.id] === undefined}
                  onClick={() => setCurrentStep((prev: number) => prev + 1)}
                  className="bg-[#6c47ff] hover:bg-[#5b3ce0] text-white rounded-2xl h-14 px-10 font-black uppercase italic shadow-xl shadow-[#6c47ff]/20 gap-4"
                >
                   Forward Progression
                   <ChevronRight className="h-5 w-5" />
                </Button>
             ) : (
                <Button 
                  disabled={answers[currentQuestion.id] === undefined}
                  onClick={handleSubmit}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-14 px-10 font-black uppercase italic shadow-xl shadow-emerald-500/20 gap-4"
                >
                   Finalize Submission
                   <Rocket className="h-5 w-5" />
                </Button>
             )}
          </div>
       </div>
    </div>
  );
}
