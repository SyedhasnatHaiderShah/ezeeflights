import * as React from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { CuratedJourneys } from "@/components/sections/CuratedJourneys";

export default function JourneysPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow overflow-x-hidden bg-background pt-24 pb-16">
        <CuratedJourneys />
      </main>
      <Footer />
    </div>
  );
}
