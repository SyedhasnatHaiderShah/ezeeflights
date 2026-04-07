import * as React from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Reviews } from "@/components/sections/Reviews";

export default function ReviewsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow overflow-x-hidden bg-background pt-24 pb-16">
        <Reviews showFullList={true} />
      </main>
      <Footer />
    </div>
  );
}
