"use client";

import { useState } from "react";
import { googleOAuthUrl, nativeGoogleLoginRequest } from "@/lib/api/auth-api";
import { isNative } from "@/lib/capacitor";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { Apple, Loader2 } from "lucide-react";

export function OAuthButtons() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="space-y-4 pt-4 transition-all duration-300">
      <div className="flex items-center justify-center gap-2">
        <span className="flex-1 border-t border-border" />
        <div className="flex justify-center text-xs">
          <span className="text-muted-foreground font-medium tracking-widest">
            or continue with
          </span>
        </div>
        <span className="flex-1 border-t border-border" />
      </div>
      <div className=" flex gap-1 ">
        <Button
          variant="outline"
          disabled={busy}
          className="w-1/2 h-11 cursor-pointer rounded-xl flex items-center justify-center gap-3 border-border text-foreground font-semibold hover:bg-muted/50 transition-all shadow-sm"
          onClick={async () => {
            if (typeof window !== "undefined") {
              // Exclude callback/login pages so we do not loop back to them
              const path = window.location.pathname;
              if (!path.includes("/auth/")) {
                const target = path + window.location.search;
                sessionStorage.setItem("oauth_redirect_back", target);
                document.cookie = `oauth_redirect_back=${encodeURIComponent(target)}; path=/; max-age=300; SameSite=Lax`;
              }
            }

            if (isNative()) {
              try {
                setBusy(true);
                const GoogleSignIn = require("@capawesome/capacitor-google-sign-in").GoogleSignIn;
                try {
                  await GoogleSignIn.initialize({
                    clientId: isNative()
                      ? "593693636053-t2dgq0rjj27unpmjboba26m6g0kefqta.apps.googleusercontent.com"
                      : "1099115700327-vcq7hlpbi16rsecg4l5ie80m01j3pank.apps.googleusercontent.com",
                  });
                } catch (initErr: any) {
                  console.warn("GoogleSignIn initialize failed or already initialized:", initErr);
                  const msg = initErr?.message || String(initErr);
                  if (!msg.toLowerCase().includes("already initialized") && !msg.toLowerCase().includes("initialized")) {
                    toast({
                      title: "Google Sign-In Init Error",
                      description: `Initialization failed: ${msg}. Please make sure to rebuild the Android project in Android Studio (or via 'npx cap run android') to compile the newly linked plugin.`,
                      variant: "destructive",
                    });
                    return;
                  }
                }
                const result = await GoogleSignIn.signIn();
                const idToken = result.idToken;
                if (!idToken) {
                  toast({
                    title: "Google Sign-In Error",
                    description: "No ID token returned. Please check Google Cloud configuration.",
                    variant: "destructive",
                  });
                  return;
                }
                const loginRes = await nativeGoogleLoginRequest(idToken);
                await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
                await queryClient.invalidateQueries({ queryKey: ["profile"] });
                
                if (typeof window !== "undefined") {
                  window.sessionStorage.setItem("show_login_success_toast", "google");
                  setTimeout(() => {
                    window.sessionStorage.removeItem("show_login_success_toast");
                  }, 2000);
                }

                toast({
                  title: "Welcome back!",
                  description: "You have successfully signed in with Google.",
                });

                if ("requiresTwoFactor" in loginRes && loginRes.requiresTwoFactor) {
                  router.push("/2fa");
                  return;
                }

                if (typeof window !== "undefined") {
                  const savedPath = window.sessionStorage.getItem("oauth_redirect_back");
                  if (savedPath) {
                    window.sessionStorage.removeItem("oauth_redirect_back");
                    router.push(savedPath as any);
                    return;
                  }
                }
                router.push("/");
              } catch (err: any) {
                console.error("[capacitor] Native Google Sign In Error:", typeof err === "object" ? JSON.stringify(err) : err, err?.message);
                toast({
                  title: "Google Sign-In Error",
                  description: err?.message || "Failed to sign in with Google.",
                  variant: "destructive",
                });
              } finally {
                setBusy(false);
              }
            } else {
              window.location.href = googleOAuthUrl();
            }
          }}
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <GoogleIcon className="w-4 h-4" />
          )}
          <span className="text-sm">Google</span>
        </Button>
        <Button
          type="button"
          className="h-11 w-1/2 rounded-xl cursor-pointer bg-black text-white hover:bg-black/90"
        >
          <Apple className="h-4 w-4" /> Apple
        </Button>
      </div>
    </div>
  );
}
