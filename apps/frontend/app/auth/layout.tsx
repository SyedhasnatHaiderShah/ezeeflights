import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:min-h-screen min-h-fit bg-background text-foreground transition-colors duration-300">
      <main className="flex-grow-1 flex items-center justify-center relative overflow-hidden bg-brand-gray-light dark:bg-background transition-colors duration-500">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-md md:max-w-4xl lg:max-w-7xl mx-auto">
          <div className="bg-card dark:backdrop-blur-xl md:rounded-md rounded-none shadow-lg border border-border/50 overflow-hidden transition-all hover:shadow-brand-red/5">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
