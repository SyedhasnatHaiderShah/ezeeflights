"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquarePlus,
  Ticket,
  Search,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { formatDomainText, getDomainConfig } from "@/lib/utils/domain";

const faqs = [
  {
    q: "How do I request a refund?",
    a: "Create a support ticket with the Refund category and include your booking ID. Refunds take between 5 to 7 business days to process once approved.",
  },
  {
    q: "How long does support take?",
    a: "Our response time depends on the ticket priority. We provide a 1 hour first response for critical cases and a 24-hour turnaround for general inquiries.",
  },
  {
    q: "Can I attach documents?",
    a: "Yes, you can upload PDFs, JPGs, and PNGs while creating a new support ticket or when sending a reply to an agent.",
  },
  {
    q: "How do I change my travel dates?",
    a: "You can manage or request date modifications on the My Trips page or by creating a support ticket under the Change of Date category.",
  },
  {
    q: "What is the baggage policy?",
    a: "Baggage allowances vary by airline, route, and cabin class. Please check your ticket voucher details in My Trips for complete info.",
  },
];

export default function SupportHomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  const fd = (text: string) => formatDomainText(text, hostname, t);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 select-none"
      >
        <span className="inline-flex items-center gap-1.5 bg-redmix/10 text-redmix text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-redmix/20">
          <Headphones className="h-3.5 w-3.5" /> {fd(t("Ezee Support Desk"))}
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase">
          How can we{" "}
          <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent">
            help you?
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-xs md:text-sm font-semibold text-muted-foreground leading-relaxed">
          Search frequently asked questions, check your ticket status, or open a new support inquiry directly with our help center.
        </p>
      </motion.div>

      {/* Main Feature Cards & Search */}
      <div className="space-y-6">
        {/* Help Actions & Search */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {/* Custom Stylized Search Field */}
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted-foreground/60 select-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 rounded-xl border border-border/80 pl-12 pr-4 bg-muted/30 focus:bg-card focus:outline-none focus:ring-2 focus:ring-redmix/30 transition-all font-semibold text-sm"
              placeholder="Search common questions, categories, policies..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/support/tickets/new"
              className="flex items-center justify-between p-4 bg-muted/40 hover:bg-redmix/5 border border-border/80 hover:border-redmix/30 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-redmix/10 text-redmix group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Create Support Ticket
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Submit a personalized request
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/support/tickets"
              className="flex items-center justify-between p-4 bg-muted/40 hover:bg-redmix/5 border border-border/80 hover:border-redmix/30 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-redmix/10 text-redmix group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    My Tickets
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Check response status
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 select-none">
            <HelpCircle className="h-5 w-5 text-redmix" />
            <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-bold text-foreground">No matches found</p>
                <p className="text-xs text-muted-foreground font-medium">
                  Try searching for a different keyword or category.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <motion.article
                  key={faq.q}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 rounded-xl border border-border/60 hover:border-border transition-all bg-muted/20 hover:bg-muted/40 select-none"
                >
                  <h3 className="font-bold text-foreground text-sm flex items-start gap-2.5 leading-relaxed">
                    <span className="text-redmix font-black text-xs select-none">Q:</span>
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground font-medium pl-6 leading-relaxed select-none">
                    {faq.a}
                  </p>
                </motion.article>
              ))
            )}
          </div>
        </div>

        {/* Support Perks Incentive card */}
        <div className="bg-slate-950 border border-white/10 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl select-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-white/10 border border-white/10 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-yellow" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                24/7 Verified Safe Helpdesk
              </h4>
              <p className="text-[10px] font-semibold text-white/60 leading-relaxed max-w-sm">
                Every ticket is encrypted and monitored directly by our experienced travel experts for maximum quality assurance.
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/10 px-2 py-0.5 rounded-full select-none whitespace-nowrap">
            Priority Access
          </span>
        </div>
      </div>
    </div>
  );
}
