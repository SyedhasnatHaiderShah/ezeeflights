"use client";

import React, { useState } from "react";
import { Edit2, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccountTabProps {
  initialData?: {
    name: string;
    displayName?: string;
    email: string;
    emailSite?: string;
  };
}

export function AccountTab({ initialData }: AccountTabProps) {
  const [data, setData] = useState({
    name: initialData?.name || "Khurram Shahzad",
    displayName: initialData?.displayName || "",
    email: initialData?.email || "uaf.khurram@gmail.com",
    emailSite: initialData?.emailSite || "",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-foreground">Account</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="space-y-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">Preferences</h3>
            
            {/* Field: Your Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Your name</Label>
              <div className="relative group">
                <Input 
                  value={data.name} 
                  readOnly 
                  className="bg-muted/30 border-muted group-hover:border-primary/50 transition-colors pr-12 h-12 text-base font-medium"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-red font-bold hover:bg-brand-red/5"
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Field: Display Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium text-muted-foreground">Display name</Label>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </div>
              <div className="relative group">
                <Input 
                  placeholder="e.g. Captain Khurram" 
                  readOnly 
                  className="bg-muted/30 border-muted group-hover:border-primary/50 transition-colors pr-12 h-12 text-base"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-red font-bold hover:bg-brand-red/5"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Field: Email address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email address</Label>
              <div className="relative group">
                <Input 
                  value={data.email} 
                  readOnly 
                  className="bg-muted/30 border-muted group-hover:border-primary/50 transition-colors pr-12 h-12 text-base font-medium"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-red font-bold hover:bg-brand-red/5"
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Field: Email site */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email site</Label>
              <div className="relative group">
                <Input 
                  placeholder="Your preferred email site" 
                  readOnly 
                  className="bg-muted/30 border-muted group-hover:border-primary/50 transition-colors pr-12 h-12 text-base"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-red font-bold hover:bg-brand-red/5"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Illustration Section */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-8 h-full min-h-[400px]">
          <div className="relative w-full max-w-sm aspect-square bg-muted/20 rounded-[2.5rem] p-12 overflow-hidden flex items-center justify-center group">
            {/* Soft background decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
            
            {/* SVG Illustration - A premium minimal traveler desk concept */}
            <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="200" width="300" height="10" rx="5" fill="#E2E8F0" />
              <rect x="100" y="80" width="200" height="150" rx="12" fill="white" stroke="#CBD5E1" strokeWidth="2" />
              <rect x="110" y="90" width="180" height="20" rx="4" fill="#F1F5F9" />
              <circle cx="120" cy="125" r="10" fill="#FFE4E6" />
              <rect x="140" y="120" width="140" height="10" rx="5" fill="#F1F5F9" />
              <circle cx="200" cy="180" r="30" fill="#FED7D7" />
              <rect x="170" y="215" width="60" height="5" rx="2.5" fill="#F87171" />
              <path d="M320 180L350 210L320 240" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-xs italic">
            "Your profile is the key to a more personalized travel experience."
          </p>
        </div>
      </div>
    </div>
  );
}
