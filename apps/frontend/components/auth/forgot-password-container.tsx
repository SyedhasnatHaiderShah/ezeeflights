"use client";

import { ForgotPasswordFlow } from "@/components/auth/forgot-password-flow";
import { AuthImageGrid } from "@/components/auth/auth-image-grid";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export function ForgotPasswordContainer() {
  return (
    <div className="flex flex-col md:flex-row items-stretch min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full md:w-1/2 lg:w-[45%] p-4 sm:p-12 space-y-5 flex flex-col justify-center"
      >
        <div className="w-full max-w-md mx-auto">
          <ForgotPasswordFlow />
        </div>
      </motion.div>

      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-muted/5 border-l border-border/50 overflow-hidden">
        <AuthImageGrid />
      </div>
    </div>
  );
}
