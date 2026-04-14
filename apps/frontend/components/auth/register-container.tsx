"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthImageGrid } from "@/components/auth/auth-image-grid";
import { registerRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useToast } from "@/lib/hooks/use-toast";

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

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    } as const,
  },
};

export function RegisterContainer() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await registerRequest({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      toast({
        title: "Registration successful",
        description: "Welcome! Your account has been created.",
        variant: "success",
      });

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      router.push("/" as any);
    } catch (err: any) {
      let message = "Registration failed. Email may already be in use.";

      // Try to parse structured errors from the backend
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          message = Array.isArray(parsed.message)
            ? parsed.message[0]
            : parsed.message;
        }
      } catch {
        // Fallback to the raw error message if it's not JSON
        if (err.message && !err.message.includes("{")) {
          message = err.message;
        }
      }

      setError(message);
      toast({
        title: "Registration Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full md:w-1/2 lg:w-[45%] p-4 sm:p-12 space-y-5 flex flex-col justify-center"
      >
        <div className="w-full max-w-md mx-auto space-y-5">
          <motion.div variants={itemVariants}>
            <RegisterForm
              email={email}
              password={password}
              firstName={firstName}
              lastName={lastName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onSubmit={onSubmit}
              disabled={busy}
              error={error}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-5">
            <p className="text-xs text-center text-brand-dark/80 leading-relaxed px-4">
              By joining, you agree to our{"  "}
              <Link
                href={"/terms" as any}
                className="text-brand-blue hover:underline font-semibold"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                href={"/privacy" as any}
                className="text-brand-blue hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="pt-5 md:pt-10 text-center border-t border-border/50">
              <p className="text-xs text-brand-dark/80 font-medium">
                Already have an account?{" "}
                <Link
                  href={"/auth/login" as any}
                  className="text-redmix text-sm hover:underline font-bold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-muted/5 border-l border-border/50 overflow-hidden">
        <AuthImageGrid />
      </div>
    </div>
  );
}
