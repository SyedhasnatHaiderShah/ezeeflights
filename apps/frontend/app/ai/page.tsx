"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot, ShieldCheck, Globe, Zap, Languages, Users } from "lucide-react";
import { ConversationalAgent } from "@/components/ai/ConversationalAgent";

export default function AiAssistantPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-10">
      <div className="mx-auto max-w-screen-xl px-4 md:px-6">
        
        {/* Hero Section */}
        <div className="mb-12 flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-red/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-red"
            >
              <Sparkles className="h-4 w-4" />
              Flagship AI Feature
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tight text-slate-900 md:text-7xl"
            >
              Meet <span className="text-brand-red">Ezee AI</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl text-xl font-medium leading-relaxed text-slate-500"
            >
              Your intelligent, context-aware travel companion. From natural language booking to real-time document verification, Ezee AI handles everything.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
              {[
                { icon: Zap, label: "Instant Booking" },
                { icon: ShieldCheck, label: "Secure Docs" },
                { icon: Globe, label: "Context Aware" },
                { icon: Languages, label: "Multi-language" },
                { icon: Users, label: "Group Planning" },
                { icon: Bot, label: "24/7 Expert" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                  <f.icon className="h-4 w-4 text-brand-red" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{f.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[500px]"
          >
            <ConversationalAgent />
          </motion.div>
        </div>

        {/* Capabilities Section */}
        <div className="grid gap-8 border-t border-slate-200 pt-16 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">Natural Language Booking</h3>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              "Book me a return flight to London in December under AED 3,000." Just type what you want, and Ezee AI parses, searches, and presents the best results instantly.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">Document Intelligence</h3>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              AI reviews your passport expiry, visa requirements, and destination entry rules to ensure you never miss a document check.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">Total Trip Budgeting</h3>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              Get an instant cost breakdown including flights, hotels, transfers, meals, and local attractions tailored to your preferences.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
