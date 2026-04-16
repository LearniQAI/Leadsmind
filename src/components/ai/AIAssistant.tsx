'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am LeadsMind AI. How can I help you navigate the platform today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim().toLowerCase();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
    setIsLoading(true);

    // High Availability Local Knowledge Base
    const localResponses: Record<string, string> = {
      'hello': "Hi there! I'm LeadsMind AI. I can help you with your CRM, LMS, or Billing questions. What's on your mind?",
      'hi': "Hello! How can I assist you with Leadsmind today?",
      'help': "I can guide you through: \n- **CRM**: Managing leads.\n- **LMS**: Courses & progress.\n- **Billing**: Stripe & plans.",
      'crm': "LeadsMind CRM helps you manage leads through custom pipeline stages. You can assign owners to each lead and track progress in real-time.",
      'lead': "You can create leads manually or import them via CSV in the Contacts section (/contacts).",
      'lms': "Our LMS allows you to build courses, manage curriculum, and track student enrollment and progress.",
      'billing': "We offer Starter (Free), Pro ($97/mo), and Enterprise ($297/mo) plans. Each tier scales with your contact volume.",
      'pricing': "Check our pricing page (/pricing) for a detailed comparison of features across our plans.",
      'stripe': "You can connect your Stripe account in the Settings (/settings/billing) to start accepting payments.",
    };

    const fallbackKey = Object.keys(localResponses).find(key => userMessage.includes(key));

    // Instant local response for common keywords
    if (fallbackKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: localResponses[fallbackKey] }]);
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: input.trim() }]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm currently in 'Lite Mode' (API quota hit). I can still help you with CRM, LMS, and Billing! Try asking specifically about those." 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm having a small connection issue. Please try again or explore our dashboard!" 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to my brain right now. Try again in a second!" }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95",
          isOpen 
            ? "bg-white/10 border border-white/20 backdrop-blur-xl rotate-90" 
            : "bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] text-white shadow-[#6c47ff]/40"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-[#0b0b12] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="p-6 bg-linear-to-br from-[#6c47ff]/20 to-transparent border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-[#6c47ff] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6c47ff]/20 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">LeadsMind AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-white/40 font-bold uppercase">Ask me anything</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold",
                  m.role === 'user' ? "bg-white/10 text-white" : "bg-[#6c47ff]/20 text-[#6c47ff]"
                )}>
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-[#6c47ff] text-white rounded-tr-none" 
                    : "bg-white/5 text-white/80 rounded-tl-none border border-white/5"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] animate-pulse">
                <div className="h-8 w-8 rounded-lg shrink-0 bg-[#6c47ff]/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-[#6c47ff]/40" />
                </div>
                <div className="bg-white/3 p-4 rounded-2xl rounded-tl-none border border-white/5 text-white/20">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/3 border-t border-white/5">
            <div className="relative group">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-[#030305] border border-white/10 text-white rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c47ff]/50 focus:border-[#6c47ff]/30 transition-all placeholder:text-white/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-[#6c47ff] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[10px] text-center text-white/20 uppercase font-black tracking-widest">Powered by OpenAI API</p>
          </div>
        </div>
      )}
    </div>
  );
}
