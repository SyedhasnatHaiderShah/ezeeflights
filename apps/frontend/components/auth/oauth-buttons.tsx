"use client";

import { googleOAuthUrl } from "@/lib/api/auth-api";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { Apple } from "lucide-react";

export function OAuthButtons() {
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
          className="w-1/2 h-11 cursor-pointer rounded-xl flex items-center justify-center gap-3 border-border text-foreground font-semibold hover:bg-muted/50 transition-all shadow-sm"
          onClick={() => {
            window.location.href = googleOAuthUrl();
          }}
        >
          <GoogleIcon className="w-4 h-4" />
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
