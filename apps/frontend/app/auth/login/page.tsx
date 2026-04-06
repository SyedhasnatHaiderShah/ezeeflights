"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { SocialAuth } from "@/components/shared/SocialAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h1 className="text-xl font-black font-display tracking-tight text-foreground leading-tight">
          Hey, friend.<br />
          Nice seeing you again<span className="text-redmix">.</span>
        </h1>
        <p className="text-muted-foreground text-xs font-medium tracking-tight">
          Login to access your personalized travel dashboard.
        </p>
      </div>

      {!showEmailForm ? (
        <div className="space-y-6">
          <SocialAuth onEmailClick={() => setShowEmailForm(true)} />
          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href={"/terms" as any} className="text-primary hover:underline font-semibold">Terms of Use</Link>
            {" "}and{" "}
            <Link href={"/privacy" as any} className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
          </p>
          <div className="pt-4 text-center border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              New here?{" "}
              <Link href={"/auth/signup" as any} className="text-redmix hover:underline font-bold">
                Create account
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground ml-0.5">Email Address</label>
              <Input 
                type="email" 
                placeholder="yours@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground ml-0.5">Password</label>
              <Input 
                type="password" 
                placeholder="Min. 8 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-[10px] text-brand-red font-bold animate-shake">{error}</p>}

          <Button 
            type="submit" 
            variant="brand-red" 
            size="lg" 
            className="w-full h-11 rounded-xl"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>

          <button 
            type="button"
            onClick={() => setShowEmailForm(false)}
            className="w-full text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            ← Back to Social Login
          </button>
        </form>
      )}
    </div>
  );
}
