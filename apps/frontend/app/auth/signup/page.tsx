"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronRight, Mail } from "lucide-react"
import { SocialAuth } from "@/components/shared/SocialAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const FEATURES = [
    "Cheaper prices with member-only discounts",
    "Fast and easy booking with saved details",
    "Free trip planning, synced to all devices",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Sign-up logic here (API call)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-2">
        <h1 className="text-xl font-black font-display tracking-tight text-foreground leading-tight">
          Join the journey<span className="text-redmix">.</span><br />
          Experience more.
        </h1>
        <p className="text-muted-foreground text-xs font-medium tracking-tight">
          Get exclusive benefits and personalized experiences.
        </p>
      </div>

      {!showEmailForm ? (
        <div className="space-y-6">
          <ul className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
            {FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-redmix shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-muted-foreground leading-tight">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <SocialAuth onEmailClick={() => setShowEmailForm(true)} />

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            By joining, you agree to our{" "}
            <Link href={"/terms" as any} className="text-primary hover:underline font-semibold">Terms of Use</Link>
            {" "}and{" "}
            <Link href={"/privacy" as any} className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
          </p>

          <div className="pt-4 text-center border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href={"/auth/login" as any} className="text-redmix hover:underline font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground ml-0.5">Full Name</label>
              <Input 
                name="name"
                placeholder="Name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground ml-0.5">Email Address</label>
              <Input 
                name="email"
                type="email" 
                placeholder="yours@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground ml-0.5">Password</label>
              <Input 
                name="password"
                type="password" 
                placeholder="Min. 8 characters" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="brand-red" size="lg" className="w-full h-11 rounded-xl">
            Create Free Account
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>

          <button 
            type="button"
            onClick={() => setShowEmailForm(false)}
            className="w-full text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            ← View Exclusive Benefits
          </button>
        </form>
      )}
    </div>
  )
}
