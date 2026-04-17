import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
