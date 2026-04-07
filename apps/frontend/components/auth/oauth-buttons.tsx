"use client";

import { googleOAuthUrl } from "@/lib/api/auth-api";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/SocialAuth";

export function OAuthButtons() {
  return (
    <div className="space-y-4 pt-4 border-t border-border/50 transition-all duration-300">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium lowercase tracking-widest">
            or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-11 rounded-xl flex items-center justify-center gap-3 border-border text-foreground font-semibold hover:bg-muted/50 transition-all shadow-sm"
        onClick={() => {
          window.location.href = googleOAuthUrl();
        }}
      >
        <GoogleIcon className="w-4 h-4" />
        <span className="text-sm">Google</span>
      </Button>
    </div>
  );
}
