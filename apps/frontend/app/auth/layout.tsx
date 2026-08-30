import * as React from "react";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="w-full bg-background flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center md:hidden">
            <EzeeFlightsLogo isDarkMode={false} className="w-44 h-auto" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
