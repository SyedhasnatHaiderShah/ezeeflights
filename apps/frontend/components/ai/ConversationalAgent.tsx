"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  Mic, 
  Paperclip, 
  Plane, 
  MapPin, 
  AlertTriangle, 
  Wallet, 
  Globe,
  MoreVertical,
  X,
  Bot,
  User,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message, processAIPrompt } from "@/data/mock-ai-agent";

export function ConversationalAgent() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Ezee AI, your personal travel advisor. How can I help you plan your next adventure today?",
      type: "text"
    }
  ]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [language, setLanguage] = React.useState("English");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "text"
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const response = await processAIPrompt(userMsg.content, language);
    setIsTyping(false);
    setMessages(prev => [...prev, response]);
  };

  return (
    <div className="flex h-[700px] w-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-brand-red/20" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Ezee AI Assistant</h3>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Agent</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-500 focus:outline-none"
          >
            <option>English</option>
            <option>Arabic</option>
            <option>Urdu</option>
            <option>French</option>
          </select>
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><MoreVertical className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-8 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full gap-4",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                m.role === "assistant" ? "bg-slate-900" : "bg-brand-red"
              )}>
                {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              
              <div className={cn(
                "flex max-w-[80%] flex-col gap-2",
                m.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "rounded-2xl px-5 py-3 text-sm font-medium leading-relaxed shadow-sm",
                  m.role === "assistant" ? "bg-slate-50 text-slate-700" : "bg-brand-red text-white"
                )}>
                  {m.content}
                </div>

                {/* Rich Cards */}
                {m.type === "flight_card" && (
                  <div className="mt-2 w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-brand-red" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Flight Found</span>
                      </div>
                      <span className="text-sm font-black text-brand-red">{m.metadata.currency} {m.metadata.price}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-slate-900">{m.metadata.airline}</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <MapPin className="h-3 w-3" /> {m.metadata.route}
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        {m.metadata.dates}
                      </div>
                    </div>
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800">
                      View Itinerary <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {m.type === "budget_table" && (
                  <div className="mt-2 w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100">
                    <div className="mb-3 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Budget Estimate</span>
                    </div>
                    <div className="space-y-2">
                      {m.metadata.items.map((item: any, i: number) => (
                        <div key={i} className={cn(
                          "flex justify-between py-1 text-xs font-bold",
                          item.category === "Total" ? "border-t border-slate-100 pt-2 text-slate-900" : "text-slate-500"
                        )}>
                          <span>{item.category}</span>
                          <span>{m.metadata.currency} {item.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {m.type === "doc_alert" && (
                  <div className="mt-2 w-full max-w-sm rounded-2xl border-2 border-amber-100 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest">{m.metadata.title}</span>
                    </div>
                    <p className="text-xs font-bold text-amber-800/70">{m.metadata.message}</p>
                  </div>
                )}

                {m.type === "qa_card" && (
                  <div className="mt-2 w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-100">
                    <div className="mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Destination Info</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{m.metadata.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>{m.metadata.distance} away</span>
                      <span>⭐ {m.metadata.rating}</span>
                    </div>
                    <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 underline">Call Facility</button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-slate-400"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 p-8 pt-4">
        <div className="relative flex items-center gap-2 rounded-[2rem] bg-slate-50 p-2 shadow-inner ring-1 ring-slate-100 transition-all focus-within:ring-brand-red/30">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-200"><Paperclip className="h-5 w-5" /></button>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI: 'Book me a flight to London...'"
            className="flex-1 bg-transparent px-2 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none"
          />
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-200"><Mic className="h-5 w-5" /></button>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red text-white shadow-lg shadow-brand-red/20 transition-all hover:scale-105 active:scale-95 disabled:grayscale"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <button onClick={() => setInput("Return flight to London in Dec")} className="hover:text-brand-red">Book Flight</button>
          <div className="h-3 w-px bg-slate-200" />
          <button onClick={() => setInput("Cost breakdown for Paris trip")} className="hover:text-brand-red">Plan Budget</button>
          <div className="h-3 w-px bg-slate-200" />
          <button onClick={() => setInput("Check my passport for UAE")} className="hover:text-brand-red">Verify Docs</button>
        </div>
      </div>
    </div>
  );
}
