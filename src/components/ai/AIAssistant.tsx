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

    // High Availability Local Knowledge Base (Trained on new features)
    const localResponses: Record<string, string> = {
      'hello': "Hi! I'm your Leadsmind assistant. I can help you with CRM, Automation, or Lead Capture. What's on your mind?",
      'automation': "Our new Automation Builder is a powerhouse! It uses a 'sequential vertical flow' to make things easy. You can Add Actions (like Move in Pipeline or Notify Team) and set Decisions (If/Else) or Pauses (Wait).",
      'webhook': "To secure your lead capture, we've implemented Webhook Secrets. You can find and regenerate your unique secret in Settings > Automation. Use it in the header `Authorization: Bearer [Secret]` for custom integrations.",
      'tracking': "Need to capture leads from your website? Check the 'Smart Tracker' in Settings > Automation. Just copy the script into your footer, and we'll detect your forms automatically!",
      'pipeline': "You can now automate your sales cycle! Set a trigger for 'Contact Created' or 'Form Filled Out' and add a 'Move in Pipeline' action to keep things moving.",
      'crm': "Leadsmind CRM is optimized for conversions. With the new 'Smart Leads' API, you can push leads from anywhere securely.",
      'billing': "We have three simple tiers: Starter (Free), Pro ($97/mo), and Enterprise ($297/mo). You can manage this in your Billing Settings.",
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
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm experiencing a brief brain freeze. Try asking specifically about 'automation', 'webhook', or 'billing'!" }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "My connection is a bit spotty. Try again in a second!" }]);
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
          "h-16 w-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group overflow-hidden relative",
          isOpen 
            ? "bg-white/10 border border-white/20 backdrop-blur-3xl" 
            : "bg-linear-to-br from-[#6c47ff] to-[#4c29ff] text-white shadow-[#6c47ff]/40"
        )}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="h-7 w-7 relative z-10" /> : <Sparkles className="h-7 w-7 relative z-10" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[380px] sm:w-[420px] h-[600px] max-h-[85vh] flex flex-col bg-[#05050a]/90 border border-white/10 rounded-[40px] overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in slide-in-from-right-10 fade-in duration-500">
          
          {/* Header */}
          <div className="p-8 bg-linear-to-b from-primary/10 to-transparent border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
               <Zap size={80} className="text-primary fill-primary" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 text-white">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">IntelligenceHub</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Always Learning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-4 max-w-[90%] group",
                  m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "h-10 w-10 min-w-[40px] rounded-xl flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-110",
                  m.role === 'user' ? "bg-white/10 text-white" : "bg-primary/20 text-primary border border-primary/20"
                )}>
                  {m.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all",
                  m.role === 'user' 
                    ? "bg-primary text-white rounded-tr-none font-medium" 
                    : "bg-white/5 text-white/90 rounded-tl-none border border-white/5"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 max-w-[90%] items-end">
                <div className="h-10 w-10 min-w-[40px] rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Bot className="h-5 w-5 text-primary/40" />
                </div>
                <div className="p-4 px-6 rounded-2xl rounded-tl-none border border-white/5 bg-white/5 text-primary flex items-center gap-2">
                   <span className="text-sm font-black tracking-[0.3em] animate-pulse">....</span>
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
