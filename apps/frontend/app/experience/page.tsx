import * as React from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { TravelExperience } from "@/components/sections/TravelExperience";

export default function ExperiencePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow overflow-x-hidden bg-background pt-24 pb-16">
        <TravelExperience />
      </main>
      <Footer />
    </div>
  );
}
