"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Heart, User, PhoneCall, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/flights/result", icon: Search },
  { name: "Support", href: "/support", icon: PhoneCall },
  { name: "Saved", href: "/saved", icon: Heart },
  { name: "Profile", href: "/profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-lg border-t border-border/50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2 sm:px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/")

          return (
            <Link
              key={item.name}
              href={item.href as any}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-b-full bg-primary/20" />
              )}
              
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110" 
                  : "text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              
              <span className={cn(
                "text-[10px] font-bold tracking-tight transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
