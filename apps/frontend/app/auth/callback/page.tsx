"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { oauthExchangeRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";
import { Loader2, Plane } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const processedCodes = new Set<string>();

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Securing your session...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const error = params.get("error");
    const code = params.get("code");

    if (error === "oauth_failed") {
      setMessage("Sign-in cancelled.");
      setIsError(true);
      setTimeout(() => router.replace("/" as any), 1500);
      return;
    }

    if (!code) {
      setMessage("Missing sign-in code.");
      setIsError(true);
      setTimeout(() => router.replace("/" as any), 1500);
      return;
    }

    if (processedCodes.has(code)) {
      return;
    }
    processedCodes.add(code);

    (async () => {
      try {
        const result = await oauthExchangeRequest({ code });
        queryClient.invalidateQueries({ queryKey: ["auth-session"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("show_login_success_toast", "google");
          setTimeout(() => {
            window.sessionStorage.removeItem("show_login_success_toast");
          }, 2000);
        }

        if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
          router.replace("/2fa" as any);
          return;
        }
        let redirectPath = "/";
        if (typeof window !== "undefined") {
          const savedPath = window.sessionStorage.getItem(
            "oauth_redirect_back",
          );
          if (savedPath) {
            redirectPath = savedPath;
            window.sessionStorage.removeItem("oauth_redirect_back");
          }
        }
        router.replace(redirectPath as any);
      } catch {
        setMessage("Session expired.");
        setIsError(true);
        setTimeout(() => router.replace("/" as any), 1500);
      }
    })();
  }, [params, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center z-10 relative w-full">
      <div className="flex items-center justify-center">
        {!isError ? (
          <div className="h-9 w-9 rounded-full border-4 animate-spin border-redmix/30 border-t-redmix dark:border-white/20 dark:border-t-white" />
        ) : (
          <div className="text-2xl">⚠️</div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 relative z-10 w-full px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1 text-center w-full"
          >
            <h3 className="text-xs md:text-sm font-semibold tracking-tight text-redmix/90 dark:text-white">
              {!isError ? "Completing Sign-In" : "Sign-In Failed"}
            </h3>
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">
              {message}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {isError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary text-white px-6 text-xs font-semibold transition-all hover:bg-primary/90 active:scale-[0.98] shadow-md shadow-primary/20"
            href={"/auth/login" as any}
          >
            Try Again
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function OAuthCallbackPageContent() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center w-full p-4 bg-transparent">
      <div className="w-full max-w-md">
        <section className="p-6 md:p-8 relative flex flex-col items-center text-foreground bg-transparent shadow-none border-none">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-8 w-8 text-redmix animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading session...
                </p>
              </div>
            }
          >
            <OAuthCallbackContent />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

// Suspense-wrapped
export default function OAuthCallbackPage(props: any) {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackPageContent {...props} />
    </Suspense>
  );
}
