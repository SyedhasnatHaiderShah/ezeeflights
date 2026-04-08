"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { FAQSection } from "@/components/sections/FAQSection";
import { Footer } from "@/components/sections/Footer";
import { AppImage } from "@/components/ui/app-image";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export interface AirlineSection {
  title: string;
  paragraphs: string[];
}

export interface AirlineData {
  topImage?: string;
  hero: {
    title: React.ReactNode;
    description: string;
  };
  intro: {
    title: string;
    text: string;
  };
  sections: AirlineSection[];
  conclusion: string;
}

interface AirlinePageTemplateProps {
  data: AirlineData;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function AirlinePageTemplate({ data }: AirlinePageTemplateProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex-grow overflow-hidden">
        <Hero title={data.hero.title} description={data.hero.description} />

        <section className="py-10 bg-background relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-red/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-brand-red/[0.02] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {data.topImage && (
                <motion.div
                  variants={itemVariants}
                  className="relative w-full aspect-[21/10] rounded-2xl sm:rounded-3xl overflow-hidden mb-10 sm:mb-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-border/50 group cursor-pointer"
                >
                  <AppImage
                    src={data.topImage}
                    alt={data.intro.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" />
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mb-12 sm:mb-20">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-6 sm:mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text leading-tight">
                  {data.intro.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground/90 leading-relaxed font-medium">
                  {data.intro.text}
                </p>
              </motion.div>

              <div className="space-y-12 sm:space-y-24">
                {data.sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="w-8 sm:w-12 h-[2px] bg-brand-red rounded-full group-hover:w-16 sm:group-hover:w-20 transition-all duration-500" />
                      <h3 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        {section.title}
                      </h3>
                    </div>

                    <div className="space-y-4 sm:space-y-6 pl-0 sm:pl-8 md:pl-16">
                      {section.paragraphs.map((p, pIdx) => {
                        const isList = p.startsWith("•") || p.startsWith("-");
                        return (
                          <motion.p
                            key={pIdx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * pIdx, duration: 0.5 }}
                            className={
                              isList
                                ? "text-muted-foreground/80 leading-relaxed pl-4 sm:pl-6 border-l-2 border-brand-red/10 hover:border-brand-red/40 transition-colors py-1 text-sm sm:text-base md:text-lg"
                                : "text-muted-foreground/85 leading-relaxed text-sm sm:text-base md:text-lg"
                            }
                          >
                            {p}
                          </motion.p>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  variants={itemVariants}
                  className="pt-10 sm:pt-16 border-t border-border/50"
                >
                  <div className="bg-muted/30 p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] border border-border/40 backdrop-blur-sm">
                    <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                      Final Considerations
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground/90 leading-relaxed italic font-medium quote-text relative pl-6 sm:pl-8 border-l-4 border-brand-red/20">
                      {data.conclusion}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-muted/20">
          <ScrollReveal minHeight="600px">
            <FAQSection />
          </ScrollReveal>
        </section>

        <ScrollReveal minHeight="500px">
          <WhyChooseUs />
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
