"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Lock, Headphones, Plane } from "lucide-react";

const TRUST_ITEMS = [
  { icon: BadgeCheck, label: "Best Price Guarantee", sublabel: "We match any lower price" },
  { icon: Plane, label: "500+ Airlines", sublabel: "Domestic & international" },
  { icon: Lock, label: "Secure Payments", sublabel: "256-bit SSL encryption" },
  { icon: Headphones, label: "24/7 Support", sublabel: "Always here to help" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function TrustStrip() {
  return (
    <div className="border-y border-border bg-muted/30 py-4 dark:bg-muted/10">
      <motion.ul
        className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center divide-x divide-border"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {TRUST_ITEMS.map(({ icon: Icon, label, sublabel }) => (
          <motion.li
            key={label}
            variants={itemVariants}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 px-6 py-2 text-center sm:flex-row sm:gap-2 sm:text-left"
          >
            <Icon className="h-5 w-5 shrink-0 text-brand-red" />
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">{sublabel}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
