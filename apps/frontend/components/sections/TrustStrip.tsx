"use client";

import { motion } from "framer-motion";
import { Lock, Phone, Plane, Shield } from "lucide-react";
import { TrustBadge } from "@/components/ui/trust-badge";

const ITEMS = [
  { icon: Shield, title: "Best Price Guarantee", subtitle: "We'll match any lower price" },
  { icon: Plane, title: "500+ Airlines", subtitle: "Domestic & international" },
  { icon: Lock, title: "Secure Payments", subtitle: "256-bit SSL encryption" },
  { icon: Phone, title: "24/7 Support", subtitle: "Always here to help" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-muted/30 py-4 dark:bg-muted/10">
      <motion.div
        className="mx-auto flex max-w-[1200px] items-center justify-center gap-0 px-4"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        {ITEMS.map((item, idx) => (
          <motion.div key={item.title} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[200px]">
              <TrustBadge icon={item.icon} title={item.title} subtitle={item.subtitle} />
            </div>
            {idx < ITEMS.length - 1 ? <div className="mx-4 hidden h-10 border-r border-border md:block" /> : null}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
