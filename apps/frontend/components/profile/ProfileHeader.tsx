"use client";

import React from "react";
import Image from "next/image";
import { Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    homeAirport?: string;
    avatarUrl?: string;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between py-12 px-4 md:px-0">
      <div className="flex-1 space-y-4 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        
        <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account Email
            </span>
            <p className="text-sm font-bold text-foreground">{user.email}</p>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Home Airport
            </span>
            <div className="flex items-center gap-1 text-sm font-bold text-foreground">
              {user.homeAirport || "Singapore, Singapore - Changi"}
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-8 md:mt-0 group cursor-pointer">
        <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-red/20 to-brand-red/40 flex items-center justify-center text-brand-red text-4xl font-bold">
              {user.name.charAt(0)}
            </div>
          )}
          
          {/* Overlay Edit Button */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 p-2 rounded-full shadow-lg">
              <Edit2 className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </div>
        
        {/* Decorative close button seen in KAYAK image */}
        <button className="absolute -top-2 -right-2 p-1.5 bg-background rounded-full border shadow-sm text-muted-foreground hover:text-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
