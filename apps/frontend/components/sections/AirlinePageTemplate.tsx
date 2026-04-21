"use client";

import * as React from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FAQSection } from "@/components/sections/FAQSection";
import { BookingForm } from "@/components/booking-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface AirlineSection { title: string; paragraphs: string[]; }
export interface AirlineData { topImage?: string; hero: { title: React.ReactNode; description: string; }; intro: { title: string; text: string; }; sections: AirlineSection[]; conclusion: string; }

export function AirlinePageTemplate({ data }: { data: AirlineData }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow pt-24">
        <section className="bg-gradient-to-r from-[#072f66] to-[#1d4f91] px-6 py-16 text-white"><div className="mx-auto max-w-6xl space-y-4"><p className="text-sm uppercase tracking-[0.2em] text-white/70">Airline Partner</p><h1 className="text-5xl font-black">Fly with {data.intro.title}</h1><p className="max-w-2xl text-white/85">{data.hero.description}</p></div></section>

        <section className="mx-auto max-w-6xl space-y-8 px-6 py-8">
          <Tabs defaultValue="overview" className="space-y-5">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="routes">Popular Routes</TabsTrigger><TabsTrigger value="deals">Deals</TabsTrigger><TabsTrigger value="about">About</TabsTrigger></TabsList>
            <TabsContent value="overview"><p>{data.intro.text}</p><BookingForm /></TabsContent>
            <TabsContent value="routes"><div className="grid gap-3 md:grid-cols-3">{['NYC → LHR','DXB → JFK','LAX → NRT'].map((r) => <div key={r} className="rounded-xl border p-3"><div className="mb-2 h-24 rounded bg-slate-100" /><p className="font-medium">{r}</p><span className="text-sm text-brand-red">from $499</span></div>)}</div></TabsContent>
            <TabsContent value="deals"><div className="grid gap-3 md:grid-cols-4">{['Seats','Meals','Entertainment','WiFi'].map((a) => <div key={a} className="rounded-xl border p-4 text-center">✈️ {a}</div>)}</div></TabsContent>
            <TabsContent value="about"><div className="space-y-3">{data.sections.map((s) => <div key={s.title}><h3 className="font-semibold">{s.title}</h3><p className="text-sm text-slate-600">{s.paragraphs[0]}</p></div>)}</div></TabsContent>
          </Tabs>
          <FAQSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
